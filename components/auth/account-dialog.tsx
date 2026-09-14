"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/i18n/language-provider";
import { useSession } from "@/lib/session-provider";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
  const { t } = useLanguage();
  const { session, refresh } = useSession();

  const [name, setName] = useState(session.name);
  const [email, setEmail] = useState(session.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(session.name);
      setEmail(session.email);
      setCurrentPassword("");
      setNewPassword("");
      setError(null);
    }
  }, [open, session.name, session.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, currentPassword, newPassword: newPassword || undefined }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      if (body.error === "WRONG_PASSWORD") setError(t("auth.wrongPassword"));
      else if (body.error === "EMAIL_TAKEN") setError(t("auth.emailTaken"));
      else setError(t("errors.generic"));
      return;
    }

    toast.success(t("auth.accountUpdateSuccess"));
    await refresh();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("auth.myAccount")}</DialogTitle>
          <DialogDescription>{t("auth.accountSubtitle")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="acc-name">{t("auth.name")}</Label>
            <Input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="acc-email">{t("auth.email")}</Label>
            <Input id="acc-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="acc-new-password">{t("auth.newPassword")}</Label>
            <Input
              id="acc-new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("auth.newPasswordHint")}
              autoComplete="new-password"
            />
          </div>
          <div>
            <Label htmlFor="acc-current-password">{t("auth.currentPassword")}</Label>
            <Input
              id="acc-current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={submitting}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}