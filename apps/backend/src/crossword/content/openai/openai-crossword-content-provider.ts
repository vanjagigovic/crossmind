import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { ChatCompletionMessageParam } from "openai/resources/index.js";

import type { CrosswordWord } from "../../domain/word.js";
import { CrosswordContentGenerationError } from "../crossword-content-generation.error.js";
import type {
  CrosswordContentProvider,
  CrosswordContentRequest,
} from "../crossword-content-provider.js";
import { normalizeCrosswordWords } from "../normalize-crossword-word.js";
import { OPENAI_CLIENT_FACTORY } from "./openai-client.js";
import type { OpenAiClientFactory } from "./openai-client.js";
import type { PuzzleLanguage } from "../../../puzzle/domain/puzzle.js";

const DEFAULT_MODEL = "gpt-4o-mini";

const LANGUAGE_NAMES: Record<PuzzleLanguage, string> = {
  en: "English",
  sr: "Serbian",
  es: "Spanish",
};

// Structured output schema: guarantees shape, not crossword-specific validity (see normalizeCrosswordWords).
const CROSSWORD_WORDS_SCHEMA = {
  type: "object",
  properties: {
    words: {
      type: "array",
      items: {
        type: "object",
        properties: {
          answer: { type: "string" },
          clue: { type: "string" },
        },
        required: ["answer", "clue"],
        additionalProperties: false,
      },
    },
  },
  required: ["words"],
  additionalProperties: false,
};

type ParsedCrosswordWords = { words: unknown[] };

@Injectable()
export class OpenAiCrosswordContentProvider implements CrosswordContentProvider {
  constructor(
    @Inject(OPENAI_CLIENT_FACTORY)
    private readonly createClient: OpenAiClientFactory,
    private readonly configService: ConfigService,
  ) { }

  async generateWords(request: CrosswordContentRequest): Promise<CrosswordWord[]> {
    const apiKey = this.configService.getOrThrow<string>("OPENAI_API_KEY");
    const model = this.configService.get<string>("OPENAI_MODEL") ?? DEFAULT_MODEL;
    const client = this.createClient(apiKey);

    let content: string | null;

    try {
      const completion = await client.chat.completions.create({
        model,
        messages: this.buildMessages(request),
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "crossword_words",
            strict: true,
            schema: CROSSWORD_WORDS_SCHEMA,
          },
        },
      });

      content = completion.choices[0]?.message?.content ?? null;
    } catch (error) {
      throw new CrosswordContentGenerationError(
        "Failed to generate crossword content from OpenAI.",
        { cause: error },
      );
    }

    if (!content) {
      throw new CrosswordContentGenerationError(
        "OpenAI returned an empty crossword content response.",
      );
    }

    return normalizeCrosswordWords(this.parseWords(content));
  }

  private buildMessages(request: CrosswordContentRequest): ChatCompletionMessageParam[] {
    return [
      {
        role: "system",
        content:
          "You generate content for a crossword puzzle. Every answer must be a single " +
          "word using only the letters A-Z, with no spaces, hyphens, numbers, diacritics, or other " +
          "punctuation. If the selected language normally uses accented or special letters, " +
          "normalize the answer to plain A-Z letters while keeping the clue natural and correctly " +
          "written in the selected language. Avoid proper nouns unless the requested theme clearly requires " +
          "them. Clues must be concise, unambiguous, and must never contain the answer " +
          "word itself. Prefer a varied mix of answer lengths, roughly 4 to 10 letters, " +
          "so the words can be placed in a crossing grid.",
      },
      {
        role: "user",
        content:
          `Generate exactly ${request.wordCount} crossword entries for the theme ` +
          `"${request.theme}" at ${request.difficulty} difficulty. ` +
          `Generate both the answers and clues in ${LANGUAGE_NAMES[request.language]}.`,
      },
    ];
  }

  private parseWords(content: string): CrosswordWord[] {
    let parsed: unknown;

    try {
      parsed = JSON.parse(content);
    } catch (error) {
      throw new CrosswordContentGenerationError(
        "OpenAI returned a response that could not be parsed as JSON.",
        { cause: error },
      );
    }

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !Array.isArray((parsed as Partial<ParsedCrosswordWords>).words)
    ) {
      throw new CrosswordContentGenerationError(
        "OpenAI returned a response with an unexpected structure.",
      );
    }

    return (parsed as ParsedCrosswordWords).words.map((word) => {
      const entry = word as { answer?: unknown; clue?: unknown };

      return {
        answer: typeof entry.answer === "string" ? entry.answer : "",
        clue: typeof entry.clue === "string" ? entry.clue : "",
      };
    });
  }
}
