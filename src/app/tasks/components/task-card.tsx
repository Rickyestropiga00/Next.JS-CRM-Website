import React from 'react';
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
import { Pencil, Trash, Move, CircleCheckBig } from 'lucide-react';
import { Task, ColumnKey } from '../data';
import { timeAgo } from '@/utils/formatters';
import { getId } from '@/utils/helper';

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
  deleteDialogId: string | null;
  setDeleteDialogId: (id: string | null) => void;
}

export function TaskCard({
  task,
  columns,
  onMove,
  onDelete,
  onEdit,
  deleteDialogId,
  setDeleteDialogId,
}: TaskCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const handleDelete = async (task: any) => {
    const taskId = getId(task);
    if (taskId) {
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
    const taskId = getId(task);
    if (taskId) {
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
        onMove(taskId, 'done');
      } catch (error) {
        console.error(error);
      }
    } else {
      onMove(task.id, 'done');
    }
  };

  const handleMoveTask = async (newColumn: ColumnKey) => {
    const taskId = getId(task);

    if (taskId) {
      try {
        const res = await fetch(`/api/task/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ column: newColumn }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to update task');
        }

        // Update local state AFTER successful DB update
        onMove(taskId, newColumn);
        setIsDropdownOpen(false);
      } catch (error) {
        console.error(error);
      }
    } else {
      onMove(task.id, newColumn);
    }
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <div
          tabIndex={0}
          className="cursor-pointer bg-background rounded-3xl shadow p-7 flex flex-col gap-2 mt-4 focus:outline-none transition-transform transition-shadow duration-200 hover:scale-[1.02] hover:shadow-lg"
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
                {task.status}
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Priority:</span>
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
                {task.priority}
              </span>
            </span>
          </div>
          <div className="text-base font-medium">{task.title}</div>
          <div className="text-sm text-muted-foreground">
            {task.description}
          </div>
          <div className="flex flex-wrap-reverse items-center justify-between gap-3 mt-2">
            <span className="text-xs text-muted-foreground">
              {timeAgo(task.createdAt)}
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
            Mark as done
          </DropdownMenuItem>
        )}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Move className="h-4 w-4 mr-2" />
            Move to
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
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            onEdit(getId(task));
            setIsDropdownOpen(false); // Close the dropdown
          }}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <AlertDialog
          open={deleteDialogId === task.id}
          onOpenChange={(open) => setDeleteDialogId(open ? task.id : null)}
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
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this task?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Are you sure you want to delete
                &quot;
                {task.title} &quot;?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setDeleteDialogId(null)}
                className="cursor-pointer"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleDelete(task);
                  setDeleteDialogId(null);
                }}
                className="cursor-pointer"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
