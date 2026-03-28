import { getDemoCaseById } from "./demo-cases";

const glowCase = getDemoCaseById("glow-recipe-sensitive-skin");

if (!glowCase) {
  throw new Error("Expected glow-recipe-sensitive-skin demo case to exist.");
}

export const profileShiftRequest = {
  ...structuredClone(glowCase.request),
  demoCaseId: undefined,
  userProfile: {
    ...structuredClone(glowCase.request.userProfile),
    id: "glow-normal-profile-shift",
    skinType: "normal" as const,
    concerns: ["dehydration", "texture"],
    sensitivities: [],
    dislikedProducts: [],
    budgetRange: {
      max: 50,
      currency: "USD"
    },
    preferences: {
      lightweight: true,
      finish: "glowy" as const
    }
  }
};
