import { FEEDBACK_PROMPT } from "@/services/Constants";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
    const { conversation } = await req.json();
    const FINAL_PROMPT = FEEDBACK_PROMPT.replace('{{conversation}}', JSON.stringify(conversation));

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4.1-nano",
            max_tokens: 4096,
            messages: [
                {
                    role: "system",
                    content: "You are a technical interview evaluator. Respond with ONLY valid JSON without any markdown formatting, code blocks, or additional text. Your response must be parseable directly by JSON.parse() without any cleaning."
                },
                {
                    role: "user",
                    content: FINAL_PROMPT
                }
            ]
        });

        let content = response.choices[0].message.content;
        content = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();

        try {
            const parsedData = JSON.parse(content);

            if (parsedData.feedback && parsedData.feedback.rating) {
                const ratingFields = ['technicalSkills', 'communication', 'problemSolving', 'experience', 'total'];
                for (const field of ratingFields) {
                    if (!parsedData.feedback.rating[field] ||
                        typeof parsedData.feedback.rating[field] !== 'number' ||
                        parsedData.feedback.rating[field] < 1 ||
                        parsedData.feedback.rating[field] > 10) {

                        if (field === 'total') {
                            const availableRatings = Object.entries(parsedData.feedback.rating)
                                .filter(([key, value]) => key !== 'total' && typeof value === 'number');
                            if (availableRatings.length > 0) {
                                const sum = availableRatings.reduce((acc, [_, val]) => acc + val, 0);
                                parsedData.feedback.rating.total = Math.round(sum / availableRatings.length);
                            } else {
                                parsedData.feedback.rating.total = 5;
                            }
                        } else {
                            parsedData.feedback.rating[field] = 5;
                        }
                    }
                }
            }

            return NextResponse.json(parsedData);
        } catch (parseError) {
            console.error("Error parsing JSON:", parseError);

            try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return NextResponse.json(JSON.parse(jsonMatch[0]));
                }
            } catch (extractError) {
                console.error("Error extracting JSON:", extractError);
            }

            return NextResponse.json({
                feedback: {
                    rating: { technicalSkills: 5, communication: 5, problemSolving: 5, experience: 5, total: 5 },
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
                rating: { technicalSkills: 5, communication: 5, problemSolving: 5, experience: 5, total: 5 },
                summary: "Unable to evaluate interview due to system error.",
                recommendation: "No",
                recommendationMsg: "Unable to make recommendation due to system error."
            },
            error: e.message || "Unknown error"
        }, { status: 500 });
    }
}
