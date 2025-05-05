
"use client";

import * as React from "react";
import Image from "next/image";
import { UploadCloud, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onFileChange: (file: File | null) => void;
  previewUrl: string | null;
  clearPreview: () => void;
  accept?: string;
  className?: string;
  id?: string;
  disabled?: boolean; // Added disabled prop
}

export function ImageUpload({
  onFileChange,
  previewUrl,
  clearPreview,
  accept = "image/png, image/jpeg, image/dicom, image/x-ray, image/ct, image/mri", // Common medical image types + standard web formats
  className,
  id = "image-upload",
  disabled = false, // Default to false
}: ImageUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     if (disabled) return;
    const file = event.target.files?.[0] || null;
    onFileChange(file);
  };

  const handleButtonClick = () => {
     if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
     if (disabled) return;
    e.stopPropagation(); // Prevent triggering the dropzone click
    clearPreview();
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
     if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
     if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    // Check if the leave target is outside the dropzone boundary
    // This prevents flickering when dragging over child elements
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
     if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy'; // Explicitly show copy cursor
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
     if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;

    // Check if the file type is accepted
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const isFileTypeAccepted = file && (accept === "*/*" || acceptedTypes.some(type => {
        if (type.endsWith('/*')) { // Handle wildcard subtypes like image/*
            return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
    }));


    if (file && isFileTypeAccepted) {
        onFileChange(file);
        if (fileInputRef.current) {
           // Create a new DataTransfer object and add the file
           const dataTransfer = new DataTransfer();
           dataTransfer.items.add(file);
           fileInputRef.current.files = dataTransfer.files;
        }
    } else if (file) {
        // Handle invalid file type
        console.warn("Invalid file type dropped:", file.type);
        // Optionally, show a user-facing error message (e.g., using toast)
        // toast({ title: "Invalid File Type", description: `Please upload a file of type: ${accept}`, variant: "destructive" });
    }
  };


  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg p-8 transition-colors duration-200 ease-in-out",
        disabled
          ? "cursor-not-allowed bg-muted/50 border-border/50" // Disabled styles
          : "cursor-pointer border-border hover:border-accent/80",
        isDragging && !disabled ? "border-accent bg-accent/10" : "",
        previewUrl ? "border-solid" : "",
        className
      )}
      onClick={!previewUrl && !disabled ? handleButtonClick : undefined} // Only trigger file input if no preview and not disabled
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      aria-disabled={disabled}
    >
      <Input
        ref={fileInputRef}
        id={id}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept={accept}
        disabled={disabled} // Disable the actual input
      />
      {previewUrl ? (
        <>
          <Image
            src={previewUrl}
            alt="Image preview"
            width={200}
            height={200}
            className={cn(
              "max-h-48 w-auto object-contain rounded-md",
              disabled ? "opacity-50" : "" // Dim preview when disabled
            )}
            data-ai-hint="medical scan preview"
          />
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-2 right-2 bg-background/70 hover:bg-background rounded-full",
              disabled ? "hidden" : "" // Hide clear button when disabled
             )}
            onClick={handleClear}
            aria-label="Clear image"
            disabled={disabled}
          >
            <X className="h-5 w-5" />
          </Button>
        </>
      ) : (
        <div className={cn("text-center", disabled ? "opacity-50" : "")}>
          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            {disabled ? (
                "Upload disabled"
            ) : (
                 <>
                    <span className="font-semibold text-accent">Click to upload</span> or drag and drop
                 </>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
             {accept === "*/*" ? "Any file type" : accept.split(',').map(t => t.split('/')[1]?.toUpperCase() || t).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
