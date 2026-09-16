import type { ConfigService } from "@nestjs/config";
import { describe, expect, it, vi } from "vitest";

import { CrosswordContentGenerationError } from "../crossword-content-generation.error.js";
import type { CrosswordContentRequest } from "../crossword-content-provider.js";
import { OpenAiCrosswordContentProvider } from "./openai-crossword-content-provider.js";
import type { OpenAiClientFactory } from "./openai-client.js";

describe("OpenAiCrosswordContentProvider", () => {
  const request: CrosswordContentRequest = {
    theme: "Animals",
    difficulty: "medium",
    language: "en" as const,
    wordCount: 2,
  };

  function createFakeClient(create: ReturnType<typeof vi.fn>) {
    return { chat: { completions: { create } } };
  }

  function createProvider(
    create: ReturnType<typeof vi.fn>,
    configOverrides: Partial<{ getOrThrow: (key: string) => string; get: (key: string) => string | undefined }> = {},
  ) {
    const client = createFakeClient(create);
    const createClient = vi.fn(() => client) as unknown as OpenAiClientFactory;
    const configService = {
      getOrThrow: configOverrides.getOrThrow ?? vi.fn(() => "test-api-key"),
      get: configOverrides.get ?? vi.fn(() => undefined),
    } as unknown as ConfigService;

    const provider = new OpenAiCrosswordContentProvider(createClient, configService);

    return { provider, createClient, configService, create };
  }

  function completionWith(content: string) {
    return { choices: [{ message: { content } }] };
  }

  it("maps a valid structured response to CrosswordWord[]", async () => {
    const create = vi.fn().mockResolvedValue(
      completionWith(
        JSON.stringify({
          words: [
            { answer: "CAT", clue: "A small animal" },
            { answer: "DOG", clue: "Man's best friend" },
          ],
        }),
      ),
    );
    const { provider } = createProvider(create);

    const words = await provider.generateWords(request);

    expect(words).toEqual([
      { answer: "CAT", clue: "A small animal" },
      { answer: "DOG", clue: "Man's best friend" },
    ]);
  });

  it("sends the requested theme, difficulty, and wordCount to OpenAI", async () => {
    const create = vi.fn().mockResolvedValue(completionWith(JSON.stringify({ words: [] })));
    const { provider, create: createSpy } = createProvider(create);

    await provider.generateWords(request);

    const [requestBody] = createSpy.mock.calls[0];
    const userMessage = requestBody.messages.find((message: { role: string }) => message.role === "user");

    expect(userMessage.content).toContain("Animals");
    expect(userMessage.content).toContain("medium");
    expect(userMessage.content).toContain("2");
  });

  it("includes a strict json_schema response format in the request", async () => {
    const create = vi.fn().mockResolvedValue(completionWith(JSON.stringify({ words: [] })));
    const { provider, create: createSpy } = createProvider(create);

    await provider.generateWords(request);

    const [requestBody] = createSpy.mock.calls[0];

    expect(requestBody.response_format.type).toBe("json_schema");
    expect(requestBody.response_format.json_schema.strict).toBe(true);
    expect(requestBody.response_format.json_schema.schema).toBeDefined();
  });

  it("passes generated content through normalizeCrosswordWords", async () => {
    const create = vi.fn().mockResolvedValue(
      completionWith(
        JSON.stringify({
          words: [
            { answer: "  cat  ", clue: "  A small animal  " },
            { answer: "invalid-answer", clue: "Should be dropped" },
          ],
        }),
      ),
    );
    const { provider } = createProvider(create);

    const words = await provider.generateWords(request);

    expect(words).toEqual([{ answer: "CAT", clue: "A small animal" }]);
  });

  it("throws CrosswordContentGenerationError when the response is not valid JSON", async () => {
    const create = vi.fn().mockResolvedValue(completionWith("not json"));
    const { provider } = createProvider(create);

    await expect(provider.generateWords(request)).rejects.toBeInstanceOf(
      CrosswordContentGenerationError,
    );
  });

  it("throws CrosswordContentGenerationError when the response structure is unexpected", async () => {
    const create = vi.fn().mockResolvedValue(completionWith(JSON.stringify({ notWords: [] })));
    const { provider } = createProvider(create);

    await expect(provider.generateWords(request)).rejects.toBeInstanceOf(
      CrosswordContentGenerationError,
    );
  });

  it("wraps an OpenAI API failure as CrosswordContentGenerationError", async () => {
    const create = vi.fn().mockRejectedValue(new Error("OpenAI API error"));
    const { provider } = createProvider(create);

    await expect(provider.generateWords(request)).rejects.toBeInstanceOf(
      CrosswordContentGenerationError,
    );
  });

  it("wraps a timeout failure as CrosswordContentGenerationError", async () => {
    const create = vi.fn().mockRejectedValue(new Error("Request timed out"));
    const { provider } = createProvider(create);

    await expect(provider.generateWords(request)).rejects.toBeInstanceOf(
      CrosswordContentGenerationError,
    );
  });

  it("fails clearly when OPENAI_API_KEY is missing", async () => {
    const create = vi.fn();
    const { provider } = createProvider(create, {
      getOrThrow: () => {
        throw new Error('Configuration key "OPENAI_API_KEY" does not exist');
      },
    });

    await expect(provider.generateWords(request)).rejects.toThrow(
      'Configuration key "OPENAI_API_KEY" does not exist',
    );
    expect(create).not.toHaveBeenCalled();
  });
});
