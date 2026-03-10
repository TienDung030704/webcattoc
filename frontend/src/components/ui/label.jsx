import * as React from "react"

import { cn } from "@/lib/utils"

function Label({ className, ...props }) {
  return (
    <label
      data-slot="label"
      className={cn("text-sm font-semibold text-[#f6e7c7]", className)}
      {...props}
    />
  )
}

export { Label }
