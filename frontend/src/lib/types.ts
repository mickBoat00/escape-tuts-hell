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


export type UploadStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "completed"
  | "error";

export type UploadButtonState =
  | "Start Upload"
  | "Try Again";


export interface JobStatus {
  transcription: JobState;
  codingTutorialCheck: JobState;
  tutorialQA: JobState;
  codingChallenge: JobState;
  summary: JobState;
}

export interface JobError {
  transcription?: string | null;
  codingTutorialCheck?: string | null;
  tutorialQA?: string | null;
  codingChallenge?: string | null;
  summary?: string | null;
}

export interface ErrorInfo {
  message?: string | null;
  step?: string | null;
  timestamp?: string | null; // ISO datetime
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
  related_requirements: number[];
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
  jobName: keyof JobStatus;
}



export const FEATURES = {
  CHALLENGE: "coding_challenge",
  QNA: "question_and_answers",
} as const;

export type FeatureType =
  typeof FEATURES[keyof typeof FEATURES];
