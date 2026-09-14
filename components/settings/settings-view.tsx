"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CategoryManager } from "@/components/products/category-manager";
import { useApi } from "@/lib/hooks/use-api";
import { useLanguage } from "@/lib/i18n/language-provider";
import { useTheme } from "@/lib/theme-provider";
import { useSession } from "@/lib/session-provider";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/dictionaries";
import type { StoreSettings } from "@/types";

export function SettingsView() {
  const { t, locale, setLocale } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { session } = useSession();
  const { data: settings, refetch } = useApi<StoreSettings>("/api/settings");

  const [form, setForm] = useState({ storeName: "", address: "", phone: "", currency: "IDR" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        storeName: settings.storeName,
        address: settings.address ?? "",
        phone: settings.phone ?? "",
        currency: settings.currency,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(t("settings.saveSuccess"));
      refetch();
    } else {
      toast.error(t("errors.generic"));
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold">{t("settings.title")}</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("auth.loggedInAs")}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{session.name}</p>
            <p className="text-xs text-muted-foreground">{session.email}</p>
          </div>
          <Badge variant={session.role === "ADMIN" ? "default" : "secondary"}>
            {session.role === "ADMIN" ? "Admin" : "Kasir / Cashier"}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.storeSettings")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="storeName">{t("settings.storeName")}</Label>
            <Input id="storeName" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="address">{t("settings.storeAddress")}</Label>
            <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="phone">{t("settings.storePhone")}</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <Label>{t("settings.currency")}</Label>
            <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IDR">IDR (Rupiah)</SelectItem>
                <SelectItem value="USD">USD (Dollar)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {t("common.save")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("categories.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryManager />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.language")}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          {LOCALES.map((code) => (
            <Button key={code} variant={locale === code ? "default" : "outline"} size="sm" onClick={() => setLocale(code)}>
              {LOCALE_LABELS[code].flag} {LOCALE_LABELS[code].label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.appearance")}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-sm">{theme === "dark" ? t("settings.darkMode") : t("settings.lightMode")}</span>
          <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
        </CardContent>
      </Card>
    </div>
  );
}
