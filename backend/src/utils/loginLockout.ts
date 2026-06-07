import { AppError } from "./AppError";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

interface LoginAttemptState {
  count: number;
  lockedUntil: number | null;
}

const attemptsByEmail = new Map<string, LoginAttemptState>();

function getState(email: string): LoginAttemptState {
  const key = email.toLowerCase();
  const existing = attemptsByEmail.get(key);
  if (existing) {
    return existing;
  }

  const state: LoginAttemptState = { count: 0, lockedUntil: null };
  attemptsByEmail.set(key, state);
  return state;
}

export function assertLoginAllowed(email: string): void {
  const state = getState(email);
  if (state.lockedUntil && Date.now() < state.lockedUntil) {
    throw new AppError(429, "Too many failed login attempts. Try again later.");
  }

  if (state.lockedUntil && Date.now() >= state.lockedUntil) {
    state.count = 0;
    state.lockedUntil = null;
  }
}

export function recordFailedLogin(email: string): void {
  const state = getState(email);
  state.count += 1;

  if (state.count >= MAX_ATTEMPTS) {
    state.lockedUntil = Date.now() + LOCKOUT_MS;
  }
}

export function clearLoginAttempts(email: string): void {
  attemptsByEmail.delete(email.toLowerCase());
}

export function resetLoginLockoutForTests(): void {
  attemptsByEmail.clear();
}
