import { FEEDBACK_PROMPT } from "@/services/Constants";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY
});

export async function POST(req) {
    const { conversation } = await req.json();
    const FINAL_PROMPT = FEEDBACK_PROMPT.replace('{{conversation}}', JSON.stringify(conversation));

    try {
        const response = await anthropic.messages.create({
            model: "claude-3-5-haiku-20241022",
            max_tokens: 4096,
            messages: [
                {
                    role: "user",
                    content: `You are a technical interview evaluator. Respond with ONLY valid JSON without any markdown formatting, code blocks, or additional text. Your response must be parseable directly by JSON.parse() without any cleaning.\n\n${FINAL_PROMPT}`
                }
            ]
        });

        console.log("AI Response:", response.content[0]);

        // Get the content from the response
        let content = response.content[0].text;
        
        // Clean the content to remove any markdown code blocks or extra formatting
        content = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
        
        // Try to parse as JSON first
        try {
            // If it's already valid JSON, just parse it
            const parsedData = JSON.parse(content);
            
            // Verify the structure has all required fields and proper rating values
            if (parsedData.feedback && parsedData.feedback.rating) {
                // Make sure all ratings are between 1-10
                const ratingFields = ['technicalSkills', 'communication', 'problemSolving', 'experience', 'total'];
                for (const field of ratingFields) {
                    // If field is missing or not a number between 1-10, set a default
                    if (!parsedData.feedback.rating[field] || 
                        typeof parsedData.feedback.rating[field] !== 'number' ||
                        parsedData.feedback.rating[field] < 1 ||
                        parsedData.feedback.rating[field] > 10) {
                        
                        // Use average of other ratings for total if missing
                        if (field === 'total') {
                            const availableRatings = Object.entries(parsedData.feedback.rating)
                                .filter(([key, value]) => key !== 'total' && typeof value === 'number');
                            
                            if (availableRatings.length > 0) {
                                const sum = availableRatings.reduce((acc, [_, val]) => acc + val, 0);
                                parsedData.feedback.rating.total = Math.round(sum / availableRatings.length);
                            } else {
                                parsedData.feedback.rating.total = 5; // Default if no other ratings
                            }
                        } else {
                            parsedData.feedback.rating[field] = 5; // Default for other fields
                        }
                    }
                }
            }
            
            return NextResponse.json(parsedData);
        } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            
            // Try to extract JSON using regex if the model wrapped it with markdown or text
            try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const extractedJson = jsonMatch[0];
                    const parsedJson = JSON.parse(extractedJson);
                    return NextResponse.json(parsedJson);
                }
            } catch (extractError) {
                console.error("Error extracting JSON:", extractError);
            }
            
            // If all parsing attempts fail, create a valid fallback response
            return NextResponse.json({ 
                feedback: {
                    rating: {
                        technicalSkills: 5,
                        communication: 5,
                        problemSolving: 5,
                        experience: 5,
                        total: 5
                    },
                    summary: "Unable to evaluate interview due to response parsing error.",
                    recommendation: "No",
                    recommendationMsg: "Unable to make recommendation due to system error."
                },
                error: "Failed to parse AI response as JSON"
            });
        }
    } catch (e) {
        console.error("Full error:", e);
        return NextResponse.json({ 
            feedback: {
                rating: {
                    technicalSkills: 5,
                    communication: 5,
                    problemSolving: 5,
                    experience: 5,
                    total: 5
                },
                summary: "Unable to evaluate interview due to system error.",
                recommendation: "No",
                recommendationMsg: "Unable to make recommendation due to system error."
            },
            error: e.message || "Unknown error" 
        }, { status: 500 });
    }
}