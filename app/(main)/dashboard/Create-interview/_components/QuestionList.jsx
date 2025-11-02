import { Loader2Icon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import QuestionListContainer from './QuestionListContainer';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/services/supabaseClient'
import {useUser} from '@/app/provider'
function QuestionList({ formData,onCreateLink}) {
    const [loading, setLoading] = useState(true);
    const [questionList, setQuestionList] = useState([]);
    const [error, setError] = useState(null);
    const{user}=useUser();
    const [saveLoading, setSaveLoading] = useState(false);
    
    useEffect(() => {
        if (formData) {
            GenerateQuestionList();
        } else {
            setLoading(false);
        }
    }, [formData]);

    
    const processResponse = (data) => {
        console.log("Processing response:", data);
        
        // Step 1: Check if data is wrapped in a content property
        if (data && data.content && typeof data.content === 'string') {
            console.log("Found content property, extracting JSON");
            const contentStr = data.content;
            
            // Remove code block markers and extract the JSON
            const jsonMatch = contentStr.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch && jsonMatch[1]) {
                try {
                    const parsedContent = JSON.parse(jsonMatch[1].trim());
                    console.log("Successfully parsed nested JSON:", parsedContent);
                    
                    if (parsedContent.interviewQuestions) {
                        return parsedContent.interviewQuestions;
                    }
                } catch (e) {
                    console.error("Error parsing nested JSON:", e);
                }
            }
            
            // If we couldn't extract JSON with regex, try a different approach
            try {
                const cleanedContent = contentStr
                    .replace(/```json\n|\n```/g, '')
                    .trim();
                    
                const parsedContent = JSON.parse(cleanedContent);
                console.log("Parsed cleaned content:", parsedContent);
                
                if (parsedContent.interviewQuestions) {
                    return parsedContent.interviewQuestions;
                }
            } catch (e) {
                console.error("Error parsing cleaned content:", e);
            }
        }
        
        // If the above special case doesn't work, try normal processing
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                if (parsed.interviewQuestions) {
                    return parsed.interviewQuestions;
                } else if (Array.isArray(parsed)) {
                    return parsed;
                }
            } catch (e) {
                console.error("Error parsing string data:", e);
            }
        } else if (data && typeof data === 'object') {
            if (data.interviewQuestions) {
                return data.interviewQuestions;
            } else if (Array.isArray(data)) {
                return data;
            }
        }
        
        console.log("No questions found in response");
        return [];
    };
    
    const GenerateQuestionList = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("Sending request with data:", formData);

            const result = await axios.post('/api/ai-model', {
                ...formData
            });

            console.log("API Response data:", result.data);

            // Process the response to extract questions
            const processedQuestions = processResponse(result.data);
            console.log("Processed questions:", processedQuestions);

            setQuestionList(processedQuestions);

            if (processedQuestions.length === 0) {
                setError("No questions were generated. Please try again with different criteria.");
            }

            setLoading(false);
        } catch (e) {
            console.error("Error generating questions:", e);

            // Extract more specific error message
            let errorMessage = "Server Error! Please try again later.";

            if (e.response?.data?.error) {
                errorMessage = e.response.data.error;
            } else if (e.message) {
                errorMessage = e.message;
            }

            console.error("Detailed error:", errorMessage);
            setError(errorMessage);
            toast.error(errorMessage);
            setLoading(false);
        }
    };
    const onFinish=async()=>{
        setSaveLoading(true);
        const interview_id=uuidv4();

        const { error } = await supabase
        .from('Interviews')
        .insert([
        {
            ...formData,
            questionList: questionList,
            userEmail:user?.email,
            interview_id:interview_id
        },
        ])
        .select()

        if (error) {
            console.error('Error saving interview:', error);
            toast.error('Failed to save interview. Please try again.');
            setSaveLoading(false);
            return;
        }

        setSaveLoading(false);
        toast.success('Interview created successfully!');
        onCreateLink(interview_id);
    }
    
    // Function to retry question generation
    const handleRetry = () => {
        if (formData) {
            GenerateQuestionList();
        }
    };
    
    return (
        <div className="w-full">
            {loading && (
                <div className='p-5 bg-amber-50 rounded-xl border border-amber-200'>
                    <div className='flex gap-5 items-center'>
                        <div>
                            <Loader2Icon className='animate-spin text-orange-500 h-8 w-8' />
                        </div>
                        <div>
                            <h2 className='text-lg font-semibold text-amber-800'>
                                Generating Questions...
                            </h2>
                            <p className='text-amber-700'>Questions are Getting Crafted Based On Your Preference.</p>
                        </div>
                    </div>
                </div>
            )}
            
            {!loading && error && (
                <div className='p-5 bg-red-50 rounded-xl border border-red-200 mt-4'>
                    <h2 className='text-lg font-semibold text-red-800'>Error</h2>
                    <p className='text-red-700 mb-3'>{error}</p>
                    <button 
                        onClick={handleRetry}
                        className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors'
                    >
                        Try Again
                    </button>
                </div>
            )}
            
            {!loading && !error && questionList && questionList.length > 0 && (
                <div className='mt-6'>
                    <QuestionListContainer questionList={questionList} />
                    <div className='flex justify-end mt-10'> 
                        <Button  onClick={()=>onFinish()} disabled={saveLoading}>
                            {saveLoading && <Loader2Icon className='animate-spin text-white h-4 w-4 mr-2' />}
                            Create Interview Link
                        </Button>
                        </div>
                </div>
            )}
            
            {!loading && !error && (!questionList || questionList.length === 0) && (
                <div className='p-8 mt-6 text-center bg-gray-50 rounded-lg border border-gray-200'>
                    <h3 className='text-lg font-medium text-gray-600'>No questions generated</h3>
                    <p className='text-gray-500 mt-2'>The server didn't return any questions. Please try again with different criteria.</p>
                    <button 
                        onClick={handleRetry}
                        className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
}

export default QuestionList;