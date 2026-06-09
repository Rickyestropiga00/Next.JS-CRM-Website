import React from 'react';
import { Task, ColumnKey } from '@/types/interface';
import { TaskCard } from './task-card';
import { getId } from '@/utils/helper';
import { DroppableColumn } from './droppable-column';
import { TaskSkeleton } from './tasks-skeleton';
import { useTranslations } from 'next-intl';
import { useTasks } from '@/hooks/use-tasks';

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
  tasksLoading?: boolean;
  highlightId?: string | null;
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
  tasksLoading,
  highlightId,
}: ColumnsBoardProps) {
  const t = useTranslations();
  const { updateTask } = useTasks();

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
                <span className="inline-flex items-center justify-center rounded-full text-xs font-semibold min-w-[20px] h-5 px-1.5 bg-primary text-white">
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
                  <span className="sr-only">
                    {t('Tasks.board.header.addTask')}
                  </span>
                  +
                </button>
              </div>
            </div>

            {tasksLoading
              ? Array.from({ length: 2 }).map((_, i) => (
                  <TaskSkeleton key={i} />
                ))
              : columnTasks.map((task) => (
                  <TaskCard
                    key={getId(task)}
                    task={task}
                    onUpdateTask={updateTask}
                    columns={columns}
                    onMove={onMoveTask}
                    onDelete={onDeleteTask}
                    onEdit={onEditTask}
                    deleteDialogId={deleteDialogId}
                    setDeleteDialogId={setDeleteDialogId}
                    isHighlighted={highlightId === task._id}
                  />
                ))}
          </DroppableColumn>
        );
      })}
    </div>
  );
}
