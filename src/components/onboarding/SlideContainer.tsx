import React from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

interface SlideContainerProps {
  children: React.ReactNode;
  currentSlide: number;
  onNext?: () => void;
  onPrev?: () => void;
}

export function SlideContainer({ children, currentSlide, onNext, onPrev }: SlideContainerProps) {
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      if (info.offset.x > 0 && onPrev) {
        onPrev();
      } else if (info.offset.x < 0 && onNext) {
        onNext();
      }
    }
  };

  return (
    <div className="relative h-[400px] w-full overflow-hidden">
      <AnimatePresence initial={false} mode="wait" custom={currentSlide}>
        <motion.div
          key={currentSlide}
          custom={currentSlide}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.8}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 flex touch-pan-y items-center justify-center"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}