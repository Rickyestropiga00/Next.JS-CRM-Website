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
import { useNotifications } from '@/context/notification-context';
import { useFetch } from '@/hooks/use-fetch';
import { Agent, Task } from '@/types/interface';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface AssignTaskPopoverProps {
  taskId: string;
  assignedAgentId?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onAssigned?: (updatedTask: Task) => void;
}

export const AssignTaskPopover = ({
  taskId,
  assignedAgentId,
  isOpen = false,
  onClose,
  onAssigned,
}: AssignTaskPopoverProps) => {
  const t = useTranslations();
  const { data: agents = [] } = useFetch<Agent>('agents', false, false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>('');
  const [selectedAgentName, setSelectedAgentName] = useState<string>('');
  const [agentInputValue, setAgentInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!assignedAgentId || agents.length === 0) return;

    const assignedAgent = agents.find(
      (a) => String(a._id ?? a.id) === String(assignedAgentId)
    );

    if (assignedAgent) {
      setSelectedAgentId(String(assignedAgent._id ?? assignedAgent.id));
      setSelectedAgentName(assignedAgent.name);
    }
  }, [assignedAgentId, agents]);

  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };
  const handleAssignTask = async () => {
    if (!selectedAgentId || !taskId) return;
    setLoading(true);
    console.log(`taskId: ${taskId}`);

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: selectedAgentId }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to assign task');
        return;
      }

      onAssigned?.(data.data);

      handleCancel();
      toast.success(`Task assigned to ${selectedAgentName}`);
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
          <h4 className="font-medium text-sm sm:text-base">
            {t('AssignTask.title')}
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t('AssignTask.description')}
          </p>
        </div>

        <div className="flex flex-col gap-3 py-2">
          <Combobox
            items={agents.map((agent) => ({
              label: agent.name,
              value: String(agent._id ?? agent.id),
            }))}
            value={selectedAgentName}
            onValueChange={(value) => {
              const agent = agents.find((a) => String(a._id ?? a.id) === value);

              if (agent) {
                setSelectedAgentId(value);
                setSelectedAgentName(agent.name);
                setAgentInputValue(agent.name);
              }
            }}
          >
            <ComboboxInput
              placeholder={t('AssignTask.combobox.placeholder')}
              value={selectedAgentName}
              onChange={(e) => setAgentInputValue(e.target.value)}
            />
            <ComboboxContent>
              <ComboboxEmpty>{t('AssignTask.combobox.empty')}</ComboboxEmpty>

              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item.value} value={item.value}>
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            {t('Buttons.cancel')}
          </Button>
          <Button
            disabled={!selectedAgentId || loading}
            onClick={handleAssignTask}
          >
            {loading
              ? t('AssignTask.buttons.assigning')
              : t('AssignTask.buttons.assign')}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
};
