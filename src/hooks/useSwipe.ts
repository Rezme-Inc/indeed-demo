import { useRef, useEffect, TouchEvent } from 'react';

interface SwipeConfig {
  minSwipeDistance?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface TouchCoordinates {
  touchStart: { x: number; y: number };
  touchEnd: { x: number; y: number };
}

export function useSwipe({
  minSwipeDistance = 50,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
}: SwipeConfig = {}) {
  const touchRef = useRef<TouchCoordinates>({
    touchStart: { x: 0, y: 0 },
    touchEnd: { x: 0, y: 0 },
  });

  const onTouchStart = (e: TouchEvent) => {
    touchRef.current.touchStart = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const onTouchMove = (e: TouchEvent) => {
    touchRef.current.touchEnd = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const onTouchEnd = () => {
    const swipeDistance = {
      x: touchRef.current.touchEnd.x - touchRef.current.touchStart.x,
      y: touchRef.current.touchEnd.y - touchRef.current.touchStart.y,
    };

    const isHorizontalSwipe = Math.abs(swipeDistance.x) > Math.abs(swipeDistance.y);

    if (isHorizontalSwipe) {
      if (Math.abs(swipeDistance.x) >= minSwipeDistance) {
        if (swipeDistance.x > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    } else {
      if (Math.abs(swipeDistance.y) >= minSwipeDistance) {
        if (swipeDistance.y > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
} 