import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import User from "./models/User.js";
import { authenticateUser } from "./middleware/authMiddleware.js";
import connectDB from "./config/db.js";

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.log("API KEY Missing");
  process.exit(1);
}

app.post("/api/users/check-username", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username required" });
    }

    const user = await User.findOne({ username });

    res.json({ exists: !!user });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/users/get-email", async (req, res) => {
  try {

    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username required" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ email: user.email });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }
});

app.post("/api/users", async (req, res) => {

  try {

    const { username, email, firebaseUid } = req.body;

    if (!username || !email || !firebaseUid) {
      return res.status(400).json({
        error: "username, email and firebaseUid required"
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { email },
        { username },
        { firebaseUid }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists"
      });
    }

    const newUser = new User({
      username,
      email,
      firebaseUid
    });

    await newUser.save();

    res.status(201).json(newUser);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});

app.post("/chat", authenticateUser, async (req, res) => {

  try {

    const { message, scores } = req.body;

    if (!message) {
      return res.status(400).json({
        reply: "Message required"
      });
    }

    const prompt = `
You are a sustainability AI assistant.

Composite: ${scores?.composite ?? "N/A"}
Carbon: ${scores?.carbon ?? "N/A"}
Water: ${scores?.water ?? "N/A"}
Energy: ${scores?.energy ?? "N/A"}
Waste: ${scores?.waste ?? "N/A"}
Lifestyle: ${scores?.lifestyle ?? "N/A"}

User Question:
${message}

Give concise sustainability advice.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response";

    res.json({ reply });

  } catch (error) {

    res.status(500).json({
      reply: "Server Error",
      error: error.message
    });

  }

});

// Secure logout endpoint — verifies token before confirming logout
app.post("/api/logout", authenticateUser, (req, res) => {
  // Token is valid (authenticateUser passed), safe to logout
  return res.status(200).json({ message: "Logged out successfully" });
});

app.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);

});