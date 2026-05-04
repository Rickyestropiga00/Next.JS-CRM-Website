'use client';
import { ModalWrapper } from '@/components/shared/modal-wrapper';
import React, { useEffect, useState } from 'react';
import { Agent } from '@/types/interface';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getId } from '@/utils/helper';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { SquareCheck, SquareX } from 'lucide-react';
import { customers as mockCustomer } from '@/app/(main)/customers/data';
import { toast } from 'sonner';
interface Customer {
  _id?: string;
  id?: string;
  name: string;
  email: string;
}

interface AssignCustomerPopoverProps {
  agent: Agent;
  onSave: (updatedAgent: Agent) => void;
  open: boolean;
  onClose?: () => void;
}
export const AssignCustomerPopover = ({
  agent,
  onSave,
  open,
  onClose,
}: AssignCustomerPopoverProps) => {
  const [unassignedCustomers, setUnassignedCustomers] = useState<Customer[]>(
    []
  );
  const [assignedCustomers, setAssignedCustomers] = useState<Customer[]>([]);
  const [selectedToAssign, setSelectedToAssign] = useState<string[]>([]);
  const [selectedToUnassign, setSelectedToUnassign] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (agent._id) {
        try {
          const res = await fetch(`/api/customer?agentId=${agent._id}`);
          const data = await res.json();
          setAssignedCustomers(data.assigned || []);
          setUnassignedCustomers(data.unAssigned || []);
        } catch (error) {
          console.error(error);
        }
      } else {
        setUnassignedCustomers(mockCustomer || []);
      }
    };

    fetchCustomers();
  }, [agent._id]);

  const onSelectUnassigned = (customer: Customer, checked: boolean) => {
    const id = getId(customer);

    setSelectedToAssign((prev) => {
      if (checked) return [...prev, id];
      return prev.filter((i) => i !== id);
    });
  };

  const onSelectAssigned = (customer: Customer, checked: boolean) => {
    const id = getId(customer);

    setSelectedToUnassign((prev) => {
      if (!checked) return [...prev, id];
      return prev.filter((i) => i !== id);
    });
  };

  const handleSave = async () => {
    setLoading(true);
    const toastId = 'update-assign';
    toast.loading('Saving changes...', { id: toastId });
    if (agent._id) {
      try {
        const res = await fetch(`/api/agent/${agent._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assign: selectedToAssign,
            unassign: selectedToUnassign,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error);
        }

        const assignCustomers = unassignedCustomers.filter((c) =>
          selectedToAssign.includes(getId(c))
        );

        const unassignCustomers = assignedCustomers.filter((c) =>
          selectedToUnassign.includes(getId(c))
        );

        setAssignedCustomers((prev) => [
          ...prev.filter((c) => !selectedToUnassign.includes(getId(c))),
          ...assignCustomers,
        ]);

        setUnassignedCustomers((prev) => [
          ...prev.filter((c) => !selectedToAssign.includes(getId(c))),
          ...unassignCustomers,
        ]);

        setSelectedToAssign([]);
        setSelectedToUnassign([]);
        toast.success('Changes update successfully', { id: toastId });
        onSave(data.data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to assign', { id: toastId });
      } finally {
        setLoading(false);
      }
    } else {
      const assignCustomers = unassignedCustomers.filter((c) =>
        selectedToAssign.includes(getId(c))
      );

      const unassignCustomers = assignedCustomers.filter((c) =>
        selectedToUnassign.includes(getId(c))
      );

      setAssignedCustomers((prev) => [
        ...prev.filter((c) => !selectedToUnassign.includes(getId(c))),
        ...assignCustomers,
      ]);

      setUnassignedCustomers((prev) => [
        ...prev.filter((c) => !selectedToAssign.includes(getId(c))),
        ...unassignCustomers,
      ]);
      setSelectedToAssign([]);
      setSelectedToUnassign([]);

      const newAssignedIds = [
        ...assignedCustomers
          .filter((c) => !selectedToUnassign.includes(getId(c)))
          .map((c) => getId(c)),

        ...unassignedCustomers
          .filter((c) => selectedToAssign.includes(getId(c)))
          .map((c) => getId(c)),
      ];

      onSave({
        ...agent,
        assignedCustomers: newAssignedIds,
      });
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };
  return (
    <ModalWrapper open={open} onClose={handleCancel}>
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2 sm:space-y-3">
          <h4 className="font-medium text-sm sm:text-base">
            Assigned Customer
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Assign Customer for{' '}
            <span className="font-bold capitalize">{agent.name}</span>
          </p>
        </div>
        {/* Unassigned Customer */}
        <div className="bg-card border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <SquareX className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold">Not Assigned</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <Checkbox
                    className="ml-2"
                    checked={
                      unassignedCustomers.length > 0 &&
                      unassignedCustomers.every((c) =>
                        selectedToAssign.includes(getId(c))
                      )
                    }
                    onCheckedChange={(checked: boolean | 'indeterminate') =>
                      setSelectedToAssign(
                        checked ? unassignedCustomers.map((c) => getId(c)) : []
                      )
                    }
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-[70px]">Name</TableHead>
                <TableHead className="w-[70px]">Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unassignedCustomers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-sm text-muted-foreground py-6"
                  >
                    All customers are already assigned
                  </TableCell>
                </TableRow>
              ) : (
                unassignedCustomers.map((unassign) => {
                  return (
                    <TableRow
                      key={getId(unassign)}
                      onClick={() => {
                        const isChecked = selectedToAssign.includes(
                          getId(unassign)
                        );
                        onSelectUnassigned(unassign, !isChecked);
                      }}
                    >
                      <TableCell className="w-8">
                        <Checkbox
                          className="ml-2"
                          checked={selectedToAssign.includes(getId(unassign))}
                          onCheckedChange={(checked) =>
                            onSelectUnassigned(unassign, !!checked)
                          }
                          aria-label={`Select row for ${unassign.name}`}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell>{unassign.name}</TableCell>
                      <TableCell>{unassign.email}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Assigned Customer */}
        <div className="bg-card border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <SquareCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm font-semibold">Assigned</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <Checkbox
                    className="ml-2"
                    checked={
                      assignedCustomers.length > 0 &&
                      assignedCustomers.every(
                        (c) => !selectedToUnassign.includes(getId(c))
                      )
                    }
                    onCheckedChange={(checked: boolean | 'indeterminate') =>
                      setSelectedToUnassign(
                        !checked ? assignedCustomers.map((c) => getId(c)) : []
                      )
                    }
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-[70px]">Name</TableHead>
                <TableHead className="w-[70px]">Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedCustomers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-sm text-muted-foreground py-6"
                  >
                    No assigned customers yet
                  </TableCell>
                </TableRow>
              ) : (
                assignedCustomers.map((assign) => {
                  return (
                    <TableRow
                      key={getId(assign)}
                      onClick={() => {
                        const isChecked = !selectedToUnassign.includes(
                          getId(assign)
                        );
                        onSelectAssigned(assign, !isChecked);
                      }}
                    >
                      <TableCell className="w-8">
                        <Checkbox
                          className="ml-2"
                          checked={!selectedToUnassign.includes(getId(assign))}
                          onCheckedChange={(checked) =>
                            onSelectAssigned(assign, !!checked)
                          }
                          aria-label={`Select row for ${assign.name}`}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell>{assign.name}</TableCell>
                      <TableCell>{assign.email}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="h-8 sm:h-7 text-xs order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            size="sm"
            className="h-8 sm:h-7 text-xs order-1 sm:order-2"
            disabled={loading}
          >
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
};
