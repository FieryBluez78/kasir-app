"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, title, children }: SheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 rounded-t-xl border-t border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
          <div className="mb-2 flex items-center justify-between">
            <DialogPrimitive.Title className="font-display text-sm font-semibold">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="rounded-sm p-1 text-muted-foreground hover:bg-secondary">
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
