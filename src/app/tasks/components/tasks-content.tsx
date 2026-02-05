import React from "react";
import dynamic from "next/dynamic";
import { useSidebar } from "@/components/ui/sidebar";
import { Filters } from "./filters";
import { ColumnsBoard } from "./columns-board";
import { Task, ColumnKey } from "../data";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";

// Dynamically import task modals to reduce initial bundle size
const EditTaskPopover = dynamic(
  () => import("./edit-task-popover").then((mod) => ({ default: mod.EditTaskPopover })),
  { ssr: false }
);

const AddTaskPopover = dynamic(
  () => import("./add-task-popover").then((mod) => ({ default: mod.AddTaskPopover })),
  { ssr: false }
);

const AddNewTaskPopover = dynamic(
  () => import("./add-new-task-popover").then((mod) => ({ default: mod.AddNewTaskPopover })),
  { ssr: false }
);

interface TasksContentProps {}

export function TasksContent({}: TasksContentProps) {
  const { state } = useSidebar();
  const isSidebarCollapsed = state === "collapsed";
  const { tasks: taskList, addTask, updateTask, deleteTask, moveTask } = useTasks();

  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all");
  const [deleteDialogId, setDeleteDialogId] = React.useState<string | null>(
    null
  );
  const [editTaskId, setEditTaskId] = React.useState<string | null>(null);
  const [showAddTask, setShowAddTask] = React.useState(false);
  const [addTaskColumn, setAddTaskColumn] = React.useState<ColumnKey>("todo");
  const [showAddNewTask, setShowAddNewTask] = React.useState(false);

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
    deleteTask(id);
  }

  function handleMoveTask(id: string, newColumn: Task["column"]) {
    moveTask(id, newColumn);
  }

  function handleAddNewTask(newTask: Task) {
    addTask(newTask);
    setShowAddNewTask(false);
  }

  function handleEditTask(updatedTask: Task) {
    updateTask(updatedTask);
  }

  function handleAddTask(newTask: Task) {
    addTask(newTask);
  }

  return (
    <>
      <div  className="flex w-full items-center justify-between gap-2 flex-wrap mb-2 mt-3 px-4">
        <div className="flex flex-wrap gap-2 ">
          <Filters
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            statusOptions={statusOptions}
            priorityOptions={priorityOptions}
          />
        </div>

        <Button
          className="flex items-center gap-2 cursor-pointer"
          type="button"
          onClick={() => setShowAddNewTask(true)}
        >
          <Plus className="h-4 w-4" />
          Add New Task
        </Button>
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
      
      <AddNewTaskPopover
        isOpen={showAddNewTask}
        onAddNewTask={(newTask) => {
          handleAddNewTask(newTask);
          setShowAddNewTask(false);
        }}
        onClose={() => setShowAddNewTask(false)}
      />
    </>
  );
}
