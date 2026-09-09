import OpenAI from "openai";

export const OPENAI_CLIENT_FACTORY = Symbol("OPENAI_CLIENT_FACTORY");

export const OPENAI_REQUEST_TIMEOUT_MS = 15_000;

export type OpenAiClientFactory = (apiKey: string) => OpenAI;

export const defaultOpenAiClientFactory: OpenAiClientFactory = (apiKey) =>
  new OpenAI({ apiKey, timeout: OPENAI_REQUEST_TIMEOUT_MS });
