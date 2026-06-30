'use client';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Agent, DeleteResponse } from '@/types/interface';
import { AgentsTableHeader } from './table-header';
import { AgentsTableBody } from './table-body';
import { AgentsPaginationBar } from './pagination-bar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { useTableActions } from '@/hooks/use-table-actions';

// Dynamically import modals to reduce initial bundle size
const EditAgentPopover = dynamic(
  () =>
    import('./edit-agent-popover').then((mod) => ({
      default: mod.EditAgentPopover,
    })),
  { ssr: false }
);

const AddAgentPopover = dynamic(
  () =>
    import('./add-agent-popover').then((mod) => ({
      default: mod.AddAgentPopover,
    })),
  { ssr: false }
);

const AgentDetailsModal = dynamic(
  () =>
    import('./agent-details-modal').then((mod) => ({
      default: mod.AgentDetailsModal,
    })),
  { ssr: false }
);
const AssignCustomerPopover = dynamic(
  () =>
    import('./assign-customer-popover').then((mod) => ({
      default: mod.AssignCustomerPopover,
    })),
  { ssr: false }
);
import { Trash, Plus, UserCog } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table } from '@/components/ui/table';
import { getId } from '@/utils/helper';
import { toast } from 'sonner';
import { invalidateCache, useFetch } from '@/hooks/use-fetch';
import { useBulkDelete } from '@/hooks/use-bulk-delete';
import { useTranslations } from 'next-intl';
import { getApiSuccessMessage } from '@/lib/api-messages';
import { useSearchParams } from 'next/navigation';
import { useTableHighlight } from '@/hooks/use-table-highlight';

