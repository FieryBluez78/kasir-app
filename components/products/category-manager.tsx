"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useApi } from "@/lib/hooks/use-api";
import { useLanguage } from "@/lib/i18n/language-provider";
import type { Category } from "@/types";

export function CategoryManager() {
  const { t } = useLanguage();
  const { data: categories, refetch } = useApi<Category[]>("/api/categories");
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      setNewName("");
      refetch();
    } else {
      toast.error(t("errors.generic"));
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return;
    const res = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName.trim() }),
    });
    if (res.ok) {
      setEditingId(null);
      refetch();
    } else {
      toast.error(t("errors.generic"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/categories/${deleteTarget.id}`, { method: "DELETE" });
    setDeleteTarget(null);
    refetch();
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={t("categories.addCategory")}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="divide-y divide-border rounded-md border border-border">
        {categories?.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2 px-3 py-2">
            {editingId === cat.id ? (
              <Input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUpdate(cat.id)}
                autoFocus
                className="h-8"
              />
            ) : (
              <span className="flex-1 text-sm">
                {cat.name}
                <span className="ml-2 text-xs text-muted-foreground">({cat._count?.products ?? 0})</span>
              </span>
            )}
            <div className="flex gap-1">
              {editingId === cat.id ? (
                <Button size="sm" onClick={() => handleUpdate(cat.id)}>
                  {t("common.save")}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingId(cat.id);
                    setEditingName(cat.name);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(cat)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("categories.deleteConfirmTitle")}
        description={t("categories.deleteConfirmDesc")}
        onConfirm={handleDelete}
      />
    </div>
  );
}
