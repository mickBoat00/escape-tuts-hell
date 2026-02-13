import React from "react";
import type { CodingChallengeOutput } from "@/lib/types";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Target,
} from "lucide-react";

interface CodingChallengeTabProps {
  challenge?: CodingChallengeOutput | null;
}

const CodingChallengeTab: React.FC<CodingChallengeTabProps> = ({ challenge }) => {
  if (!challenge) {
    return (
      <div className="py-12 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No coding challenge available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-12 px-2 md:px-0">
      {/* Header Section */}
      <div className="space-y-3 md:space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground break-words">
          {challenge.challenge_title}
        </h1>

        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          {challenge.introduction}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 md:h-5 md:w-5 text-emerald-600 flex-shrink-0" />
            <h3 className="font-semibold text-sm md:text-base text-emerald-700">
              Real-World Relevance
            </h3>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed pl-6 md:pl-7">
            {challenge.real_world_relevance}
          </p>
        </div>
      </div>

      {/* =====================================================
          Background
      ===================================================== */}
      <div className="space-y-3 md:space-y-4">
        <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-emerald-600 flex-shrink-0" />
          Background
        </h2>

        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          {challenge.background}
        </p>
      </div>

      {/* Requirements */}
      {challenge.requirements.length > 0 && (
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-lg md:text-xl font-bold text-foreground">
            Requirements
          </h2>

          <ul className="space-y-2 list-disc list-inside text-xs md:text-sm text-muted-foreground pl-2">
            {challenge.requirements.map((req) => (
              <li key={req.id} className="break-words">{req.description}</li>
            ))}
          </ul>
        </div>
      )}

      {/* The Challenge */}
      <div className="space-y-8 md:space-y-10">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          The Challenge
        </h2>

        {challenge.steps.map((step) => (
          <div key={step.step_number} className="space-y-3 md:space-y-4">
            {/* Step Header */}
            <div>
              <h3 className="text-lg md:text-xl font-bold text-foreground break-words">
                Step {step.step_number}
                {step.step_number === 0 && " (Setup)"}
              </h3>
              <h4 className="text-base md:text-lg font-semibold text-muted-foreground break-words">
                {step.title}
              </h4>
            </div>

            {/* Goal */}
            <p className="text-xs md:text-sm leading-relaxed break-words">
              {step.goal}
            </p>

            {/* Description */}
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed break-words">
              {step.description}
            </p>

            {/* Test Cases (max 3) */}
            {step.test_cases.length > 0 && (
              <div className="space-y-3 md:space-y-4">
                {step.test_cases.slice(0, 3).map((testCase, index) => (
                  <div key={index} className="space-y-2">
                    <p className="text-xs md:text-sm font-medium break-words">
                      {testCase.description}
                    </p>

                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">
                        Command
                      </p>
                      <pre className="bg-muted p-2 md:p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap break-all">
                        <code>{testCase.command}</code>
                      </pre>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">
                        Expected Output
                      </p>
                      <pre className="bg-muted p-2 md:p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap break-all">
                        <code>{testCase.expected_output}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* =====================================================
          Going Further (max 3)
      ===================================================== */}
      {challenge.going_further.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg md:text-xl font-bold text-foreground">
            Going Further
          </h2>

          <div className="space-y-3">
            {challenge.going_further.slice(0, 3).map((item, index) => (
              <div key={index} className="space-y-1">
                <h4 className="text-sm md:text-base font-semibold break-words">{item.title}</h4>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed break-words">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final Deliverable */}
      <div className="space-y-3">
        <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-emerald-600 flex-shrink-0" />
          Final Deliverable
        </h2>

        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed break-words">
          {challenge.final_deliverable}
        </p>
      </div>
    </div>
  );
};

export default CodingChallengeTab;  