export function AgentsTable() {
  const t = useTranslations();
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [editAgentId, setEditAgentId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [assignCustomerAgentId, setAssignCustomerAgentId] = useState<
    string | null
  >(null);
  const {
    data: agentData,
    setData: setAgentData,
    loading: agentsLoading,
  } = useFetch<Agent>('agents');

  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const isReady = !agentsLoading;

  const {
    filters,
    setFilters,
    filtered,
    paginated,
    totalPages,
    selected,
    setSelected,
    sortBy,
    sortDir,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
    handleDelete,
    handleAdd,
    handleEdit,
    handleSort,
    handleSelectAll,
    handleSelectRow,
  } = useTableActions<Agent>({
    data: agentData,
    setData: setAgentData,
    getId: (a) => a.id || a._id || '',

    filtersConfig: {
      searchKeys: ['name', 'email'],
      filterKeys: [
        { key: 'role', defaultValue: 'all' },
        { key: 'status', defaultValue: 'all' },
      ],
    },
  });

  const { isHighlighted } = useTableHighlight({
    data: agentData,
    highlightId,
    rowsPerPage,
    currentPage,
    setCurrentPage,
    isReady,
    paginatedData: paginated,
    getHighlightValue: (agent) => agent.agentId,
  });

  const roleOptions = ['Admin', 'Agent', 'Manager'];
  const statusOptions = ['Active', 'Inactive', 'On Leave'];

  const translationKeyMap: Record<(typeof statusOptions)[number], string> = {
    Active: 'active',
    Inactive: 'inactive',
    'On Leave': 'onLeave',
  };

  async function handleAddComment(agentId: string, comment: string) {
    const res = await fetch(`/api/agents/${agentId}/comments`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        content: comment,
        author: 'Anonymous',
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to add comment');
    }

    const savedComment = await res.json();

    setAgentData((prev) =>
      prev.map((agent) =>
        agent._id === agentId
          ? {
              ...agent,
              comments: [savedComment, ...(agent.comments ?? [])],
            }
          : agent
      )
    );

    return savedComment;
  }

  async function handleDeleteComment(agentId: string, commentId: string) {
    const res = await fetch(`/api/agents/${agentId}/comments/${commentId}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error('Failed to delete comment');
    }

    setAgentData((prev) =>
      prev.map((agent) =>
        agent._id === agentId
          ? {
              ...agent,
              comments: (agent.comments ?? []).filter(
                (c) => c._id !== commentId
              ),
            }
          : agent
      )
    );
  }

  useEffect(() => {
    if (!selectedAgentId) return;

    const fetchComments = async () => {
      const res = await fetch(`/api/agents/${selectedAgentId}/comments`);
      const data = await res.json();

      setAgentData((prev) =>
        prev.map((a) =>
          a._id === selectedAgentId ? { ...a, comments: data } : a
        )
      );
    };

    fetchComments();
  }, [selectedAgentId, setAgentData]);

  const { handleDeleteSelected } = useBulkDelete<DeleteResponse>({
    endpoint: '/api/bulk-delete',
    type: 'customer',

    onSuccess: (ids, data) => {
      setAgentData((prev) =>
        prev.filter(
          (a) =>
            !(a._id && ids.includes(a._id)) && !(a.id && ids.includes(a.id))
        )
      );

      setSelected([]);
      setShowConfirm(false);
      invalidateCache('agents');
      const message = getApiSuccessMessage(data.message, t, 'Agent');
      toast.success(message);
    },

    onError: () => {
      toast.error('Something went wrong');
    },
  });

  return (
    <>
      <div className="flex w-full items-center justify-between gap-2 flex-wrap mb-2 mt-3">
        <div className="flex gap-2 flex-wrap items-center">
          <Input
            placeholder={t('Agents.placeholders.search')}
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                search: e.target.value,
              }))
            }
            className="w-full lg:w-64"
          />

          <Select
            value={filters.role || 'all'}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                role: value,
              }))
            }
          >
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">
                  {t('Table.filters.allRoles')}
                </SelectItem>
                {roleOptions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {t(`Roles.${r.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                status: value,
              }))
            }
          >
            <SelectTrigger className="w-auto ">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">
                  {t('Table.filters.allStatus')}
                </SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`Statuses.${translationKeyMap[s]}`)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                className="ml-2 cursor-pointer"
                disabled={selected.length === 0}
                title="Delete selected"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t('ConfirmDelete.bulkTitle', { items: 'Agents' })}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t('ConfirmDelete.bulkDescription', { items: 'Agents' })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">
                  {t('Buttons.cancel')}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteSelected(selected)}
                  className="cursor-pointer"
                >
                  {t('Buttons.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Mobile Add */}
          <Button
            className="flex lg:hidden items-center gap-2 cursor-pointer"
            type="button"
            onClick={() => setShowAddAgent(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Desktop Add */}
        <Button
          className="hidden lg:flex items-center gap-2 cursor-pointer"
          type="button"
          onClick={() => setShowAddAgent(true)}
        >
          <Plus className="h-4 w-4" />
          {t('Buttons.addAgent')}
        </Button>
      </div>

      {agentData.length > 0 ? (
        <>
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto w-full">
              <Table className="bg-transparent">
                <AgentsTableHeader
                  selected={selected}
                  paginated={paginated}
                  onSelectAll={handleSelectAll}
                  sortBy={sortBy ?? 'createdAt'}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <AgentsTableBody
                  paginated={paginated}
                  selected={selected}
                  onSelectRow={handleSelectRow}
                  onDelete={handleDelete}
                  deleteDialogId={deleteDialogId}
                  setDeleteDialogId={setDeleteDialogId}
                  setEditAgentId={setEditAgentId}
                  onAgentClick={setSelectedAgentId}
                  setAssignCustomerAgentId={setAssignCustomerAgentId}
                  agentsLoading={agentsLoading}
                  isHighlighted={isHighlighted}
                />
              </Table>
            </div>
          </div>

          <AgentsPaginationBar
            selectedCount={selected.length}
            totalRows={filtered.length}
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            setCurrentPage={setCurrentPage}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 ">
          <div className="mb-4 rounded-full bg-muted p-4 ">
            <UserCog className="h-10 w-10 text-muted-foreground" />
          </div>

          <h3 className="font-semibold">{t('EmptyState.agent.title')}</h3>

          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {t('EmptyState.agent.description')}
          </p>

          <Button className="mt-4" onClick={() => setShowAddAgent(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('EmptyState.agent.addNewAgent')}
          </Button>
        </div>
      )}

      {/* Edit Agent Modal - Rendered outside table structure */}
      {editAgentId && (
        <EditAgentPopover
          agent={agentData.find((a) => getId(a) === editAgentId)!}
          onSave={(updatedAgent) => {
            handleEdit(updatedAgent);
            setEditAgentId(null);
          }}
          onClose={() => setEditAgentId(null)}
          open={true}
        />
      )}

      {/* Add Agent Modal - Rendered outside table structure */}
      <AddAgentPopover
        isOpen={showAddAgent}
        onAddAgent={(newAgent) => {
          handleAdd(newAgent);
          setShowAddAgent(false);
        }}
        onClose={() => setShowAddAgent(false)}
      />

      {/* Agent Details Modal */}
      <AgentDetailsModal
        agent={
          selectedAgentId
            ? agentData.find((a) => getId(a) === selectedAgentId) || null
            : null
        }
        isOpen={!!selectedAgentId}
        onClose={() => setSelectedAgentId(null)}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
      />

      {/* Assign Customer Modal - Rendered outside table structure */}
      {assignCustomerAgentId && (
        <AssignCustomerPopover
          agent={agentData.find((a) => getId(a) === assignCustomerAgentId)!}
          onSave={(updatedAgent) => {
            handleEdit(updatedAgent);
          }}
          onClose={() => setAssignCustomerAgentId(null)}
          open={true}
        />
      )}
    </>
  );
}
