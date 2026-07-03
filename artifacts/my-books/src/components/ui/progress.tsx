"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const id = React.useId().replace(/:/g, "-")
  const pct = Math.max(0, Math.min(100, value || 0))
  const css = `
    .progress-${id} .progress-indicator { transform: translateX(-${100 - pct}%); }
  `
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        `progress-${id}`,
        className
      )}
      {...props}
    >
      <style>{css}</style>
      <ProgressPrimitive.Indicator className="h-full w-full flex-1 bg-primary transition-all progress-indicator" />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
