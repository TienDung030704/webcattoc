import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type = "text", ...props }) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        "flex h-12 w-full rounded-xl border border-white/10 bg-[#100b08]/95 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus-visible:border-[#c8a96e]/45 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
