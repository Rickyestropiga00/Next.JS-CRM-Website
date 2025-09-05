import React from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { Filters } from "./filters";
import { ColumnsBoard } from "./columns-board";
import { EditTaskPopover } from "./edit-task-popover";
import { AddTaskPopover } from "./add-task-popover";
import { Task, ColumnKey } from "../data";
import { tasks } from "../data";

interface TasksContentProps {}

export function TasksContent({}: TasksContentProps) {
  const { state } = useSidebar();
  const isSidebarCollapsed = state === "collapsed";

  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all");
  const [taskList, setTaskList] = React.useState(tasks);
  const [deleteDialogId, setDeleteDialogId] = React.useState<string | null>(
    null
  );
  const [editTaskId, setEditTaskId] = React.useState<string | null>(null);
  const [showAddTask, setShowAddTask] = React.useState(false);
  const [addTaskColumn, setAddTaskColumn] = React.useState<ColumnKey>("todo");

  const statusOptions = [
    { label: "All Categories", value: "all" },
    { label: "Design", value: "DESIGN" },
    { label: "Development", value: "DEVELOPMENT" },
    { label: "Testing", value: "TESTING" },
    { label: "Content", value: "CONTENT" },
    { label: "Marketing", value: "MARKETING" },
    { label: "Meeting", value: "MEETING" },
    { label: "Follow-up", value: "FOLLOW-UP" },
  ];
  const priorityOptions = [
    { label: "All Priority", value: "all" },
    { label: "Low", value: "LOW" },
    { label: "Medium", value: "MEDIUM" },
    { label: "High", value: "HIGH" },
  ];

  const columns = [
    { key: "todo" as const, label: "To do" },
    { key: "inprogress" as const, label: "In progress" },
    { key: "inreview" as const, label: "In review" },
    { key: "done" as const, label: "Done" },
  ];

  // Filter tasks by status and priority
  const filteredTasks = taskList.filter(
    (task) =>
      (statusFilter === "all" || task.status === statusFilter) &&
      (priorityFilter === "all" || task.priority === priorityFilter)
  );

  function handleDeleteTask(id: string) {
    setTaskList((prev) => prev.filter((task) => task.id !== id));
  }

  function handleMoveTask(id: string, newColumn: Task["column"]) {
    setTaskList((prev) => {
      const taskToMove = prev.find((task) => task.id === id);
      if (!taskToMove || taskToMove.column === newColumn) return prev;
      const filtered = prev.filter((task) => task.id !== id);
      const updatedTask = { ...taskToMove, column: newColumn };
      const insertIndex = filtered.findIndex(
        (task) => task.column === newColumn
      );
      if (insertIndex === -1) {
        return [updatedTask, ...filtered];
      } else {
        return [
          ...filtered.slice(0, insertIndex),
          updatedTask,
          ...filtered.slice(insertIndex),
        ];
      }
    });
  }

  function handleEditTask(updatedTask: Task) {
    setTaskList((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  }

  function handleAddTask(newTask: Task) {
    setTaskList((prev) => [newTask, ...prev]);
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 px-4 pb-2 pt-3">
        <Filters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          statusOptions={statusOptions}
          priorityOptions={priorityOptions}
        />
      </div>
      <ColumnsBoard
        columns={columns}
        filteredTasks={filteredTasks}
        onMoveTask={handleMoveTask}
        onDeleteTask={handleDeleteTask}
        onEditTask={setEditTaskId}
        onAddTask={(column) => {
          setAddTaskColumn(column);
          setShowAddTask(true);
        }}
        deleteDialogId={deleteDialogId}
        setDeleteDialogId={setDeleteDialogId}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* Edit Task Modal - Rendered outside board structure */}
      {editTaskId && (
        <EditTaskPopover
          task={taskList.find((t) => t.id === editTaskId)!}
          onSave={(updatedTask) => {
            handleEditTask(updatedTask);
            setEditTaskId(null);
          }}
          onClose={() => setEditTaskId(null)}
          open={true}
        />
      )}

      {/* Add Task Modal - Rendered outside board structure */}
      <AddTaskPopover
        isOpen={showAddTask}
        onAddTask={(newTask) => {
          handleAddTask(newTask);
          setShowAddTask(false);
        }}
        onClose={() => setShowAddTask(false)}
        defaultColumn={addTaskColumn}
      />
    </>
  );
}
