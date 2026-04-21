import * as React from "react"

import { cn } from "@/lib/utils"

function Button({
  className,
  type = "button",
  variant = "default",
  ...props
}) {
  const variantClassName =
    variant === "outline"
      ? "border border-white/10 bg-transparent text-white hover:bg-white/10"
      : "border border-[#7d5a20] bg-[#2b1d10] text-[#f6e7c7] hover:bg-[#3a2918]"

  return (
    <button
      data-slot="button"
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        variantClassName,
        className,
      )}
      {...props}
    />
  )
}

export { Button }
