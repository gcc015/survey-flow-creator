
import React from "react";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  iconColor?: string;
  textColor?: string;
  fontSize?: string;
  hideText?: boolean;
  className?: string;
}

export default function Logo({
  size = 100,
  iconColor = "#1a365d",
  textColor = "#1a365d", 
  fontSize = "text-3xl",
  hideText = false,
  className
}: LogoProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="mb-2">
        <Eye 
          size={size} 
          strokeWidth={1.5} 
          className={`text-[${iconColor}] stroke-current`}
        />
      </div>
      {!hideText && (
        <div className={`${fontSize} font-bold`} style={{ color: textColor }}>
          DeepSurvey
        </div>
      )}
    </div>
  );
}
