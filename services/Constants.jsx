import {Calendar,LayoutDashboard, Settings, WalletCards,List,Code2Icon,StarIcon,UsersIcon,LayoutIcon,User2Icon} from "lucide-react";
export const sideBarOptions=[
    {
     name:"Dashboard",
     icon:LayoutDashboard,
     path:'/dashboard'
    },
    {
        name:"Scheduled Interview",
        icon:Calendar,
        path:'/scheduled-interview'
       },
       {
        name:"All Interview",
        icon:List,
        path:'/all-interview'
       },
    //    {
    //     name:"Your Resume",
    //     icon:User2Icon,
    //     path:'/resume'
    //    },
       // {
       //  name:"Credits",
       //  icon: WalletCards,
       //  path:'/billing'
       // },
       // {
       //  name:"Settings",
       //  icon:Settings,
       //  path:'/settings'
       // }
]
export const InterviewType = [
    {
        title: 'Technical',
        icon: Code2Icon
    },
    {
        title: 'Behavioral',
        icon: User2Icon
    },
    {
        title: 'System Design',
        icon: LayoutIcon
    },
    {
        title: 'Cultural Fit',
        icon: UsersIcon
    },
    {
        title: 'Leadership',
        icon: StarIcon
    }
]
export const QUESTION_PROMPT = `You are an expert technical interviewer.
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
🎯 The goal is to create a structured, relevant, and time-optimized interview plan for a {{jobTitle}} role`

export const FEEDBACK_PROMPT = `{{conversation}}
Based on this interview conversation between assistant and user, provide a strict and objective evaluation of the candidate's interview performance.

You must respond with valid JSON only. No markdown, no code blocks, no explanations - just raw JSON.

EVALUATION GUIDELINES:
- Start with a baseline of 5/10 (average) for each category
- For each question answered correctly and thoroughly, add points
- For each question answered incorrectly or not answered ("I don't know"), subtract points
- If candidate says "I don't know" to multiple questions, their technical skills rating should be very low (1-3)
- Communication should be based on clarity and professionalism, not just friendliness
- Problem-solving should evaluate actual solution approaches, not attempts
- Experience should reflect demonstrated knowledge, not claimed experience

RATING SCALE:
1-3: Poor/Below expectations (multiple incorrect answers or "I don't know" responses)
4-5: Below average (some correct answers but significant gaps in knowledge)
6-7: Average (mostly correct answers with minor issues)
8-9: Above average (strong answers with minimal gaps)
10: Exceptional (perfect answers to all questions)

Return a JSON object with this exact structure:
{
  "feedback": {
    "rating": {
      "technicalSkills": [number between 1-10],
      "communication": [number between 1-10],
      "problemSolving": [number between 1-10],
      "experience": [number between 1-10],
      "total": [calculated as average of the above, rounded to nearest integer]
    },
    "summary": "[3-line summary about the interview with specific examples of strengths/weaknesses]",
    "recommendation": "[Yes/No]",
    "recommendationMsg": "[factual explanation of recommendation based on performance]"
  }
}

IMPORTANT:
1. Be critical and objective - do not inflate scores
2. "I don't know" responses should significantly lower technical ratings
3. Only recommend candidates who truly demonstrated competence (7+ in technical skills)
4. Consider the number of questions answered correctly vs incorrectly
5. Return ONLY the JSON object, nothing else
6. Each "I don't know" response should reduce the relevant score by at least 2 points
7. If 50% or more questions were not answered correctly, the total score must be 5 or lower`;