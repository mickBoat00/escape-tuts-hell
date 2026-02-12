export type JobState =
  | "pending"
  | "running"
  | "retrying"
  | "completed"
  | "failed";

export type TutorialStatus =
  | "uploading"
  | "processing"
  | "retrying"
  | "completed"
  | "failed";

export interface JobStatus {
  transcription: JobState;
  codingTutorialCheck: JobState;
  tutorialQA: JobState;
  codingChallenge: JobState;
  followAlongGuide: JobState;
  summary: JobState;
}

export interface JobError {
  transcription?: string | null;
  codingTutorialCheck?: string | null;
  tutorialQA?: string | null;
  codingChallenge?: string | null;
  followAlongGuide?: string | null;
  summary?: string | null;
}

export interface ErrorInfo {
  message?: string | null;
  step?: string | null;
  timestamp?: string | null;
}

export interface Transcript {
  text?: string | null;
}

export interface CodingTutorialCheck {
  isCodingTutorial: boolean;
  reason: string;
}

export interface AnswerOption {
  id: string;
  text: string;
}

export interface InterviewQuestion {
  question: string;
  options: AnswerOption[];
  correct_answer_ids: string[];
  transcript_evidence: string[];
}

export interface CodingInterviewQA {
  questions: InterviewQuestion[];
}

export interface TestCase {
  description: string;
  command: string;
  expected_output: string;
}

export interface StepContent {
  step_number: number;
  title: string;
  goal: string;
  description: string;
  related_requirements: number[];
  test_cases: TestCase[];
}

export interface Requirement {
  id: number;
  description: string;
}

export interface Extension {
  title: string;
  description: string;
}

export interface CodingChallengeOutput {
  challenge_title: string;
  introduction: string;
  real_world_relevance: string;
  background: string;
  requirements: Requirement[];
  steps: StepContent[];
  going_further: Extension[];
  final_deliverable: string;
}

export interface Hint {
  level: number;
  text: string;
}

export interface Validation {
  check: string;
  expected: string[];
}

export interface GuideStep {
  number: number;
  what: string;
  why: string;
  how: string;
  outcome?: string | null;
  validation: Validation;
  hints?: Hint[] | null;
}

export interface Milestone {
  number: number;
  title: string;
  outcome: string;
  steps: GuideStep[];
}

export interface FollowAlongGuide {
  title: string;
  summary: string;
  before_you_start?: string[] | null;
  milestones: Milestone[];
  whats_next?: string[] | null;
}

export interface Summary {
  text: string;
}

export interface Tutorial {
  _id?: string;

  inputUrl: string;
  fileName: string;
  fileSize: number;
  fileDuration?: number | null;
  fileFormat: string;
  mimeType: string;

  status: TutorialStatus;
  jobStatus: JobStatus;

  error?: ErrorInfo | null;
  jobError: JobError;

  transcript?: Transcript | null;
  codingTutorialCheck?: CodingTutorialCheck | null;
  tutorialQA?: CodingInterviewQA | null;
  codingChallenge?: CodingChallengeOutput | null;
  followAlongGuide?: FollowAlongGuide | null;
  summary?: Summary | null;

  createdAt: string;
  updatedAt?: string | null;
  completedAt?: string | null;
}

export interface FileDataRequest {
  fileName: string;
  fileSize: number;
  fileDuration: number;
  contentType: string;
}

export interface RetryRequest {
  tutorialId: string;
  jobName: string;
}

export type UploadStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "completed"
  | "error";

export type UploadButtonState =
  | "Start Upload"
  | "Try Again";


export const FEATURES = {
  CHALLENGE: "coding_challenge",
  QNA: "question_and_answers",
} as const;

export type FeatureType =
  typeof FEATURES[keyof typeof FEATURES];
