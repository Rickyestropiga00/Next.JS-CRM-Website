"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { tasks } from "@/app/tasks/data";

// Utility function to calculate task statistics
const calculateTaskStats = () => {
  const todoTasks = tasks.filter((task) => task.column === "todo").length;
  const inProgressTasks = tasks.filter(
    (task) => task.column === "inprogress"
  ).length;
  const inReviewTasks = tasks.filter(
    (task) => task.column === "inreview"
  ).length;
  const doneTasks = tasks.filter((task) => task.column === "done").length;
  const totalTasks = tasks.length;

  return {
    total: totalTasks,
    todo: todoTasks,
    inProgress: inProgressTasks,
    inReview: inReviewTasks,
    done: doneTasks,
  };
};

export function TasksSection() {
  const taskStats = calculateTaskStats();
  const [selectedTaskCategory, setSelectedTaskCategory] =
    useState<string>("todo");

  return (
    <Card>
      <CardContent className="px-4">
        <div className="flex flex-col gap-4">
          {/* Header with My Tasks */}
          <div className="flex items-center">
            <h2 className="font-semibold text-lg lg:text-base">My Tasks</h2>
          </div>

          <Select
            value={selectedTaskCategory}
            onValueChange={setSelectedTaskCategory}
          >
            <SelectTrigger className="flex items-center gap-3 bg-muted px-3 py-4 lg:py-3 rounded-full w-fit border-0 hover:bg-muted/80 transition-colors">
              <div className="flex items-center justify-center w-6 h-6 lg:w-5 lg:h-5 rounded-full bg-primary text-primary-foreground text-sm lg:text-xs font-semibold">
                {selectedTaskCategory
                  ? selectedTaskCategory === "todo"
                    ? taskStats.todo
                    : selectedTaskCategory === "inprogress"
                    ? taskStats.inProgress
                    : selectedTaskCategory === "inreview"
                    ? taskStats.inReview
                    : taskStats.done
                  : taskStats.total}
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
              {tasks
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
    </Card>
  );
}
