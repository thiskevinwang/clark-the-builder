"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

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

  const alt = mounted && isDark ? "Karl the builder" : "Clark the builder";

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={size}
      height={size}
      className={cn("cursor-pointer select-none", className)}
      onDoubleClick={handleDoubleClick}
      title="Double-click to toggle dark mode"
    />
  );
}

export function ClarkName() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";
  const name = mounted && isDark ? "Karl" : "Clark";

  return <>{name}</>;
}
