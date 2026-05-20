import { LearnerEvidence } from "../types/evidence";

type EvidenceApiRecord = {
  id?: number | string;
  user_id?: string;
  userId?: string;
  school?: string;
  county?: string;
  age?: number | string;
  disability_type?: string;
  disabilityType?: string;
  session_type?: string;
  sessionType?: string;
  outcome_recorded?: string;
  outcomeRecorded?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
};

export type EvidenceInput = Omit<LearnerEvidence, "id" | "createdAt" | "updatedAt">;

function toDate(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? undefined : parsed;
}

export function mapEvidenceFromApi(record: EvidenceApiRecord): LearnerEvidence {
  return {
    id: String(record.id ?? record.user_id ?? record.userId ?? Date.now()),
    userId: record.user_id ?? record.userId ?? "",
    school: record.school ?? "",
    county: record.county ?? "",
    age: typeof record.age === "string" ? Number.parseInt(record.age, 10) : record.age ?? 0,
    disabilityType: record.disability_type ?? record.disabilityType ?? "",
    sessionType: record.session_type ?? record.sessionType ?? "",
    outcomeRecorded: record.outcome_recorded ?? record.outcomeRecorded ?? "",
    createdAt: toDate(record.created_at ?? record.createdAt),
    updatedAt: toDate(record.updated_at ?? record.updatedAt),
  };
}

export function mapEvidenceToApi(record: Partial<LearnerEvidence> | EvidenceInput) {
  return {
    user_id: record.userId,
    school: record.school,
    county: record.county,
    age: record.age,
    disability_type: record.disabilityType,
    session_type: record.sessionType,
    outcome_recorded: record.outcomeRecorded,
  };
}
