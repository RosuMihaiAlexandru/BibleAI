import { NextRequest, NextResponse } from "next/server";

// Import OpenAI client
const OpenAI = require("openai");



export async function POST(req: NextRequest) {
  const openai = new OpenAI();
  // Get the prompt field from the request body
  const reqBody = await req.json();
  const { userPrompt, type } = reqBody;

  // Enhance the prompt with contextual clues and constraints
  const enhancedPrompt = `${userPrompt}l` 

  try {
    // Make a call to OpenAI's ChatGPT model (GPT-4 or GPT-3.5)
    const response = await openai?.chat?.completions?.create({
      model: "gpt-4", // You can use "gpt-4" or "gpt-3.5-turbo" based on your needs
      messages: [
        !type ? { role: "system", content:  "You are an AI that provides responses based on biblical texts." }:
        { role: "system", content:  `You are an AI that provides meaning of these words/text from a ${type} perspective.` },
        { role: "user", content: enhancedPrompt },
      ],
      max_tokens: 200, // Limit the number of tokens for the response
    });

    // Extract the content from the API response
    const text = response.choices[0].message.content || "No response";

    // Return the response as JSON
    return NextResponse.json({
      text,
    });
  } catch (error) {
    return NextResponse.json({
      text: error.message,
    });
  }
}