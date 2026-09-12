import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/utils"

const DialogContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({ open: false, onOpenChange: () => {} })

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

export function DialogContent({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { open, onOpenChange } = React.useContext(DialogContext)
  const overlayRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false)
      }
    }
    if (open) {
      document.body.style.overflow = "hidden"
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.body.style.overflow = "unset"
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div
        ref={overlayRef}
        className="absolute inset-0"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg sm:rounded-lg duration-200 animate-in fade-in-90 zoom-in-95 max-h-[90vh] overflow-y-auto overflow-x-hidden",
          className
        )}
      >
        {children}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function DialogHeader({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className
      )}
    >
      {children}
    </div>
  )
}

export function DialogFooter({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
    >
      {children}
    </div>
  )
}

export function DialogTitle({
  className,
  children,
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
    >
      {children}
    </h2>
  )
}

export function DialogDescription({
  className,
  children,
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  )
}
