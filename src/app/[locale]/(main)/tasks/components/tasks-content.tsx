import React from 'react';
import dynamic from 'next/dynamic';
import { useSidebar } from '@/components/ui/sidebar';
import { Filters } from './filters';
import { ColumnsBoard } from './columns-board';
import { Task, ColumnKey } from '@/types/interface';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTasks } from '@/hooks/use-tasks';
import { getId } from '@/utils/helper';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { invalidateCache } from '@/hooks/use-fetch';

// Dynamically import task modals to reduce initial bundle size
const EditTaskPopover = dynamic(
  () =>
    import('./edit-task-popover').then((mod) => ({
      default: mod.EditTaskPopover,
    })),
  { ssr: false }
);

const AddTaskPopover = dynamic(
  () =>
    import('./add-task-popover').then((mod) => ({
      default: mod.AddTaskPopover,
    })),
  { ssr: false }
);

const AddNewTaskPopover = dynamic(
  () =>
    import('./add-new-task-popover').then((mod) => ({
      default: mod.AddNewTaskPopover,
    })),
  { ssr: false }
);

export function TasksContent() {
  const t = useTranslations();
  const { state } = useSidebar();
  const isSidebarCollapsed = state === 'collapsed';
  const {
    tasksData: taskList,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    tasksLoading,
  } = useTasks();

  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all');
  const [deleteDialogId, setDeleteDialogId] = React.useState<string | null>(
    null
  );
  const [editTaskId, setEditTaskId] = React.useState<string | null>(null);
  const [showAddTask, setShowAddTask] = React.useState(false);
  const [addTaskColumn, setAddTaskColumn] = React.useState<ColumnKey>('todo');
  const [showAddNewTask, setShowAddNewTask] = React.useState(false);
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const statusOptions = [
    { label: t('Tasks.filters.allCategories'), value: 'all' },
    { label: t('TaskStatus.design'), value: 'DESIGN' },
    { label: t('TaskStatus.development'), value: 'DEVELOPMENT' },
    { label: t('TaskStatus.testing'), value: 'TESTING' },
    { label: t('TaskStatus.content'), value: 'CONTENT' },
    { label: t('TaskStatus.marketing'), value: 'MARKETING' },
    { label: t('TaskStatus.meeting'), value: 'MEETING' },
    { label: t('TaskStatus.followUp'), value: 'FOLLOW-UP' },
  ];
  const priorityOptions = [
    { label: t('Tasks.filters.allPriority'), value: 'all' },
    { label: t('Priority.low'), value: 'LOW' },
    { label: t('Priority.medium'), value: 'MEDIUM' },
    { label: t('Priority.high'), value: 'HIGH' },
  ];

  const columns = [
    { key: 'todo' as const, label: t('TaskColumns.todo') },
    { key: 'inprogress' as const, label: t('TaskColumns.inprogress') },
    { key: 'inreview' as const, label: t('TaskColumns.inreview') },
    { key: 'done' as const, label: t('TaskColumns.done') },
  ];

  console.log('Tasklist', taskList);

  // Filter tasks by status and priority
  const filteredTasks = taskList.filter(
    (task) =>
      (statusFilter === 'all' || task.status === statusFilter) &&
      (priorityFilter === 'all' || task.priority === priorityFilter)
  );

  function handleDeleteTask(id: string) {
    deleteTask(id);
  }

  function handleMoveTask(id: string, newColumn: Task['column']) {
    const task = taskList.find((t) => getId(t) === id);
    if (!task || task.column === newColumn) return;
    invalidateCache('tasks');
    moveTask(id, newColumn);
  }

  function handleAddNewTask(newTask: Task) {
    invalidateCache('tasks');
    addTask(newTask);
    setShowAddNewTask(false);
  }

  function handleEditTask(updatedTask: Task) {
    invalidateCache('tasks');
    updateTask(updatedTask);
  }

  function handleAddTask(newTask: Task) {
    invalidateCache('tasks');
    addTask(newTask);
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;
    const taskId = active.id as string;
    const newColumn = over.data.current?.column;
    if (!newColumn) return;

    const activeTask = taskList.find((t) => getId(t) === taskId);
    if (!activeTask) return;

    if (activeTask.column !== newColumn) {
      handleMoveTask(taskId, newColumn);
    }
  };
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  return (
    <>
      <div className="flex w-full items-center justify-between gap-2 flex-wrap mb-2 mt-3 px-4">
        <div className="flex flex-wrap gap-2">
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
          <span className="hidden lg:flex">{t('Buttons.addTask')}</span>
        </Button>
      </div>
      <DndContext
        collisionDetection={closestCenter}
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        {taskList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Plus className="h-10 w-10 text-muted-foreground" />
            </div>

            <h2 className="text-xl font-semibold tracking-tight">
              {t('EmptyState.task.title')}
            </h2>

            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {t('EmptyState.task.description')}
            </p>

            <Button
              className="mt-6 flex items-center gap-2"
              onClick={() => setShowAddNewTask(true)}
            >
              <Plus className="h-4 w-4" />
              {t('EmptyState.task.addNewTask')}
            </Button>
          </div>
        ) : (
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
            tasksLoading={tasksLoading}
            highlightId={highlightId}
          />
        )}
      </DndContext>

      {/* Edit Task Modal - Rendered outside board structure */}
      {editTaskId && (
        <EditTaskPopover
          task={taskList.find((t) => getId(t) === editTaskId)!}
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
