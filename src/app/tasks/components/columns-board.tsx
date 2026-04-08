import React from 'react';
import { Task, ColumnKey } from '@/types/interface';
import { TaskCard } from './task-card';
import { getId } from '@/utils/helper';
import { DroppableColumn } from './droppable-column';

interface ColumnsBoardProps {
  columns: { key: ColumnKey; label: string }[];
  filteredTasks: Task[];
  onMoveTask: (id: string, newColumn: ColumnKey) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (id: string | null) => void;
  onAddTask: (column: ColumnKey) => void;
  deleteDialogId: string | null;
  setDeleteDialogId: (id: string | null) => void;
  isSidebarCollapsed: boolean;
}

export function ColumnsBoard({
  columns,
  filteredTasks,
  onMoveTask,
  onDeleteTask,
  onEditTask,
  onAddTask,
  deleteDialogId,
  setDeleteDialogId,
  isSidebarCollapsed,
}: ColumnsBoardProps) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 ${
        isSidebarCollapsed ? 'lg:grid-cols-4' : 'lg:grid-cols-2 xl:grid-cols-4'
      } gap-4 p-4 items-start`}
    >
      {columns.map((col) => {
        const columnTasks = filteredTasks.filter(
          (task) => task.column === col.key
        );

        return (
          <DroppableColumn col={col} key={col.key}>
            <div className="flex items-center justify-between">
              <div className="font-semibold text-lg flex justify-center items-center gap-2">
                <span className="inline-flex items-center justify-center rounded-full text-xs font-semibold min-w-[20px] h-5 px-1.5 bg-primary">
                  {columnTasks.length}
                </span>
                {col.label}{' '}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Add task"
                  className="p-2 rounded-md hover:bg-muted transition cursor-pointer"
                  onClick={() => onAddTask(col.key)}
                >
                  <span className="sr-only">Add task</span>+
                </button>
              </div>
            </div>

            {columnTasks.map((task) => (
              <TaskCard
                key={getId(task)}
                task={task}
                columns={columns}
                onMove={onMoveTask}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
                deleteDialogId={deleteDialogId}
                setDeleteDialogId={setDeleteDialogId}
              />
            ))}
          </DroppableColumn>
        );
      })}
    </div>
  );
}
