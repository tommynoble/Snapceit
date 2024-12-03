import React from 'react';

interface OnboardingActionsProps {
  onGetStarted: () => void;
  onLogin: () => void;
  showActions: boolean;
}

export function OnboardingActions({ onGetStarted, onLogin, showActions }: OnboardingActionsProps) {
  if (!showActions) return null;

  return (
    <div className="mt-12 flex w-full max-w-md flex-col gap-3">
      <button
        onClick={onGetStarted}
        className="w-full rounded-full bg-white px-8 py-4 text-lg font-semibold text-purple-600 shadow-lg transition-all hover:bg-white/90 hover:shadow-xl active:scale-95"
      >
        Get Started
      </button>
      <button
        onClick={onLogin}
        className="w-full rounded-full border border-white/20 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
      >
        Login
      </button>
    </div>
  );
}