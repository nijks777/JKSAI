"use client"
import React, { useState } from 'react'
import { useContext } from 'react'
import { InterviewDataContext } from '@/context/InterviewDataContext'
import {Timer} from 'lucide-react'
import Image from 'next/image'
import { Mic, PhoneOff } from 'lucide-react'
import Vapi from "@vapi-ai/web";
import { useEffect } from 'react'
// AlertConfirmation component removed as it's not needed
import { toast } from 'sonner'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { supabase } from '@/services/supabaseClient'
import { useRouter } from 'next/navigation'

function StartInterview() {
    const {interviewInfo, setInterviewInfo} = useContext(InterviewDataContext);
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
    const [activeUser, setActiveUser] = useState(false);
    const [conversation, setConversation] = useState();
    const {interview_id} = useParams();
    const router = useRouter();
    const [isInterviewEnded, setIsInterviewEnded] = useState(false);
    
    useEffect(() => {
        interviewInfo && startCall();
    }, [interviewInfo])
    
    const startCall = async () => {
        let questionList;
        interviewInfo?.interviewData?.questionList.forEach((item,index)=>(
            questionList=item?.question+","+questionList
        ));
        const assistantOptions = {
            name: "AI Recruiter",
            firstMessage: "Hi "+interviewInfo?.userName+", how are you? Ready for your interview on "+interviewInfo?.interviewData?.jobPosition+"?",
            transcriber: {
                provider: "deepgram",
                model: "nova-2",
                language: "en-US",
            },
            voice: {
                provider: "playht",
                voiceId: "jennifer",
            },
            model: {
                provider: "openai",
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: `
        You are an AI voice assistant conducting interviews.
        Your job is to ask candidates provided interview questions and assess their responses.
        
        Begin the conversation with a friendly introduction, setting a relaxed yet professional tone. Example:
        "Hi there! Welcome to your `+interviewInfo?.interviewData?.jobPosition+` interview. Let's get started with a few questions!"
        
        Ask one question at a time and wait for the candidate's response before proceeding. Keep the questions clear and concise. Below are the questions; ask one by one:
        Questions: `+questionList+`
        
        IMPORTANT INSTRUCTIONS FOR HANDLING "I DON'T KNOW" RESPONSES:
        - If a candidate says they don't know the answer, DO NOT provide the correct answer.
        - NEVER reveal the answers to questions the candidate cannot answer.
        - Instead, acknowledge their response briefly and MOVE TO THE NEXT QUESTION immediately.
        - Example response: "That's okay. Let's move on to the next question."
        
        For partially correct answers, you may offer a small hint or rephrase the question without giving away the answer. Example:
        "You're on the right track. Perhaps think about how React's virtual DOM works?"
        
        Provide brief, encouraging feedback after each answer. Example:
        "Nice! That's a solid answer."
        "Hmm, that's not quite right, but let's move forward."
        
        Keep the conversation natural and engaging—use casual phrases like "Alright, next up..." or "Let's tackle a different question!"
        
        After 5+ questions, wrap up the interview smoothly by summarizing their performance. Example:
        "That was great! You handled some tough questions well. Keep sharpening your skills!"
        
        End on a positive note:
        "Thanks for chatting! Hope to see you crushing projects soon!"
        
        Key Guidelines:
        ✅ Be friendly, engaging, and conversational
        ✅ NEVER provide answers when candidates say they don't know
        ✅ When a candidate cannot answer, acknowledge briefly and move to the next question
        ✅ Adapt based on the candidate's confidence level
        ✅ Ensure the interview remains focused on React
        `.trim(),
                    },
                ],
            },
        };
        vapi.start(assistantOptions)
    }        
    
    const stopInterview = () => {
        toast.info("Ending interview...");
        
        // First, manually trigger the feedback generation to ensure it happens
        GenerateFeedback();
        
        // Then stop the Vapi call
        vapi.stop();
    }
    
    useEffect(() => {
        // Set up event listeners when the component mounts
        const setupEventListeners = () => {
            vapi.on("call-start", () => {
                console.log("Call has started.");
                toast("Call has started.");
            });
            
            vapi.on("speech-start", () => {
                console.log("Assistant speech has started.");
                setActiveUser(false);
            });
            
            vapi.on("speech-end", () => {
                console.log("Assistant speech has ended.");
                setActiveUser(true);
            });
            
            vapi.on("call-end", () => {
                console.log("Call has ended.");
                toast('Interview Ended');
            });
            
            vapi.on("message", (message) => {
                console.log(message);
                setConversation(message);
            });
        };
        
        setupEventListeners();
    }, []);
    
    // Remove this since we're now setting up event listeners in useEffect
    
    const GenerateFeedback = async () => {
        try {
            // Add a loading toast
            toast.loading("Generating interview feedback...");
            
            // Create a simple feedback object if conversation is not available
            if (!conversation) {
                console.log("No conversation data available, creating placeholder");
                
                // Create a fallback feedback object for Supabase
                const feedbackData = {
                    userName: interviewInfo?.userName || "Unknown",
                    userEmail: interviewInfo?.userEmail || "unknown@example.com",
                    interview_id: interview_id,
                    feedback: JSON.stringify({
                        summary: "Interview was completed, but detailed conversation data was not available.",
                        strengths: ["Completed the interview process"],
                        improvements: ["Technical issue prevented detailed feedback"]
                    }),
                    recommended: false
                };
                
                console.log("Inserting fallback feedback data into Supabase");
                
                const { data, error } = await supabase
                    .from('interview-feedback')
                    .insert([feedbackData])
                    .select();
                
                if (error) {
                    console.error("Supabase error:", error);
                    toast.error("Failed to save feedback");
                } else {
                    console.log("Inserted fallback data:", data);
                    toast.success("Interview completed");
                    
                    // FIXED: Updated path to include interview_id
                    router.replace(`/interview/${interview_id}/completed`);
                }
                
                return;
            }
            
            // If conversation data exists, proceed with API call
            const result = await axios.post('/api/ai-feedback', {
                conversation: conversation,
            });
            
            console.log("API Response:", result?.data);
            const Content = result.data;
            
            // Fix: Check if Content is already an object
            let parsedContent;
            
            if (typeof Content === 'object' && Content !== null) {
                // Content is already an object, convert to string for Supabase
                parsedContent = JSON.stringify(Content);
            } else if (typeof Content === 'string') {
                // Validate that the string is valid JSON
                try {
                    // Try parsing and then stringify again to ensure valid format
                    const parsed = JSON.parse(Content);
                    parsedContent = JSON.stringify(parsed);
                } catch (e) {
                    console.error("Failed to parse JSON string:", e);
                    // If it fails, it might be a string with markdown code blocks
                    if (Content.includes('```json') && Content.includes('```')) {
                        // Remove markdown formatting and try again
                        const cleanedContent = Content.replace(/```json|```/g, '').trim();
                        try {
                            const parsed = JSON.parse(cleanedContent);
                            parsedContent = JSON.stringify(parsed);
                        } catch (e2) {
                            console.error("Failed to parse cleaned JSON:", e2);
                            // Create a fallback object as a string for Supabase
                            parsedContent = JSON.stringify({ error: "Invalid JSON format" });
                        }
                    } else {
                        // Create a fallback object as a string for Supabase
                        parsedContent = JSON.stringify({ error: "Invalid JSON format" });
                    }
                }
            } else {
                // Handle unexpected data type
                parsedContent = JSON.stringify({ error: "Unexpected data type" });
            }
            
            console.log("Final parsed content type:", typeof parsedContent);
            console.log("Final parsed content:", parsedContent);
            
            // Create a properly formatted object for Supabase
            const feedbackData = {
                userName: interviewInfo?.userName || "Unknown",
                userEmail: interviewInfo?.userEmail || "unknown@example.com",
                interview_id: interview_id,
                feedback: parsedContent, // This is now a string
                recommended: false
            };
            
            console.log("Supabase insertion data:", feedbackData);
            
            // Now insert into Supabase
            const { data, error } = await supabase
                .from('interview-feedback')
                .insert([feedbackData])
                .select();
            
            if (error) {
                console.error("Supabase error:", error);
                toast.error("Failed to save feedback");
            } else {
                console.log("Inserted data:", data);
                toast.success("Interview completed successfully");
                
                // FIXED: Updated path to include interview_id
                router.replace(`/interview/${interview_id}/completed`);
            }
        } catch (err) {
            console.error("Error in GenerateFeedback:", err);
            toast.error("An error occurred while generating feedback");
            
            // Even if there's an error, redirect to completed page after a short delay
            // FIXED: Updated path to include interview_id
            setTimeout(() => {
                router.replace(`/interview/${interview_id}/completed`);
            }, 2000);
        }
    }
    
    return (
        <div className='p-20 lg:px-48 xl:px-56'>
            <h2 className='font-bold text-xl flex justify-between items-center'>
                AI Interview <span>
                    <Timer/>
                    00:00:00</span>
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-7 mt-5 '>
                <div className='bg-white h-[400px] rounded-2xl border flex flex-col gap-3 items-center justify-center'>
                    <div className='relative'>
                        {!activeUser && (
                            <span className="absolute -inset-1 rounded-full bg-blue-500 opacity-75 animate-ping"/>
                        )}
                        <Image 
                            src='/agent3.jpg' 
                            alt='ai' 
                            width={100} 
                            height={100} 
                            className='rounded-full object-cover relative z-10'
                            style={{ borderRadius: '50%' }}
                        />
                    </div>
                    <h2 className='text-xl font-semibold'>AI RECRUITER</h2>
                </div>

                <div className='bg-white h-[400px] rounded-2xl border flex flex-col items-center justify-center gap-4'>
                    <div className='relative'>
                        {activeUser && (
                            <span className="absolute -inset-1 rounded-full bg-blue-500 opacity-75 animate-ping"/>
                        )}
                        <div className='text-2xl bg-blue-500 text-white p-3 rounded-full w-16 h-16 flex items-center justify-center relative z-10'>
                            {interviewInfo?.userName ? interviewInfo.userName[0] : "U"}
                        </div>
                    </div>
                    <h2 className='text-xl font-semibold'>{interviewInfo?.userName || "User"}</h2>
                </div>
            </div>
            <div className="flex items-center justify-center w-full">
                <div className='flex gap-4 mt-10'>
                    <div className='bg-blue-500 p-3 rounded-full cursor-pointer hover:bg-blue-600 transition-colors'>
                        <Mic className='text-white' size={24} />
                    </div>
                    <div 
                        onClick={stopInterview}
                        className='bg-red-500 p-3 rounded-full cursor-pointer hover:bg-red-600 transition-colors'
                    >
                        <PhoneOff className='text-white' size={24} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StartInterview