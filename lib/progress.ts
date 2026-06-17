"use client";

export type UserTaskStatus = "UNSEEN" | "VIEWED" | "SOLVED" | "REVIEW";

export type TaskProgress = {
  status: UserTaskStatus;
  firstViewedAt: string;
  lastViewedAt: string;
  viewCount: number;
  answerOpened: boolean;
  solutionOpened: boolean;
};

export type ProgressState = {
  version: 1;
  tasks: Record<string, TaskProgress>;
};

const key = "integral-hub-progress-v1";

const emptyState: ProgressState = { version: 1, tasks: {} };

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadProgress(): ProgressState {
  if (!canUseStorage()) return emptyState;
  const raw = window.localStorage.getItem(key);
  if (!raw) return emptyState;
  try {
    const parsed = JSON.parse(raw) as ProgressState;
    return parsed.version === 1 && parsed.tasks ? parsed : emptyState;
  } catch {
    return emptyState;
  }
}

export function saveProgress(state: ProgressState) {
  if (canUseStorage()) window.localStorage.setItem(key, JSON.stringify(state));
}

export function getTaskProgress(number: number): TaskProgress | null {
  return loadProgress().tasks[String(number)] ?? null;
}

export function markViewed(number: number): TaskProgress {
  const state = loadProgress();
  const id = String(number);
  const now = new Date().toISOString();
  const existing = state.tasks[id];
  const next: TaskProgress = existing
    ? { ...existing, status: existing.status === "UNSEEN" ? "VIEWED" : existing.status, lastViewedAt: now, viewCount: existing.viewCount + 1 }
    : { status: "VIEWED", firstViewedAt: now, lastViewedAt: now, viewCount: 1, answerOpened: false, solutionOpened: false };
  state.tasks[id] = next;
  saveProgress(state);
  return next;
}

export function markAnswerOpened(number: number) {
  const state = loadProgress();
  const id = String(number);
  const base = state.tasks[id] ?? markViewed(number);
  state.tasks[id] = { ...base, answerOpened: true, lastViewedAt: new Date().toISOString() };
  saveProgress(state);
}

export function markSolutionOpened(number: number) {
  const state = loadProgress();
  const id = String(number);
  const base = state.tasks[id] ?? markViewed(number);
  state.tasks[id] = { ...base, solutionOpened: true, lastViewedAt: new Date().toISOString() };
  saveProgress(state);
}

export function setTaskStatus(number: number, status: Exclude<UserTaskStatus, "UNSEEN">) {
  const state = loadProgress();
  const id = String(number);
  const base = state.tasks[id] ?? markViewed(number);
  state.tasks[id] = { ...base, status, lastViewedAt: new Date().toISOString() };
  saveProgress(state);
}

export function clearHistoryOnly() {
  const state = loadProgress();
  const tasks = Object.fromEntries(
    Object.entries(state.tasks).filter(([, task]) => task.status === "SOLVED" || task.status === "REVIEW")
  );
  saveProgress({ version: 1, tasks });
}

export function resetProgress() {
  saveProgress(emptyState);
}
