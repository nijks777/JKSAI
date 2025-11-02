import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY
});

// Define your prompt template
const QUESTIONS_PROMPT = `You are an expert technical interviewer.
Based on the following inputs, generate a well-structured list of high-quality interview questions:
Job Title: {{jobTitle}}
Job Description:{{jobDescription}}
Interview Duration: {{duration}}
Interview Type: {{type}}
👉 Your task:
Analyze the job description to identify key responsibilities, required skills, and expected experience.
Generate a list of interview questions depends on interview duration.
Adjust the number and depth of questions to match the interview duration.
Ensure the questions match the tone and structure of a real-life {{type}} interview.
♻️ Format your response in JSON format with array list of questions.
format: interviewQuestions=[
{
question:",
type:'Technical/Behavioral/SystemDesign/Cultural Fit/LeaderShip'
},{
...
}]
🎯 The goal is to create a structured, relevant, and time-optimized interview plan for a {{jobTitle}} role`;

export async function POST(req) {
    try {
        const body = await req.json();
        const {jobPosition, jobDescription, duration, type, prompt} = body;

        // Check if this is a simple prompt request (for job description generation)
        if (prompt && !jobPosition) {
            console.log("Simple prompt request:", prompt);

            const response = await anthropic.messages.create({
                model: "claude-sonnet-4-20250514",
                max_tokens: 1024,
                messages: [
                    {
                        role: "user",
                        content: `You are a helpful assistant. Provide clear, concise responses.\n\n${prompt}`
                    }
                ]
            });

            const content = response.content[0].text;
            console.log("AI Response:", content);

            // Return the plain text content for job description
            return NextResponse.json(content);
        }

        // Otherwise, handle interview questions generation
        const FINAL_PROMPT = QUESTIONS_PROMPT.replace("{{jobTitle}}", jobPosition || "")
            .replace("{{jobDescription}}", jobDescription || "")
            .replace("{{duration}}", duration || "")
            .replace("{{type}}", Array.isArray(type) ? type.join(", ") : type || "");

        console.log("Final Prompt for Questions:", FINAL_PROMPT);

        const response = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4096,
            messages: [
                {
                    role: "user",
                    content: `You must respond with valid JSON only. No markdown, no text, just JSON.\n\n${FINAL_PROMPT}`
                }
            ]
        });

        console.log("AI Response:", response.content[0]);

        // Get the content from the response
        const content = response.content[0].text;

        // Try to parse as JSON first
        try {
            // If it's already valid JSON, just parse it
            const parsedData = JSON.parse(content);
            return NextResponse.json(parsedData);
        } catch (parseError) {
            // If not valid JSON, check for special format
            if (content.includes("interviewQuestions=[")) {
                try {
                    // Extract the array part
                    const match = content.match(/interviewQuestions=(\[[\s\S]*\])/);
                    if (match) {
                        const jsonArray = match[1];
                        // Parse the array and return it in proper JSON format
                        const parsedArray = JSON.parse(jsonArray);
                        return NextResponse.json({ interviewQuestions: parsedArray });
                    }
                } catch (e) {
                    console.error("Error parsing array format:", e);
                }
            }

            // If all parsing attempts fail, return the raw content
            return NextResponse.json({ content: content });
        }
    } catch (e) {
        console.error("Full error:", e);
        return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
    }
}