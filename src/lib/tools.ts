export interface Tool {
  slug: string;
  name: string;
  description: string;
  icon: string;
  iconBg: string;
  accentBg: string;
}

export const tools: Tool[] = [
  {
    slug: "/pdf-editor",
    name: "PDF Editor",
    description:
      "Edit, draw, add text, merge, reorder, and split PDF documents entirely within your browser. High performance virtualized rendering.",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    iconBg: "bg-blue-600",
    accentBg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    slug: "/heic-converter",
    name: "HEIC Converter",
    description:
      "Batch convert Apple HEIC photos to universal JPG format. Uses Web Workers so your browser never freezes during heavy conversions.",
    icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    iconBg: "bg-amber-500",
    accentBg: "bg-amber-100 dark:bg-amber-900/30",
  },
];
