import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-xl border border-white/10 bg-[#100b08]/95 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus-visible:border-[#c8a96e]/45 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
