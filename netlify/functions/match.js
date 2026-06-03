import { existsSync, readFileSync } from "node:fs";

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

function readLocalEnvFile() {
  try {
    const envPath = new URL("../../.env", import.meta.url);

    if (!existsSync(envPath)) {
      return {};
    }

    const contents = readFileSync(envPath, "utf8");
    const entries = {};

    for (const line of contents.split(/\r?\n/)) {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmedLine.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmedLine.slice(0, separatorIndex).trim();
      const value = trimmedLine.slice(separatorIndex + 1).trim();

      entries[key] = value;
    }

    return entries;
  } catch (error) {
    console.error("Failed to read local .env file:", error);
    return {};
  }
}

function collectApiKeys(localEnv) {
  return [
    localEnv.GEMINI_API_KEY,
    localEnv.GEMINII_API_KEY,
    process.env.GEMINI_API_KEY,
    process.env.GEMINII_API_KEY,
  ].filter((value, index, array) => value && array.indexOf(value) === index);
}

function parseGeminiError(rawError) {
  let errorMessage = "Something went wrong. Please try again.";

  try {
    const parsedError = JSON.parse(rawError);
    errorMessage = parsedError?.error?.message || errorMessage;
  } catch {
    if (rawError.trim()) {
      errorMessage = rawError;
    }
  }

  return errorMessage;
}

export default async (request, context) => {
  try {
    const localEnv = readLocalEnvFile();
    const apiKeys = collectApiKeys(localEnv);

    // Reject non-POST requests
    if (request.method !== "POST")
      return Response.json({ error: "Method not allowed" }, { status: 405 });

    // Check the API key is configured
    if (apiKeys.length === 0)
      return Response.json({ error: "API key not configured" }, { status: 500 });

    // Parse and validate the prompt
    const { prompt } = await request.json();
    if (typeof prompt !== "string" || !prompt.trim())
      return Response.json({ error: "Bad request" }, { status: 400 });

    let lastError = {
      error: "Something went wrong. Please try again.",
      status: 500,
    };

    for (const apiKey of apiKeys) {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return Response.json(data);
      }

      const rawError = await response.text();
      const errorMessage = parseGeminiError(rawError);

      console.error(`Gemini error (${response.status}):`, rawError);

      lastError = {
        error: errorMessage,
        status: response.status,
      };

      if (![401, 403, 429].includes(response.status)) {
        break;
      }
    }

    return Response.json(
      { error: lastError.error },
      { status: lastError.status },
    );
  } catch (error) {
    console.error("Function error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
};
