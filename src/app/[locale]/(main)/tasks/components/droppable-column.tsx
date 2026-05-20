'use client';
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ColumnKey } from '@/types/interface';
interface DroppableColumnProps {
  col: {
    key: ColumnKey;
    label: string;
  };
  children: React.ReactNode;
}

export const DroppableColumn = ({ col, children }: DroppableColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: col.key,
    data: { column: col.key },
  });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl p-4 flex flex-col transition-all duration-150
    
  `}
    >
      {children}
      {isOver && (
        <div
          className="mt-4 rounded-xl border-2 border-dashed border-gray-400 bg-gray-50/40 dark:bg-gray-900/20 dark:border-gray-500 flex justify-center items-center"
          style={{ minHeight: '60px' }}
          aria-hidden="true"
        >
          <div className="w-full h-full flex items-center justify-center opacity-40">
            <span className=" text-lg">DROP HERE</span>{' '}
          </div>
        </div>
      )}
    </div>
  );
};
