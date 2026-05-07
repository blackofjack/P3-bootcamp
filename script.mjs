import dotenv from "dotenv";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

dotenv.config();

const API_KEY = process.env.GOOGLE_AI_KEY;

const ai = new GoogleGenAI({
    apiKey: API_KEY
});

async function main() {

    try {

        console.log("AI is thinking...");

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "How does AI work?",
            config: {
                thinkingConfig: {
                    thinkingLevel: ThinkingLevel.LOW,
                },
            },
        });

        console.log(response.text);

    } catch (error) {
        console.error("Error:", error);
    }
}

main();

console.log(API_KEY);