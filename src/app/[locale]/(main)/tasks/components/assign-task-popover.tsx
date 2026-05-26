import { ModalWrapper } from '@/components/shared/modal-wrapper';
import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { useFetch } from '@/hooks/use-fetch';
import { Agent, Task } from '@/types/interface';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface AssignTaskPopoverProps {
  taskId: string;
  isOpen?: boolean;
  onClose?: () => void;
  onAssigned?: (updatedTask: Task) => void;
}

export const AssignTaskPopover = ({
  taskId,
  isOpen = false,
  onClose,
  onAssigned,
}: AssignTaskPopoverProps) => {
  const { data: agents } = useFetch<Agent>('agent', false, false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [selectedAgentName, setSelectedAgentName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    if (onClose) {
      setSelectedAgentId('');
      setSelectedAgentName('');
      onClose();
    }
  };
  const handleAssignTask = async () => {
    if (!selectedAgentId || !taskId) return;
    setLoading(true);
    console.log(`taskId: ${taskId}`);

    try {
      const res = await fetch(`/api/task/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: selectedAgentId }),
      });

      const data = await res.json();
      console.log('Status:', res.status);
      console.log('Response:', data);

      if (!res.ok) {
        toast.error(data.error ?? 'Failed to assign task');
        return;
      }

      toast.success(`Task assigned to ${selectedAgentName}`);
      onAssigned?.(data.data);

      handleCancel();
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper open={isOpen} onClose={handleCancel}>
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2 sm:space-y-3">
          <h4 className="font-medium text-sm sm:text-base">Assign Task</h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Select an agent to assign this task.
          </p>
        </div>

        <div className="flex flex-col gap-3 py-2">
          <Combobox
            value={selectedAgentName}
            onValueChange={(name) => {
              if (!name) return;
              const agent = agents.find((a) => a.name === name);
              if (agent) {
                setSelectedAgentName(name);
                setSelectedAgentId(String(agent._id ?? agent.id));
              }
            }}
          >
            <ComboboxInput placeholder="Search agent..." />
            <ComboboxEmpty>No agent found.</ComboboxEmpty>
            <ComboboxContent>
              <ComboboxList>
                {agents.map((agent) => (
                  <ComboboxItem key={agent._id ?? agent.id} value={agent.name}>
                    {agent.name}
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            disabled={!selectedAgentId || loading}
            onClick={handleAssignTask}
          >
            {loading ? 'Assigning...' : 'Assign'}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
};
