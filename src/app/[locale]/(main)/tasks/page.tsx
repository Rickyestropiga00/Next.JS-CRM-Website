'use client';
import dynamic from 'next/dynamic';

const TasksContent = dynamic(
  () => import('./components/tasks-content').then((mod) => mod.TasksContent),
  { ssr: false }
);

export default function TasksPage() {
  return <TasksContent />;
}
