"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ClarkAvatarProps {
  size?: number;
  className?: string;
}

export function ClarkAvatar({ size = 28, className }: ClarkAvatarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";
  // Show clark.png by default (before hydration) to avoid flash
  const imageSrc = mounted && isDark ? "/karl.png" : "/clark.png";

  const handleDoubleClick = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Image
      src={imageSrc}
      alt="Clark the builder"
      width={size}
      height={size}
      className={cn("cursor-pointer select-none", className)}
      onDoubleClick={handleDoubleClick}
      title="Double-click to toggle dark mode"
    />
  );
}
