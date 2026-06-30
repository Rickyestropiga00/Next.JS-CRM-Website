import { useMemo } from 'react';
import { Agent, Customer } from '@/types/interface';

export function useFilteredCustomers(
  customersData: Customer[] = [],
  agents: Agent[] = [],
  user: any
) {
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isAgent = user?.role?.toLowerCase() === 'agent';

  const assignedCustomerIds = useMemo(() => {
    if (!isAgent || !user) return [];

    const currentAgent = agents.find(
      (agent) =>
        String(
          typeof agent.userId === 'object' ? agent.userId._id : agent.userId
        ) === String(user._id)
    );

    return (currentAgent?.assignedCustomers ?? []).map(String);
  }, [agents, user, isAgent]);

  return useMemo(() => {
    if (!user) return [];

    if (isAdmin || !isAgent) {
      return customersData;
    }

    return customersData.filter((customer) =>
      assignedCustomerIds.includes(String(customer._id))
    );
  }, [customersData, isAdmin, isAgent, assignedCustomerIds, user]);
}
