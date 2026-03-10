import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini SDK. It automatically uses process.env.GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const media = formData.get("media") as File;

    if (!media) {
      return NextResponse.json({ error: "No media file provided" }, { status: 400 });
    }

    // Convert file to base64 for Gemini
    const bytes = await media.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");

    const mimeType = media.type;
    
    // Check if valid model input
    if (!mimeType.startsWith("image/") && !mimeType.startsWith("video/")) {
        return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    // Call Gemini Vision Model (gemini-1.5-flash is best for multi-modal quick tasks)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert, high-end interior designer. Analyze the provided image or video of this room.
      Pay close attention to:
      1. The amount and quality of natural light.
      2. The texture and color of the floors (e.g., wood, tile, carpet).
      3. The style and color palette of any existing furniture or fixtures.

      Based on this analysis, recommend exactly 3 perfect wall paint colors for this specific room.
      
      Output your response ONLY as a JSON array of 3 objects, with no additional markdown, text, or formatting.
      Each object must have these exactly these keys:
      - "hex": The precise hex color code starting with '#' (make sure it's a realistic, beautiful wall paint color).
      - "vibe": A creative, evocative, premium name for the color vibe (e.g., "Sunset Terracotta", "Nordic Mist", "Sage Sanctuary").
      - "explanation": A 1-sentence explanation of why this specific color works well for this room based on your analysis of the lighting/floors/furniture.

      Example output:
      [
        {
          "hex": "#E8ECEF",
          "vibe": "Nordic Mist",
          "explanation": "This soft gray-blue reflects the abundant natural light while complementing the warm oak floors."
        },
        ...
      ]
    `;

    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      },
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();

    console.log("Raw Gemini Response:", responseText);

    // Parse the JSON. Gemini might wrap it in ```json ... ``` despite instructions.
    let jsonStr = responseText.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const colors = JSON.parse(jsonStr);

    return NextResponse.json({ colors });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze media" },
      { status: 500 }
    );
  }
}
