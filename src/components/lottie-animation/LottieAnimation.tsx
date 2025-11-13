"use client";
import React, { useEffect, useRef } from "react";
import lottie from "lottie-web/build/player/lottie_light";

type LottieAnimationProps = {
  animationData: any;
  width?: number;
  height?: number;
  loop?: boolean;
  autoplay?: boolean;
};

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  animationData,
  width = 300,
  height = 300,
  loop = true,
  autoplay = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop,
      autoplay,
      animationData,
    });

    return () => anim.destroy();
  }, [animationData, loop, autoplay]);

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center h-full w-full"
      style={{ width, height }}
    />
  );
};

export default LottieAnimation;
