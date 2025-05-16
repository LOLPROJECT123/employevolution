import { useEffect, useState } from "react";

// Simple onboarding modal for new users
const PAGES = [
  {
    title: "Welcome to Streamline!",
    content: (
      <>
        <p>Streamline automates your job search, applications, and career journey.</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Auto-fill applications and track jobs</li>
          <li>Scrape jobs from top sites</li>
          <li>Resume builder, forums, and interview prep</li>
          <li>Salary research and networking tools</li>
        </ul>
      </>
    ),
  },
  {
    title: "Step 1: Complete Your Profile",
    content: (
      <>
        <p>Let’s get started by setting up your profile for personalized job matches and autofill.</p>
        <p>
          <strong>Tip:</strong> The more complete your profile, the better your experience!
        </p>
      </>
    ),
  },
  {
    title: "Step 2: Install the Chrome Extension",
    content: (
      <>
        <p>
          Install the <strong>Streamline Chrome Extension</strong> to auto-fill applications, save jobs, and sync your progress.
        </p>
        <a
          href="https://chrome.google.com/webstore/detail/streamline-job-helper"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-600"
        >
          Install Extension
        </a>
      </>
    ),
  },
  {
    title: "Step 3: Dashboard & Tour",
    content: (
      <>
        <p>Explore your dashboard, forums, salary research, and more. All your job search tools, in one place!</p>
      </>
    ),
  },
];

export default function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [page, setPage] = useState(0);

  // Don't show again state
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  function handleNext() {
    if (page < PAGES.length - 1) setPage(page + 1);
    else handleClose();
  }

  function handleClose() {
    if (dontShowAgain) {
      localStorage.setItem("streamline_onboarding_complete", "true");
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-8 max-w-lg w-full shadow-2xl relative">
        <h2 className="text-2xl font-bold mb-4">{PAGES[page].title}</h2>
        <div className="mb-6">{PAGES[page].content}</div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={e => setDontShowAgain(e.target.checked)}
            />
            Don’t show again
          </label>
          <div className="flex gap-2">
            {page > 0 && (
              <button
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 text-sm rounded bg-gray-200 dark:bg-gray-700"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-2 text-sm rounded bg-blue-600 text-white"
            >
              {page === PAGES.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}