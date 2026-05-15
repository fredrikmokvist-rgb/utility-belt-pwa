"use client";

import { usePDF } from "@/contexts/PDFContext";
import FileUpload from "./FileUpload";
import PDFPage from "./PDFPage";
import Sidebar from "./Sidebar";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, ChangeEvent } from "react";

export default function MainEditor() {
  const { fileUrl, pageIds, movePage, mergeFile, saveDocument, undo, historyLength, isProcessing } = usePDF();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!fileUrl) {
    return (
      <div className="flex flex-1 items-center justify-center w-full min-h-[calc(100vh-2rem)]">
        <FileUpload />
      </div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = pageIds.indexOf(active.id as string);
      const newIndex = pageIds.indexOf(over.id as string);
      movePage(oldIndex, newIndex);
    }
  };

  const handleMergeFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      await mergeFile(file);
    }
  };

  return (
    <div className="flex flex-row w-full h-screen bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <header className="flex items-center justify-between px-8 py-4 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shrink-0 z-20">
          <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            Document Editor
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => undo()}
              disabled={historyLength === 0 || isProcessing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Undo
            </button>
            <button
              onClick={() => saveDocument()}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="flex flex-col w-full max-w-5xl mx-auto">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={pageIds} strategy={verticalListSortingStrategy}>
                <AnimatePresence>
                  {pageIds.map((id, index) => (
                    <motion.div
                      key={id}
                      id={`page-${id}`}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="scroll-mt-8"
                    >
                      <PDFPage pageId={id} pageNumber={index + 1} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </SortableContext>
            </DndContext>

            <div className="flex justify-center my-12">
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleMergeFileChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-8 py-4 font-semibold text-zinc-600 bg-white border-2 border-dashed border-zinc-300 rounded-2xl hover:border-zinc-500 hover:text-zinc-800 transition-all shadow-sm hover:shadow-md"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Another PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
