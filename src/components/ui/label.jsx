import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

/** @typedef {React.LabelHTMLAttributes<HTMLLabelElement>} LabelProps */

const LabelInner = React.forwardRef(
  /** @param {LabelProps} props */
  ({ className, ...props }, ref) => (
    <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
  )
)
LabelInner.displayName = LabelPrimitive.Root.displayName

/** @type {React.ForwardRefExoticComponent<LabelProps & React.RefAttributes<HTMLLabelElement>>} */
const Label = LabelInner

export { Label }
