import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  text?: string
  variant?: "default" | "primary" | "secondary"
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12"
}

const variantClasses = {
  default: "text-muted-foreground",
  primary: "text-primary",
  secondary: "text-secondary"
}

export function LoadingSpinner({ 
  size = "md", 
  className, 
  text,
  variant = "default" 
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 
        className={cn(
          "animate-spin",
          sizeClasses[size],
          variantClasses[variant]
        )} 
      />
      {text && (
        <p className={cn("text-sm text-muted-foreground", variantClasses[variant])}>
          {text}
        </p>
      )}
    </div>
  )
}

// Full page loading spinner
export function FullPageSpinner({ text = "Laden..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <LoadingSpinner size="xl" text={text} />
    </div>
  )
}

// Inline loading spinner
export function InlineSpinner({ size = "sm", className }: { size?: "sm" | "md" | "lg", className?: string }) {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <LoadingSpinner size={size} />
    </div>
  )
}

// Button loading spinner
export function ButtonSpinner({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <Loader2 className={cn("animate-spin", sizeClasses[size])} />
  )
} 