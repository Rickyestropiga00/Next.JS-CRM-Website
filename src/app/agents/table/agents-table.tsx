"use client";
import React, { useMemo, useState } from "react";
import { agents as initialAgents, Agent } from "../data";
import { AgentsTableHeader } from "./table-header";
import { AgentsTableBody } from "./table-body";
import { AgentsPaginationBar } from "./pagination-bar";
import { EditAgentPopover } from "./edit-agent-popover";
import { AddAgentPopover } from "./add-agent-popover";
import { AgentDetailsModal } from "./agent-details-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { Trash, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table } from "@/components/ui/table";

export function AgentsTable() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<keyof Agent>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [data, setData] = useState(initialAgents);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [editAgentId, setEditAgentId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const roleOptions = ["Admin", "Agent", "Manager"];
  const statusOptions = ["Active", "Inactive", "On Leave"];

  // Filtering (search by name/email, role, status)
  const filtered = useMemo(() => {
    return data.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = role === "all" ? true : a.role === role;
      const matchesStatus = status === "all" ? true : a.status === status;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [data, search, role, status]);

  // Sorting
  const sorted = useMemo(() => {
    if (!sortBy) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortBy] ?? "";
      const bVal = b[sortBy] ?? "";
      if (sortBy === "id") {
        return (
          (aVal as string).localeCompare(bVal as string, undefined, {
            numeric: true,
          }) * (sortDir === "asc" ? 1 : -1)
        );
      }
      if (typeof aVal === "string" && typeof bVal === "string") {
        return (
          (aVal as string).localeCompare(bVal as string) *
          (sortDir === "asc" ? 1 : -1)
        );
      }
      return 0;
    });
  }, [filtered, sortBy, sortDir]);

  const totalRows = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, currentPage, rowsPerPage]);

  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [rowsPerPage, totalPages]);

  function handleDelete(id: string) {
    setData((prev) => prev.filter((a) => a.id !== id));
  }

  function handleEdit(updatedAgent: Agent) {
    setData((prev) =>
      prev.map((agent) => (agent.id === updatedAgent.id ? updatedAgent : agent))
    );
  }

  function handleAddAgent(newAgent: Agent) {
    setData((prev) => [newAgent, ...prev]);
    // Reset to first page when adding new agent
    setCurrentPage(1);
  }

  function handleAddComment(agentId: string, comment: string) {
    const timestamp = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const formattedTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const commentWithTimestamp = `---\n📝 Comment by Anonymous\n📅 ${formattedDate} at ${formattedTime}\n\n${comment}\n`;

    setData((prev) =>
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

  function handleSort(col: keyof Agent) {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      setSelected((prev) => [
        ...prev.filter((id) => !paginated.some((a) => a.id === id)),
        ...paginated.map((a) => a.id),
      ]);
    } else {
      setSelected((prev) =>
        prev.filter((id) => !paginated.some((a) => a.id === id))
      );
    }
  }

  function handleSelectRow(id: string, checked: boolean) {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((sid) => sid !== id)
    );
  }

  function handleDeleteSelected() {
    setData((prev) => prev.filter((a) => !selected.includes(a.id)));
    setSelected([]);
  }

  return (
    <>
      <div className="flex w-full items-center justify-between gap-2 flex-wrap mb-2 mt-3">
        <div className="flex gap-2 flex-wrap items-center">
          <Input
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64"
          />
          <Select value={role} onValueChange={setRole}>
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
          <Select value={status} onValueChange={setStatus}>
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
                  onClick={handleDeleteSelected}
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
              sortBy={sortBy}
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
            />
          </Table>
        </div>
      </div>
      <AgentsPaginationBar
        selectedCount={selected.length}
        totalRows={totalRows}
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        setCurrentPage={setCurrentPage}
        // Remove onDeleteSelected and disableDelete props
      />

      {/* Edit Agent Modal - Rendered outside table structure */}
      {editAgentId && (
        <EditAgentPopover
          agent={data.find((a) => a.id === editAgentId)!}
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
          handleAddAgent(newAgent);
          setShowAddAgent(false);
        }}
        onClose={() => setShowAddAgent(false)}
      />

      {/* Agent Details Modal */}
      <AgentDetailsModal
        agent={
          selectedAgentId
            ? data.find((a) => a.id === selectedAgentId) || null
            : null
        }
        isOpen={!!selectedAgentId}
        onClose={() => setSelectedAgentId(null)}
        onAddComment={handleAddComment}
      />
    </>
  );
}
