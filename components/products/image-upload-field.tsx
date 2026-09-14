"use client";

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-provider";

interface ImageUploadFieldProps {
  value: string;
  onChange: (dataUrl: string) => void;
}

/**
 * Stores the image as a base64 data URL for this starter's zero-config demo
 * flow. Swap the `handleFile` implementation for a real upload (S3,
 * Cloudinary, Vercel Blob, etc.) that returns a hosted URL when moving to
 * production — the rest of the form only cares that `imageUrl` is a string.
 */
export function ImageUploadField({ value, onChange }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{t("products.photo")}</label>
      <div className="flex items-center gap-4">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-secondary">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            {value ? t("products.changePhoto") : t("products.uploadPhoto")}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              <X className="h-3.5 w-3.5" />
              {t("products.removePhoto")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
