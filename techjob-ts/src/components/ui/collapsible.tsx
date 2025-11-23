// src/components/ui/collapsible.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface CollapsibleContextValue {
  isOpen: boolean;
  toggle: () => void;
}

const CollapsibleContext = React.createContext<
  CollapsibleContextValue | undefined
>(undefined);

const useCollapsible = () => {
  const context = React.useContext(CollapsibleContext);
  if (!context) {
    throw new Error("Collapsible components must be used within Collapsible");
  }
  return context;
};

interface CollapsibleProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ open, onOpenChange, children, className }, ref) => {
    const [isOpen, setIsOpen] = React.useState(open ?? false);

    React.useEffect(() => {
      if (open !== undefined) {
        setIsOpen(open);
      }
    }, [open]);

    const toggle = () => {
      const newOpen = !isOpen;
      setIsOpen(newOpen);
      onOpenChange?.(newOpen);
    };

    return (
      <CollapsibleContext.Provider value={{ isOpen, toggle }}>
        <div
          ref={ref}
          data-state={isOpen ? "open" : "closed"}
          className={className}
        >
          {children}
        </div>
      </CollapsibleContext.Provider>
    );
  }
);
Collapsible.displayName = "Collapsible";

interface CollapsibleTriggerProps
  extends React.HTMLAttributes<HTMLButtonElement> {}

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  CollapsibleTriggerProps
>(({ className, children, onClick, ...props }, ref) => {
  const { toggle } = useCollapsible();

  return (
    <button
      ref={ref}
      type="button"
      className={cn("w-full", className)}
      onClick={(e) => {
        toggle();
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
});
CollapsibleTrigger.displayName = "CollapsibleTrigger";

interface CollapsibleContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  CollapsibleContentProps
>(({ className, children, ...props }, ref) => {
  const { isOpen } = useCollapsible();

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden transition-all duration-200 ease-in-out",
        "animate-in slide-in-from-top-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
