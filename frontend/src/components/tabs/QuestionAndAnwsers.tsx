import type { CodingInterviewQA, InterviewQuestion } from '@/lib/types';
import React from 'react'




interface QuestionAndAnwsersProps {
    quiz?: CodingInterviewQA;
}


const QuestionAndAnwsers = ({ quiz }: QuestionAndAnwsersProps) => {
    console.log('displaying')
    console.log('quiz', quiz)
  return (
    <div>
        <ul>
            {
                quiz?.questions.map(qa => (
                    <div key={qa.answer}>
                        <li >{qa.question}</li>
                        <li>{qa.answer}</li>
                    </div>
                   
                ))
            }
        </ul>
      {
        
      }
    </div>
  )
}

export default QuestionAndAnwsers
