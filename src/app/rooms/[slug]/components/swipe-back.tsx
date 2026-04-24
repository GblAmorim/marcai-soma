"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Invisible component that detects a left-edge swipe (iOS-style)
 * and navigates to the rooms listing when triggered.
 *
 * Gesture rules:
 *  - Touch must start within the leftmost 20 px of the screen
 *  - Horizontal displacement must be > 80 px to the right
 *  - Horizontal displacement must be greater than vertical (no diagonal reject)
 */
const SwipeBack = () => {
  const router = useRouter();

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch.clientX <= 20) {
        startX = touch.clientX;
        startY = touch.clientY;
        tracking = true;
      } else {
        tracking = false;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!tracking) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = Math.abs(touch.clientY - startY);
      tracking = false;
      if (dx > 80 && dx > dy) {
        router.push("/");
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [router]);

  return null;
};

export default SwipeBack;
