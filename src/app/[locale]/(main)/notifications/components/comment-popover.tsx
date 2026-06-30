'use client';

import { useEffect, useRef } from 'react';
import { ModalWrapper } from '@/components/shared/modal-wrapper';
import { Agent } from '@/types/interface';
import { getInitials, timeAgo } from '@/utils/formatters';
import { MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

type CommentPopoverProps = {
  agent: Agent | null;
  activeCommentId?: string;
  isOpen?: boolean;
  onClose: () => void;
};

const AVATAR_COLORS = [
  'bg-rose-500',
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-indigo-500',
];

function avatarColor(author: string | undefined): string {
  if (!author) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < author.length; i++) {
    hash = author.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export const CommentPopover = ({
  agent,
  activeCommentId,
  isOpen = false,
  onClose,
}: CommentPopoverProps) => {
  const timeAgoT = useTranslations('TimeAgo');
  const activeRef = useRef<HTMLLIElement | null>(null);

  // Scroll the highlighted comment into view once the modal is open
  useEffect(() => {
    if (isOpen && activeRef.current) {
      // Small delay lets the modal finish its open animation first
      const id = setTimeout(() => {
        activeRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 150);
      return () => clearTimeout(id);
    }
  }, [isOpen, activeCommentId]);

  if (!agent) return null;

  const comments = agent.comments ?? [];

  return (
    <ModalWrapper open={isOpen} onClose={onClose}>
      <div className="w-full max-w-lg">
        {/* ── Header ── */}
        <div className="flex items-center gap-3 border-b px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold leading-none">Comments</h2>
            {comments.length > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground">
                {comments.length}
              </span>
            )}
          </div>
        </div>

        {/* ── Comment list ── */}
        <div className="max-h-[480px] overflow-y-auto px-6 py-5">
          {comments.length > 0 ? (
            <ul className="space-y-4">
              {comments.map((comment) => {
                const isActive =
                  activeCommentId && String(comment._id) === activeCommentId;
                const displayAuthor = comment.author ?? 'Anonymous';
                const color = avatarColor(comment.author);

                return (
                  <li
                    key={comment._id}
                    ref={isActive ? activeRef : null}
                    className={[
                      'flex items-start gap-3 rounded-xl p-2 -mx-2 transition-colors duration-300',
                      isActive ? '' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${color}`}
                    >
                      {getInitials(displayAuthor)}
                    </div>

                    {/* Bubble + meta */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {displayAuthor}
                        </span>
                        <span
                          className="text-[11px] text-muted-foreground"
                          title={new Date(comment.createdAt).toLocaleString()}
                        >
                          {timeAgo(comment.createdAt, timeAgoT)}
                        </span>
                        {isActive && (
                          <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold ">
                            New
                          </span>
                        )}
                      </div>

                      {/* Message bubble */}
                      <div
                        className={[
                          'rounded-xl rounded-tl-sm px-4 py-2.5 transition-colors duration-300',
                          isActive ? 'bg-secondary' : 'bg-secondary',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <p className="whitespace-pre-wrap break-words text-sm leading-5 text-secondary-foreground">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <MessageSquare className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No comments yet</p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex justify-end border-t px-6 py-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </ModalWrapper>
  );
};
