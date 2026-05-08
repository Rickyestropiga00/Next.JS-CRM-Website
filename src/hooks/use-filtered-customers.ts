import { useMemo } from 'react';
import { useUser } from '@/hooks/use-user';
import { useFetch } from '@/hooks/use-fetch';
import { Agent, Customer } from '@/types/interface';
import { getId } from '@/utils/helper';

export function useFilteredCustomers(
  customersData: Customer[],
  agents: Agent[],
  user: any
) {
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isAgent = user?.role?.toLowerCase() === 'agent';

  const assignedCustomerIds = useMemo(() => {
    if (!isAgent) return [];

    const currentAgent = agents?.find(
      (agent) => String(agent.userId) === String(user?._id)
    );

    return (currentAgent?.assignedCustomers || []).map(String);
  }, [agents, user, isAgent]);

  return useMemo(() => {
    if (!user) return [];
    if (isAdmin || !isAgent) return customersData;

    return customersData.filter((c) =>
      assignedCustomerIds.includes(String(c._id))
    );
  }, [customersData, isAdmin, isAgent, assignedCustomerIds, user]);
}
