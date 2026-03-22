import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const STORAGE_KEYS = {
  active: "book_onboarding_active",
  completed: "book_onboarding_completed",
} as const;

function setOnboardingEnded() {
  try {
    localStorage.setItem(STORAGE_KEYS.active, "false");
    localStorage.setItem(STORAGE_KEYS.completed, "true");
  } catch {
    // Ignore
  }
}

function setOnboardingStarted() {
  try {
    localStorage.setItem(STORAGE_KEYS.active, "true");
    localStorage.setItem(STORAGE_KEYS.completed, "false");
  } catch {
    // Ignore
  }
}

const ONBOARDING_STEPS = [
  {
    element: "#onboarding-favorites",
    popover: {
      title: "My favorites",
      description: "Save books you love so we can personalize your recommendations.",
    },
  },
  {
    element: "#onboarding-genre-preferences",
    popover: {
      title: "Genre preferences",
      description: "Pick broad categories you enjoy for more personalized recommendations.",
    },
  },
  {
    element: "#onboarding-new-image",
    popover: {
      title: "New Image",
      description: "Upload a photo of a shelf to generate recommendations.",
    },
  },
  {
    element: "#onboarding-history",
    popover: {
      title: "History",
      description: "See your previous scans and recommendations.",
    },
  },
  {
    element: "#onboarding-usage",
    popover: {
      title: "Usage",
      description: "Track scans used and how many remain this cycle.",
    },
  },
  {
    element: "#onboarding-billing",
    popover: {
      title: "Billing",
      description: "Manage your subscription and payment details.",
    },
  },
] as const;

export function startDashboardOnboarding() {
  setOnboardingStarted();

  setTimeout(() => {
    driver({
      showProgress: false,
      allowClose: true,
      animate: true,
      onDestroyed: setOnboardingEnded,
      steps: [...ONBOARDING_STEPS],
    }).drive();
  }, 0);
}
