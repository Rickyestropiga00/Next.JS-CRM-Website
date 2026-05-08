'use client';
import React, { useState } from 'react';
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
import { Trash, Plus } from 'lucide-react';
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
import { useFetch } from '@/hooks/use-fetch';
import { useBulkDelete } from '@/hooks/use-bulk-delete';

export function AgentsTable() {
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
  } = useFetch<Agent>('agent');

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

  const roleOptions = ['Admin', 'Agent', 'Manager'];
  const statusOptions = ['Active', 'Inactive', 'On Leave'];

  function handleAddComment(agentId: string, comment: string) {
    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const formattedTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const commentWithTimestamp = `---\n📝 Comment by Anonymous\n📅 ${formattedDate} at ${formattedTime}\n\n${comment}\n`;

    setAgentData((prev) =>
      prev.map((agent) =>
        agent.id === agentId
          ? {
              ...agent,
              comment: agent.comment
                ? `${agent.comment}\n\n${commentWithTimestamp}`
                : commentWithTimestamp,
            }
          : agent
      )
    );
  }

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
      toast.success(data.message);
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
            placeholder="Search name or email..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                search: e.target.value,
              }))
            }
            className="w-full md:w-64"
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
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Roles</SelectItem>
                {roleOptions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
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
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
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
                <AlertDialogTitle>Delete selected agents?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Are you sure you want to delete
                  the selected agents?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteSelected(selected)}
                  className="cursor-pointer"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <Button
          className="flex items-center gap-2 cursor-pointer"
          type="button"
          onClick={() => setShowAddAgent(true)}
        >
          <Plus className="h-4 w-4" />
          Add New Agent
        </Button>
      </div>
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
