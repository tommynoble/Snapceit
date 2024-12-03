import React from 'react';
import { Receipt, Scan, Cloud } from 'lucide-react';
import { SlideContainer } from './SlideContainer';

interface OnboardingContentProps {
  slide: number;
  onNext?: () => void;
  onPrev?: () => void;
}

export function OnboardingContent({ slide, onNext, onPrev }: OnboardingContentProps) {
  const slides = [
    {
      icon: <Receipt className="h-24 w-24 text-white" />,
      title: "Say Goodbye to Paper Receipts",
      description: "Digitize and organize all your receipts in one secure place"
    },
    {
      icon: <Scan className="h-24 w-24 text-white" />,
      title: "Quick Scanning",
      description: "Simply snap a photo and let our AI handle the rest"
    },
    {
      icon: <Cloud className="h-24 w-24 text-white" />,
      title: "Cloud Storage",
      description: "Access your receipts anywhere, anytime with secure cloud backup"
    }
  ];

  const currentSlide = slides[slide];

  return (
    <SlideContainer currentSlide={slide} onNext={onNext} onPrev={onPrev}>
      <div className="flex flex-col items-center text-center">
        <div className="mb-8 rounded-full bg-white/10 p-8 backdrop-blur-sm">
          {currentSlide.icon}
        </div>
        <h1 className="mb-4 text-5xl font-bold text-white">
          {currentSlide.title}
        </h1>
        <p className="max-w-md text-lg text-white/80">
          {currentSlide.description}
        </p>
      </div>
    </SlideContainer>
  );
}