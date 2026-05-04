import { useMemo } from 'react';
import { useUser } from '@/hooks/use-user';
import { useFetch } from '@/hooks/use-fetch';
import { Agent, Customer } from '@/types/interface';
import { getId } from '@/utils/helper';

export function useFilteredCustomers(customersData: Customer[]) {
  const { user } = useUser();
  const { data: agents, loading: agentsLoading } = useFetch<Agent>('agent');

  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isAgent = user?.role?.toLowerCase() === 'agent';

  const assignedCustomerIds = useMemo(() => {
    if (!isAgent) return [];

    const currentAgent = agents?.find((agent) => agent.userId === user?._id);

    return currentAgent?.assignedCustomers?.map(String) ?? [];
  }, [agents, user, isAgent]);

  return useMemo(() => {
    if (!user) {
      return [];
    }
    if (isAdmin || !isAgent) return customersData;

    return customersData.filter((c) => assignedCustomerIds.includes(getId(c)));
  }, [customersData, isAdmin, isAgent, assignedCustomerIds, user]);
}
