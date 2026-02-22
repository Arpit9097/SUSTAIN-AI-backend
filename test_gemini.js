import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function test() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Key:", key ? "Found" : "Missing");

    if (!key) return;

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    try {
        const result = await model.generateContent("Hello?");
        const response = await result.response;
        console.log("Response:", response.text());
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
