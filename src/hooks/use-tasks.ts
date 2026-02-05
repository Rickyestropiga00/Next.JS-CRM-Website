"use client";

import { useState, useEffect, useCallback } from "react";
import { Task } from "@/app/tasks/data";
import { tasks as initialTasks } from "@/app/tasks/data";

// In-memory storage (shared across components, resets on refresh)
let sharedTasks: Task[] = initialTasks;

// Helper to dispatch update events
function dispatchTasksUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tasks-updated"));
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(sharedTasks);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks on mount
  useEffect(() => {
    setTasks(sharedTasks);
    setIsLoading(false);
  }, []);

  // Listen for tasks updates from other components
  useEffect(() => {
    const handleTasksUpdate = () => {
      setTasks([...sharedTasks]);
    };

    window.addEventListener("tasks-updated", handleTasksUpdate);
    return () => {
      window.removeEventListener("tasks-updated", handleTasksUpdate);
    };
  }, []);

  const addTask = useCallback((task: Task) => {
    sharedTasks = [task, ...sharedTasks];
    dispatchTasksUpdate();
    setTasks([...sharedTasks]);
  }, []);

  const updateTask = useCallback((task: Task) => {
    sharedTasks = sharedTasks.map((t) => (t.id === task.id ? task : t));
    dispatchTasksUpdate();
    setTasks([...sharedTasks]);
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    sharedTasks = sharedTasks.filter((t) => t.id !== taskId);
    dispatchTasksUpdate();
    setTasks([...sharedTasks]);
  }, []);

  const moveTask = useCallback((taskId: string, newColumn: Task["column"]) => {
    sharedTasks = sharedTasks.map((t) =>
      t.id === taskId ? { ...t, column: newColumn } : t
    );
    dispatchTasksUpdate();
    setTasks([...sharedTasks]);
  }, []);

  return {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    setTasks: (newTasks: Task[]) => {
      sharedTasks = newTasks;
      dispatchTasksUpdate();
      setTasks(newTasks);
    },
  };
}
