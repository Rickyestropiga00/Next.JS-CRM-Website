"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";

// Dynamically import modal to reduce initial bundle size
const AddNewTaskPopover = dynamic(
  () => import("@/app/tasks/components/add-new-task-popover").then((mod) => ({ default: mod.AddNewTaskPopover })),
  { ssr: false }
);

export function TasksSection() {
  const { tasks: taskList, addTask, isLoading } = useTasks();
  const [selectedTaskCategory, setSelectedTaskCategory] =
    useState<string>("todo");
  const [showAddNewTask, setShowAddNewTask] = useState<boolean>(false);

  // Calculate task statistics from current tasks
  const taskCount = useMemo(() => {
    const todoTasks = taskList.filter((task) => task.column === "todo").length;
    const inProgressTasks = taskList.filter(
      (task) => task.column === "inprogress"
    ).length;
    const inReviewTasks = taskList.filter(
      (task) => task.column === "inreview"
    ).length;
    const doneTasks = taskList.filter((task) => task.column === "done").length;
    const totalTasks = taskList.length;

    return {
      total: totalTasks,
      todo: todoTasks,
      inProgress: inProgressTasks,
      inReview: inReviewTasks,
      done: doneTasks,
    };
  }, [taskList]);

  const handleAddNewTask = (newTask: (typeof taskList)[0]) => {
    addTask(newTask);
    setSelectedTaskCategory(newTask.column);
    setShowAddNewTask(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="px-4 py-8">
          <div className="text-center text-muted-foreground">Loading tasks...</div>
        </CardContent>
      </Card>
    );
  }



  return (
    <Card>
      <CardContent className="px-4">
        <div className="flex flex-col gap-4">
          {/* Header with My Tasks */}
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg lg:text-base">My Tasks</h2>
            <Button
              className="flex items-center gap-2 cursor-pointer"
              type="button"
              onClick={() => setShowAddNewTask(true)}
            >
              <Plus className="h-4 w-4" />
              Add New Task
            </Button>
          </div>

          <Select
            value={selectedTaskCategory}
            onValueChange={setSelectedTaskCategory}
          >
            <SelectTrigger className="flex items-center gap-3 bg-muted px-3 py-4 lg:py-3 rounded-full w-fit border-0 hover:bg-muted/80 transition-colors">
              <div className="flex items-center justify-center w-6 h-6 lg:w-5 lg:h-5 rounded-full bg-primary text-primary-foreground text-sm lg:text-xs font-semibold">
                {selectedTaskCategory
                  ? selectedTaskCategory === "todo"
                    ? taskCount.todo
                    : selectedTaskCategory === "inprogress"
                    ? taskCount.inProgress
                    : selectedTaskCategory === "inreview"
                    ? taskCount.inReview
                    : taskCount.done
                  : taskCount.total}
              </div>
              <span className="text-sm lg:text-xs font-medium">
                {selectedTaskCategory
                  ? selectedTaskCategory === "todo"
                    ? "To Do"
                    : selectedTaskCategory === "inprogress"
                    ? "In Progress"
                    : selectedTaskCategory === "inreview"
                    ? "In Review"
                    : "Done"
                  : "On Going Tasks"}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="inprogress">In Progress</SelectItem>
              <SelectItem value="inreview">In Review</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>

          {/* Task Data Display - Only show selected category */}
          {selectedTaskCategory && (
            <div className="space-y-3">
              {taskList
                .filter((task) => task.column === selectedTaskCategory)
                .map((task) => (
                  <div
                    key={task.id}
                    className="bg-muted/50 p-3 lg:p-2 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm lg:text-xs font-medium truncate">
                          {task.title}
                        </h4>
                        <p className="text-xs lg:text-[11px] text-muted-foreground mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </CardContent>
      <AddNewTaskPopover
        isOpen={showAddNewTask}
        onAddNewTask={handleAddNewTask}
        onClose={() => setShowAddNewTask(false)}
      />
    </Card>
  );
}
