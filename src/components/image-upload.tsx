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
}

export function ImageUpload({
  onFileChange,
  previewUrl,
  clearPreview,
  accept = "image/png, image/jpeg, image/dicom, image/x-ray, image/ct, image/mri", // Common medical image types + standard web formats
  className,
  id = "image-upload",
}: ImageUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileChange(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent triggering the dropzone click
    clearPreview();
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // You can add visual cues here if needed
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    if (file && (!accept || accept.includes(file.type))) {
        onFileChange(file);
        if (fileInputRef.current) {
           // Create a new DataTransfer object and add the file
           const dataTransfer = new DataTransfer();
           dataTransfer.items.add(file);
           fileInputRef.current.files = dataTransfer.files;
        }
    } else {
        // Handle invalid file type
        console.warn("Invalid file type dropped:", file?.type);
        // Optionally, show a user-facing error message
    }
  };


  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors duration-200 ease-in-out",
        isDragging ? "border-accent bg-accent/10" : "border-border hover:border-accent/80",
        previewUrl ? "border-solid" : "",
        className
      )}
      onClick={!previewUrl ? handleButtonClick : undefined} // Only trigger file input if no preview
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Input
        ref={fileInputRef}
        id={id}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept={accept}
      />
      {previewUrl ? (
        <>
          <Image
            src={previewUrl}
            alt="Image preview"
            width={200}
            height={200}
            className="max-h-48 w-auto object-contain rounded-md"
            data-ai-hint="medical scan preview"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/70 hover:bg-background rounded-full"
            onClick={handleClear}
            aria-label="Clear image"
          >
            <X className="h-5 w-5" />
          </Button>
        </>
      ) : (
        <div className="text-center">
          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            <span className="font-semibold text-accent">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            MRI, CT, X-Ray, PNG, JPG etc.
          </p>
        </div>
      )}
    </div>
  );
}
