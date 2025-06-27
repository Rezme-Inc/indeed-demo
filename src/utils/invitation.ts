export function generateSecureCode(): string {
  const randomBytes = new Uint8Array(4);
  crypto.getRandomValues(randomBytes);
  const randomHex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return (randomHex + timestamp).slice(0, 8);
}

export function getCurrentAssessmentStep(user: { id: string }): number {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(`assessmentCurrentStep_${user.id}`);
    if (saved && !isNaN(Number(saved))) {
      return Number(saved) - 1;
    }
  }
  return 0;
}
