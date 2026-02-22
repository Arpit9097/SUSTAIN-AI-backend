import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.log("No key found");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.error) {
            console.error("API Error:", data.error.message);
        } else {
            console.log("Models:", data.models?.map(m => m.name) || "No models found");
        }
    } catch (error) {
        console.error("Request Error:", error);
    }
}

listModels();
