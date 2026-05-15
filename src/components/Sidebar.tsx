"use client";

import { usePDF } from "@/contexts/PDFContext";
import PDFThumbnail from "./PDFThumbnail";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export default function Sidebar() {
  const { pageIds, fileUrl, movePage } = usePDF();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  if (!fileUrl) return null;

  const scrollToPage = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = pageIds.indexOf(active.id as string);
      const newIndex = pageIds.indexOf(over.id as string);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        movePage(oldIndex, newIndex);
      }
    }
  };

  return (
    <div className="w-64 h-screen bg-zinc-100 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden shrink-0">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-md">
        <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
          Pages ({pageIds.length})
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={pageIds}
            strategy={verticalListSortingStrategy}
          >
            {pageIds.map((id, index) => (
              <PDFThumbnail 
                key={id} 
                id={id}
                pageNumber={index + 1} 
                onClick={() => scrollToPage(`page-${id}`)} 
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
