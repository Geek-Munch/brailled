import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { apiRequest, fetchAllPages } from "../lib/api-client";
import { mapEvidenceFromApi, mapEvidenceToApi, EvidenceInput } from "../lib/evidence";
import { LearnerEvidence } from "../types/evidence";

interface AdminContextType {
  evidence: LearnerEvidence[];
  isLoading: boolean;
  error: string | null;
  refreshEvidence: (options?: { auth?: boolean }) => Promise<void>;
  addEvidence: (record: EvidenceInput) => Promise<LearnerEvidence>;
  editEvidence: (id: string, updates: Partial<LearnerEvidence>) => Promise<LearnerEvidence>;
  deleteEvidence: (id: string) => Promise<void>;
  clearError: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const EVIDENCE_ENDPOINT = "/resources/user-evidence/";

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [evidence, setEvidence] = useState<LearnerEvidence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const refreshEvidence = useCallback(async (options: { auth?: boolean } = {}) => {
    setIsLoading(true);
    try {
      const records = await fetchAllPages<any>(EVIDENCE_ENDPOINT, { auth: options.auth });
      setEvidence(records.map(mapEvidenceFromApi));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load evidence.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addEvidence = useCallback(async (record: EvidenceInput) => {
    const payload = await apiRequest<any>(EVIDENCE_ENDPOINT, {
      method: "POST",
      auth: true,
      body: mapEvidenceToApi(record),
    });
    const created = mapEvidenceFromApi(payload);
    setEvidence((prev) => [created, ...prev]);
    return created;
  }, []);

  const editEvidence = useCallback(async (id: string, updates: Partial<LearnerEvidence>) => {
    const payload = await apiRequest<any>(`${EVIDENCE_ENDPOINT}${id}/`, {
      method: "PATCH",
      auth: true,
      body: mapEvidenceToApi(updates),
    });
    const updated = mapEvidenceFromApi(payload);
    setEvidence((prev) => prev.map((record) => (record.id === id ? updated : record)));
    return updated;
  }, []);

  const deleteEvidence = useCallback(async (id: string) => {
    await apiRequest(`${EVIDENCE_ENDPOINT}${id}/`, { method: "DELETE", auth: true });
    setEvidence((prev) => prev.filter((record) => record.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      evidence,
      isLoading,
      error,
      refreshEvidence,
      addEvidence,
      editEvidence,
      deleteEvidence,
      clearError,
    }),
    [
      evidence,
      isLoading,
      error,
      refreshEvidence,
      addEvidence,
      editEvidence,
      deleteEvidence,
      clearError,
    ]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used within AdminProvider");
  return context;
}