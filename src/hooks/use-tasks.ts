'use client';

import { useEffect, useCallback } from 'react';
import { Agent, Task } from '@/types/interface';
import { getId } from '@/utils/helper';
import { useFetch } from './use-fetch';
import { useUser } from './use-user';

// In-memory storage (shared across components, resets on refresh)
let sharedTasks: Task[] = [];

// Helper to dispatch update events
function dispatchTasksUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tasks-updated'));
  }
}

export function useTasks() {
  const { user } = useUser();
  const { data: agents } = useFetch<Agent>('agents');
  const {
    data: tasksData,
    setData: setTasksData,
    loading: tasksLoading,
  } = useFetch<Task>('tasks');

  const currentAgent = agents.find(
    (a) => String(a.userId) === String(user?._id)
  );

  // Load tasks on mount
  useEffect(() => {
    if (tasksData && tasksData.length > 0 && sharedTasks.length === 0) {
      sharedTasks = tasksData;
    }
  }, [tasksData]);
  const visibleTasks = tasksData.filter((task) => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'manager') return true; // see all
    if (!currentAgent) return false;
    return String(task.agentId) === String(currentAgent._id);
  });

  // Listen for tasks updates from other components
  useEffect(() => {
    const handleTasksUpdate = () => {
      setTasksData([...sharedTasks]);
    };

    window.addEventListener('tasks-updated', handleTasksUpdate);
    return () => {
      window.removeEventListener('tasks-updated', handleTasksUpdate);
    };
  }, [setTasksData]);

  const addTask = useCallback(
    (task: Task) => {
      sharedTasks = [task, ...sharedTasks];
      dispatchTasksUpdate();
      setTasksData([...sharedTasks]);
    },
    [setTasksData]
  );

  const updateTask = useCallback(
    (task: Task) => {
      sharedTasks = sharedTasks.map((t) =>
        getId(t) === getId(task) ? task : t
      );
      dispatchTasksUpdate();
      setTasksData([...sharedTasks]);
    },
    [setTasksData]
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      sharedTasks = sharedTasks.filter((t) => getId(t) !== taskId);
      dispatchTasksUpdate();
      setTasksData([...sharedTasks]);
    },
    [setTasksData]
  );

  const moveTask = useCallback(
    async (taskId: string, newColumn: Task['column']) => {
      const task = sharedTasks.find((t) => getId(t) === taskId);
      sharedTasks = sharedTasks.map((t) =>
        getId(t) === taskId ? { ...t, column: newColumn } : t
      );
      dispatchTasksUpdate();
      setTasksData([...sharedTasks]);

      if (task?._id) {
        try {
          await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ column: newColumn }),
          });
        } catch (error) {
          console.error(error);
        }
      }
    },
    [setTasksData]
  );

  return {
    tasksData: visibleTasks,
    tasksLoading,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    setTasks: (newTasks: Task[]) => {
      sharedTasks = newTasks;
      dispatchTasksUpdate();
      setTasksData(newTasks);
    },
  };
}
