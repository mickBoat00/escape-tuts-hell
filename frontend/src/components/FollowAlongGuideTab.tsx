import React, { useState } from "react";
import type { FollowAlongGuide, Milestone, GuideStep } from "@/lib/types";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  ListChecks,
  AlertCircle,
  Rocket,
  Target,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Separator } from "@radix-ui/react-select";
import { Progress } from "./ui/progress";

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

const HintRevealer: React.FC<{ hints: { level: number; text: string }[] }> = ({
  hints,
}) => {
  const [revealedLevel, setRevealedLevel] = useState(0);
  const sorted = [...hints].sort((a, b) => a.level - b.level);
  const labels = ["Nudge", "Guidance", "Solution"];

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Stuck? Reveal a hint
      </p>
      <div className="flex gap-2 flex-wrap">
        {sorted.map((h) => (
          <Button
            key={h.level}
            size="sm"
            variant={revealedLevel >= h.level ? "default" : "outline"}
            className="text-xs"
            onClick={() =>
              setRevealedLevel((prev) => (prev >= h.level ? h.level - 1 : h.level))
            }
          >
            {revealedLevel >= h.level ? (
              <Eye className="w-3 h-3 mr-1" />
            ) : (
              <EyeOff className="w-3 h-3 mr-1" />
            )}
            {labels[h.level - 1] ?? `Hint ${h.level}`}
          </Button>
        ))}
      </div>
      {sorted
        .filter((h) => h.level <= revealedLevel)
        .map((h) => (
          <div
            key={h.level}
            className="rounded-md border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-foreground"
          >
            <Lightbulb className="inline w-4 h-4 mr-1.5 text-primary" />
            {h.text}
          </div>
        ))}
    </div>
  );
};

/* ---- Single Step ------------------------------------------------- */

const StepCard: React.FC<{
  step: GuideStep;
  isCompleted: boolean;
  onToggleComplete: () => void;
}> = ({ step, isCompleted, onToggleComplete }) => {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card
        className={cn(
          "transition-colors border",
          isCompleted && "border-primary/30 bg-primary/5"
        )}
      >
        <CollapsibleTrigger asChild>
          <button className="w-full text-left px-5 py-4 flex items-start gap-3 group">
            <span
              className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                isCompleted
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                step.number
              )}
            </span>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground leading-snug">
                {step.what}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {step.why}
              </p>
            </div>

            {open ? (
              <ChevronDown className="w-4 h-4 mt-1 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 mt-1 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-5 pb-5 space-y-4">
            <Separator />

            {/* How */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                How
              </p>
              <p className="text-sm text-foreground whitespace-pre-line">
                {step.how}
              </p>
            </div>

            {/* Expected Outcome */}
            {step.outcome && (
              <div className="rounded-md bg-muted/50 px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Expected Outcome
                </p>
                <p className="text-sm text-foreground">{step.outcome}</p>
              </div>
            )}

            {/* Validation */}
            <div className="rounded-md border px-4 py-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <ListChecks className="w-3.5 h-3.5" /> Validation
              </p>
              <p className="text-sm font-medium text-foreground">
                {step.validation.check}
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {step.validation.expected.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>

            {/* Hints */}
            {step.hints && step.hints.length > 0 && (
              <HintRevealer hints={step.hints} />
            )}

            {/* Mark complete */}
            <Button
              size="sm"
              variant={isCompleted ? "outline" : "default"}
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete();
              }}
            >
              {isCompleted ? "Mark Incomplete" : "Mark Complete"}
            </Button>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

/* ---- Milestone --------------------------------------------------- */

const MilestoneSection: React.FC<{
  milestone: Milestone;
  completedSteps: Set<string>;
  onToggleStep: (key: string) => void;
  defaultOpen?: boolean;
}> = ({ milestone, completedSteps, onToggleStep, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const total = milestone.steps.length;
  const done = milestone.steps.filter((s) =>
    completedSteps.has(`${milestone.number}-${s.number}`)
  ).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full text-left flex items-center gap-3 py-3 group">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
            {milestone.number}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">{milestone.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {milestone.outcome}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-xs tabular-nums">
              {done}/{total}
            </div>
            {open ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="ml-4 pl-7 border-l-2 border-primary/20 space-y-3 pb-2">
          <Progress value={pct} className="h-1.5 mb-2" />
          {milestone.steps.map((step) => {
            const key = `${milestone.number}-${step.number}`;
            return (
              <StepCard
                key={key}
                step={step}
                isCompleted={completedSteps.has(key)}
                onToggleComplete={() => onToggleStep(key)}
              />
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

interface FollowAlongGuideTabProps {
  guide?: FollowAlongGuide | null;
}

const FollowAlongGuideTab: React.FC<FollowAlongGuideTabProps> = ({ guide }) => {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  if (!guide) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <AlertCircle className="w-10 h-10 mb-3" />
        <p className="text-sm">No follow-along guide available</p>
      </div>
    );
  }

  const toggleStep = (key: string) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const totalSteps = guide.milestones.reduce(
    (sum, m) => sum + m.steps.length,
    0
  );
  const totalDone = completedSteps.size;
  const overallPct =
    totalSteps > 0 ? Math.round((totalDone / totalSteps) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">{guide.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{guide.summary}</p>
      </div>

      {/* Overall progress */}
      <Card>
        <CardContent className="py-4 flex items-center gap-4">
          <Target className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Overall progress</span>
              <span className="tabular-nums font-medium">
                {totalDone}/{totalSteps} steps
              </span>
            </div>
            <Progress value={overallPct} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Before you start */}
      {guide.before_you_start && guide.before_you_start.length > 0 && (
        <Card>
          <CardContent className="py-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Before you start
            </p>
            <ul className="list-disc list-inside text-sm text-foreground space-y-1">
              {guide.before_you_start.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Milestones */}
      <div className="space-y-2">
        {guide.milestones.map((m, i) => (
          <MilestoneSection
            key={m.number}
            milestone={m}
            completedSteps={completedSteps}
            onToggleStep={toggleStep}
            defaultOpen={i === 0}
          />
        ))}
      </div>

      {/* What's next */}
      {guide.whats_next && guide.whats_next.length > 0 && (
        <Card>
          <CardContent className="py-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Rocket className="w-4 h-4 text-primary" /> What's Next
            </p>
            <ul className="list-disc list-inside text-sm text-foreground space-y-1">
              {guide.whats_next.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FollowAlongGuideTab;
