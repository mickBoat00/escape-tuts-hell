export type UploadStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "completed"
  | "error";

export type UploadButtonState =
  | "Start Upload"
  | "Try Again"


export type PhaseStatus =
  'pending'| 'running'| 'completed' | 'failed';

export interface JobStatus {
  transcription: PhaseStatus;
  codingTutorialCheck: PhaseStatus;
  tutorialQA: PhaseStatus;
  codingChallenge: PhaseStatus;
}


export interface BackgroundResource {
  title: string;
  description: string;
  url?: string;
}

export interface Background {
  content: string;
  key_concepts: string[];
  resources: BackgroundResource[];
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
  technical_requirements: string[];
  concepts_taught: string[];
  test_cases: TestCase[];
  hints?: string[];
  security_considerations?: string[];
}

export interface Extension {
  title: string;
  description: string;
  difficulty: string;
  concepts: string[];
}

export interface CodingChallengeOutput {
  challenge_title: string;
  introduction: string;
  real_world_relevance: string;
  estimated_time: string;
  difficulty_level: string;
  background?: Background;
  steps: StepContent[];
  going_further: Extension[];
  skills_developed: string[];
  technologies_used: string[];
  final_deliverable: string;
}

export interface ErrorInfo {
  message?: string;
  step?: string;
  timestamp?: string; // ISO datetime
}

export interface Transcript {
  text?: string;
}

export interface CodingTutorialCheck {
  isCodingTutorial: boolean;
  reason: string;
}

export interface InterviewQuestion {
  question: string;
  answer: string;
}

export interface CodingInterviewQA {
  questions: InterviewQuestion[];
}


export interface Tutorial {
  _id: string;

  inputUrl: string;
  fileName: string;
  fileSize: number;
  fileDuration?: number;
  fileFormat: string;
  mimeType: string;

  status: 'uploading' | 'uploaded' | 'processing' | 'completed' | 'failed';

  jobStatus: JobStatus;
  error?: ErrorInfo;

  transcript?: Transcript;
  codingTutorialCheck?: CodingTutorialCheck;
  tutorialQA?: CodingInterviewQA;
  codingChallenge?: CodingChallengeOutput;

  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

export const FEATURES = {
  CHALLENGE: "coding_challenge",
  QNA: "question_and_answers",
} as const;
