"use client";

import Dropzone from "./Dropzone";

interface HEICDropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

export default function HEICDropzone({ onFilesSelected }: HEICDropzoneProps) {
  return (
    <Dropzone
      onFilesSelected={onFilesSelected}
      accept=".heic,.heif,image/heic,image/heif"
      title="Drag & Drop HEIC files"
      activeTitle="Drop files here"
      icon="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      activeAccent="border-amber-500 bg-amber-50 dark:bg-amber-900/20"
      activeIconColor="text-amber-500"
    />
  );
}
