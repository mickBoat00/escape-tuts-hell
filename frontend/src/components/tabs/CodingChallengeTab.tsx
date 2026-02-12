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
    <div className="space-y-12">
      {/* =====================================================
          Header
      ===================================================== */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          {challenge.challenge_title}
        </h1>

        <p className="text-base text-muted-foreground leading-relaxed">
          {challenge.introduction}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold text-emerald-700">
              Real-World Relevance
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed pl-7">
            {challenge.real_world_relevance}
          </p>
        </div>
      </div>

      {/* =====================================================
          Background
      ===================================================== */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-600" />
          Background
        </h2>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {challenge.background}
        </p>
      </div>

      {/* =====================================================
          Requirements
      ===================================================== */}
      {challenge.requirements.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">
            Requirements
          </h2>

          <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
            {challenge.requirements.map((req) => (
              <li key={req.id}>{req.description}</li>
            ))}
          </ul>
        </div>
      )}

      {/* =====================================================
          Steps
      ===================================================== */}
      <div className="space-y-10">
        <h2 className="text-2xl font-bold text-foreground">
          The Challenge
        </h2>

        {challenge.steps.map((step) => (
          <div key={step.step_number} className="space-y-4">
            {/* Step Header */}
            <div>
              <h3 className="text-xl font-bold text-foreground">
                Step {step.step_number}
                {step.step_number === 0 && " (Setup)"}
              </h3>
              <h4 className="text-lg font-semibold text-muted-foreground">
                {step.title}
              </h4>
            </div>

            {/* Goal */}
            <p className="text-sm leading-relaxed">
              {step.goal}
            </p>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>

            {/* Test Cases (max 3) */}
            {step.test_cases.length > 0 && (
              <div className="space-y-4">
                {step.test_cases.slice(0, 3).map((testCase, index) => (
                  <div key={index} className="space-y-2">
                    <p className="text-sm font-medium">
                      {testCase.description}
                    </p>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">
                        Command
                      </p>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto  whitespace-pre-wrap break-words overflow-x-auto">
                        <code>{testCase.command}</code>
                      </pre>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">
                        Expected Output
                      </p>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto  whitespace-pre-wrap break-words overflow-x-auto">
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
          <h2 className="text-xl font-bold text-foreground">
            Going Further
          </h2>

          <div className="space-y-3">
            {challenge.going_further.slice(0, 3).map((item, index) => (
              <div key={index} className="space-y-1">
                <h4 className="font-semibold">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================
          Final Deliverable
      ===================================================== */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          Final Deliverable
        </h2>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {challenge.final_deliverable}
        </p>
      </div>
    </div>
  );
};

export default CodingChallengeTab;
