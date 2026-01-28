import React, { useMemo, useState } from 'react'
import type { CodingInterviewQA } from '@/lib/types'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@radix-ui/react-select'

interface QuestionAndAnswersProps {
  quiz?: CodingInterviewQA
}

const QuestionAndAnswers = ({ quiz }: QuestionAndAnswersProps) => {
  const [answers, setAnswers] = useState<Record<number, string[]>>({})
  const [submitted, setSubmitted] = useState(false)

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No questions available
      </div>
    )
  }

  const handleToggle = (qIndex: number, optionId: string) => {
    if (submitted) return

    setAnswers(prev => {
      const current = prev[qIndex] || []
      const exists = current.includes(optionId)

      return {
        ...prev,
        [qIndex]: exists
          ? current.filter(id => id !== optionId)
          : [...current, optionId],
      }
    })
  }

  const score = useMemo(() => {
    let correct = 0

    quiz.questions.forEach((q, index) => {
      const userAnswers = answers[index] || []
      const expected = q.correct_answer_ids

      const isCorrect =
        userAnswers.length === expected.length &&
        expected.every(id => userAnswers.includes(id))

      if (isCorrect) correct++
    })

    return Math.round((correct / quiz.questions.length) * 100)
  }, [answers, quiz.questions])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Knowledge Check</h2>
          <p className="text-sm text-muted-foreground">
            Multiple choice questions
          </p>
        </div>

        {submitted && (
          <div className="text-sm font-semibold text-emerald-600">
            Total points {score}/100
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions.map((q, qIndex) => {
          const userAnswers = answers[qIndex] || []
          const isCorrect =
            submitted &&
            userAnswers.length === q.correct_answer_ids.length &&
            q.correct_answer_ids.every(id => userAnswers.includes(id))

          return (
            <Card key={qIndex}>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {q.question}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {q.options.map(option => {
                  const checked = userAnswers.includes(option.id)
                  const isAnswerCorrect =
                    submitted && q.correct_answer_ids.includes(option.id)
                  const isAnswerWrong =
                    submitted && checked && !isAnswerCorrect

                  return (
                    <label
                      key={option.id}
                      className={`
                        flex items-center gap-3 rounded-md border p-3 cursor-pointer
                        transition
                        ${checked ? 'border-primary' : 'border-border'}
                        ${isAnswerCorrect ? 'bg-emerald-50 border-emerald-500' : ''}
                        ${isAnswerWrong ? 'bg-red-50 border-red-500' : ''}
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          handleToggle(qIndex, option.id)
                        }
                        className="h-4 w-4"
                      />

                      <span className="flex-1 text-sm">
                        {option.text}
                      </span>

                      {submitted && isAnswerCorrect && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      )}

                      {submitted && isAnswerWrong && (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </label>
                  )
                })}

                {/* Correct answer summary */}
                {submitted && (
                  <>
                    <Separator />
                    <div className="text-sm">
                      <p className="font-medium">
                        Correct answer
                      </p>
                      <ul className="list-disc pl-5 text-muted-foreground">
                        {q.correct_answer_ids.map(id => {
                          const opt = q.options.find(o => o.id === id)
                          return (
                            <li key={id}>{opt?.text}</li>
                          )
                        })}
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Submit */}
      {!submitted && (
        <Button
          size="lg"
          className="w-full"
          onClick={() => setSubmitted(true)}
        >
          Submit
        </Button>
      )}
    </div>
  )
}

export default QuestionAndAnswers
