import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash, Move, CircleCheckBig, UserPlus } from 'lucide-react';
import { Task, ColumnKey, Agent } from '@/types/interface';
import { timeAgo } from '@/utils/formatters';
import { getId } from '@/utils/helper';
import { useDraggable } from '@dnd-kit/core';
import { Can } from '@/components/auth/can';
import { useUser } from '@/hooks/use-user';
import { useTranslations } from 'next-intl';
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';
import { useFetch } from '@/hooks/use-fetch';
import { flushAllTraces } from 'next/dist/trace';

const AssignTaskPopover = dynamic(
  () =>
    import('./assign-task-popover').then((mod) => ({
      default: mod.AssignTaskPopover,
    })),
  { ssr: false }
);

const statusColors: Record<string, string> = {
  DESIGN: 'var(--badge-design)',
  DEVELOPMENT: 'var(--badge-development)',
  TESTING: 'var(--badge-testing)',
  CONTENT: 'var(--badge-content)',
  MARKETING: 'var(--badge-marketing)',
  MEETING: 'var(--badge-meeting)',
  'FOLLOW-UP': 'var(--badge-followup)',
};

interface TaskCardProps {
  task: Task;
  columns: { key: ColumnKey; label: string }[];
  onMove: (id: string, newColumn: ColumnKey) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string | null) => void;
  onUpdateTask: (task: Task) => void;
  deleteDialogId: string | null;
  setDeleteDialogId: (id: string | null) => void;
}

