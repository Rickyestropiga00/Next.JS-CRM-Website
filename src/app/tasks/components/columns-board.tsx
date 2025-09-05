import React from "react";
import { Task, ColumnKey } from "../data";
import { TaskCard } from "./task-card";

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
        isSidebarCollapsed ? "lg:grid-cols-4" : "lg:grid-cols-2 xl:grid-cols-4"
      } gap-4 p-4 items-start`}
    >
      {columns.map((col) => {
        const columnTasks = filteredTasks.filter(
          (task) => task.column === col.key
        );
        return (
          <div
            key={col.key}
            className="bg-muted/50 rounded-xl p-4 flex flex-col"
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold text-lg">{col.label}</div>
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
                key={task.id}
                task={task}
                columns={columns}
                onMove={onMoveTask}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
                deleteDialogId={deleteDialogId}
                setDeleteDialogId={setDeleteDialogId}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
