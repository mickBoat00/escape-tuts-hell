export type UploadStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "completed"
  | "error";

export type UploadButtonState =
  | "Start Upload"
  | "Try Again";

export type PhaseStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed";

export interface JobStatus {
  transcription: PhaseStatus;
  codingTutorialCheck: PhaseStatus;
  tutorialQA: PhaseStatus;
  codingChallenge: PhaseStatus;
  summary: PhaseStatus;
}

export interface JobError {
  transcription?: string;
  codingTutorialCheck?: string;
  tutorialQA?: string;
  codingChallenge?: string; 
  summary?: string; 
}

export interface Transcript {
  text: string;
}

export interface CodingTutorialCheck {
  isCodingTutorial: boolean;
  reason: string;
}

export interface AnswerOption {
  id: string; // "A", "B", "C", "D"
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


export interface BackgroundResource {
  title: string;
  description: string;
  url?: string;
}

export interface Background {
  content?: string;
  key_concepts?: string[];
  resources?: BackgroundResource[];
}

export interface Requirement {
  id: number;
  description: string;
}


export interface TestCase {
  description: string;
  command: string;
  expected_output: string;
}

export interface StepContent {
  step_number: number; // 0 = setup
  title: string;
  goal: string;
  description: string;

  related_requirements: number[]; // Requirement IDs

  test_cases: TestCase[];
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


export interface ErrorInfo {
  message?: string;
  step?: string;
  timestamp?: string; // ISO date string
}

export interface Tutorial {
  _id: string;

  inputUrl: string;
  fileName: string;
  fileSize: number;
  fileDuration?: number;
  fileFormat: string;
  mimeType: string;

  status: "uploading" | "uploaded" | "processing" | "completed" | "failed";

  jobStatus: JobStatus;
  error?: ErrorInfo;
  jobError?: JobError;

  transcript?: Transcript;
  codingTutorialCheck?: CodingTutorialCheck;
  tutorialQA?: CodingInterviewQA;
  codingChallenge?: CodingChallengeOutput;

  createdAt: string;
  updatedAt?: string;
  completedAt?: string | null;
}

export const FEATURES = {
  CHALLENGE: "coding_challenge",
  QNA: "question_and_answers",
} as const;