export function TaskCard({
  task,
  columns,
  onMove,
  onDelete,
  onEdit,
  onUpdateTask,
  deleteDialogId,
  setDeleteDialogId,
}: TaskCardProps) {
  const t = useTranslations();
  const { user } = useUser();
  const timeAgoT = useTranslations('TimeAgo');
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isGripHovered, setIsGripHovered] = React.useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: getId(task),
      data: { task },
    });
  const { data: agents } = useFetch<Agent[]>('agent', false, false);
  const [showAssignTaskPopover, setShowAssignTaskPopover] = useState(false);

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = async (task: Task) => {
    if (task._id) {
      try {
        const res = await fetch(`/api/task/${task._id}`, {
          method: 'DELETE',
        });
        const data = await res.json();

        if (res.status === 200) {
          onDelete(task._id);
          setDeleteDialogId(null);
        } else {
          console.error(data.error);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      onDelete(task.id);
      setDeleteDialogId(null);
    }
  };

  const handleMarkAsDone = async () => {
    if (task._id) {
      try {
        const res = await fetch(`/api/task/${task._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ column: 'done' }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to update task');
        }

        // Update local state AFTER successful DB update
        onMove(task._id, 'done');
      } catch (error) {
        console.error(error);
      }
    } else {
      onMove(task.id, 'done');
    }
  };

  const handleMoveTask = async (newColumn: ColumnKey) => {
    const id = task._id || task.id;

    await onMove(id, newColumn);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <div
        style={style}
        ref={setNodeRef}
        className="flex flex-col items-center justify-between cursor-pointer bg-background rounded-3xl shadow p-7  mt-4 gap-4"
      >
        <div className="flex-1 w-full ">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <div
                tabIndex={0}
                className="cursor-pointer bg-background  flex flex-col gap-2 mt-4 focus:outline-none transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg p-4"
              >
                <div className="flex flex-wrap-reverse items-center justify-between w-full mb-1 gap-4">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          statusColors[task.status] || 'var(--badge-default)',
                      }}
                    />
                    <span className="text-xs text-muted-foreground font-medium">
                      {t(
                        `TaskStatus.${
                          task.status === 'FOLLOW-UP'
                            ? 'followUp'
                            : task.status.toLowerCase()
                        }`
                      )}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {t('Tasks.taskCard.labels.priority')}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-xs text-xs font-semibold"
                      style={{
                        backgroundColor:
                          task.priority === 'LOW'
                            ? 'var(--badge-priority-low)'
                            : task.priority === 'MEDIUM'
                            ? 'var(--badge-priority-medium)'
                            : 'var(--badge-priority-high)',
                        color: '#fff',
                      }}
                    >
                      {t(
                        `Priority.${task.priority.toLowerCase()}`
                      ).toUpperCase()}
                    </span>
                  </span>
                </div>
                <div className="text-base font-medium">{task.title}</div>
                <div className="text-sm text-muted-foreground">
                  {task.description}
                </div>
                <div className="flex flex-wrap-reverse items-center justify-between gap-3 mt-2">
                  <span className="text-xs text-muted-foreground">
                    {task.lastAdded ?? timeAgo(task.createdAt, timeAgoT)}
                  </span>
                  <div className="flex -space-x-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:ring-2">
                    {task.avatars.map((avatar, idx) => (
                      <Avatar key={idx}>
                        <AvatarImage src={avatar.src} alt={avatar.alt} />
                        <AvatarFallback>{avatar.fallback}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {task.column !== 'done' && (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    handleMarkAsDone();
                  }}
                  className="text-green-600 font-semibold hover:text-green-600 focus:text-green-600"
                >
                  <CircleCheckBig className="h-4 w-4 text-green-600" />
                  {t('Tasks.taskCard.actions.markDone')}
                </DropdownMenuItem>
              )}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Move className="h-4 w-4 mr-2" />
                  {t('Tasks.taskCard.actions.moveTo')}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {columns
                    .filter((c) => c.key !== task.column && c.key !== 'done')
                    .map((c) => (
                      <DropdownMenuItem
                        key={c.key}
                        onSelect={(e) => {
                          e.preventDefault();
                          handleMoveTask(c.key); // generic move
                        }}
                      >
                        {c.label}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <Can role={user?.role} action="assign" resource="task">
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setIsDropdownOpen(false);
                    setShowAssignTaskPopover(true);
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                  Assign Task
                </DropdownMenuItem>
              </Can>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  onEdit(getId(task));
                  setIsDropdownOpen(false); // Close the dropdown
                }}
              >
                <Pencil className="h-4 w-4" />
                {t('Buttons.edit')}
              </DropdownMenuItem>
              <Can role={user?.role} action="delete" resource="task">
                <AlertDialog
                  open={deleteDialogId === task.id}
                  onOpenChange={(open) =>
                    setDeleteDialogId(open ? task.id : null)
                  }
                >
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setDeleteDialogId(task.id);
                      }}
                      className="text-primary focus:text-primary font-semibold"
                    >
                      <Trash className="h-4 w-4 text-primary" />
                      {t('Buttons.delete')}
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t('ConfirmDelete.singleTitle', { item: 'task' })}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t(`ConfirmDelete.singleDescription`, {
                          name: task.title,
                        })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => setDeleteDialogId(null)}
                        className="cursor-pointer"
                      >
                        {t('Buttons.cancel')}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          handleDelete(task);
                          setDeleteDialogId(null);
                        }}
                        className="cursor-pointer"
                      >
                        {t('Buttons.delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </Can>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div
          {...attributes}
          {...listeners}
          onMouseEnter={() => setIsGripHovered(true)}
          onMouseLeave={() => setIsGripHovered(false)}
          className={[
            'w-full flex justify-center items-center gap-2 py-2 rounded-xl',
            'cursor-grab active:cursor-grabbing select-none',
            'transition-all duration-200',
            'border border-transparent',
            isGripHovered
              ? 'bg-gray-200 dark:bg-muted/70 border-border/40 shadow-inner'
              : 'bg-gray-200 dark:bg-muted/30 opacity-60 group-hover:opacity-100',
          ].join(' ')}
          style={{ touchAction: 'none' }}
          aria-label="Drag to reorder"
          title="Drag to move card"
        >
          <div className="flex gap-[3px] items-center">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-20 bg-black dark:bg-white"
                style={{
                  width: 3,
                  height: 3,
                  transform: isGripHovered ? 'scaleY(1.5)' : 'scaleY(1)',
                  transitionDelay: `${i * 20}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <Can role={user?.role} action="assign" resource="task">
        <AssignTaskPopover
          taskId={getId(task)}
          assignedAgentId={task.agentId}
          isOpen={showAssignTaskPopover}
          onClose={() => setShowAssignTaskPopover(false)}
          onAssigned={(updatedTask) => onUpdateTask(updatedTask)}
        />
      </Can>
    </>
  );
}
