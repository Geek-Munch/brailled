export interface LearnerEvidence {
  id: string;
  userId: string;        // e.g., "BRL-001"
  school: string;
  county: string;
  age: number;
  disabilityType: string;
  sessionType: string;
  outcomeRecorded: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type DisabilityType = 
  | "Blind (congenital)"
  | "Blind (acquired)"
  | "Low vision / progressive"
  | "Low vision (stable)"
  | "Other";

export type SessionType = 
  | "Prototype assembly session"
  | "Voice coding workshop"
  | "Bootcamp session"
  | "Teacher training session"
  | "Classroom integration"
  | "Demo session";

export interface EvidenceFilters {
  school: string;
  county: string;
  disabilityType: string;
  sessionType: string;
}