import { Agent, Order } from '@/types/interface';
import { useUser } from './use-user';
import { useFetch } from './use-fetch';
import { useMemo } from 'react';

export function useFilteredOrderByAgent(ordersData: Order[]) {
  const { user } = useUser();
  const { data: agents, loading: agentsLoading } = useFetch<Agent>('agent');
  const role = user?.role.toLowerCase();

  const isAgent = role === 'agent';

  const assignedCustomerIds = useMemo(() => {
    if (!isAgent || !user) return [];

    const currentAgent = agents?.find((a) => a.userId === user._id);

    return currentAgent?.assignedCustomers?.map(String) ?? [];
  }, [agents, user, isAgent]);

  const filteredOrder = useMemo(() => {
    if (!user) return [];

    if (!isAgent) {
      return ordersData;
    }

    return ordersData.filter((order) => {
      const customerId =
        typeof order.customer === 'object' && order.customer !== null
          ? String(order.customer._id)
          : String(order.customer ?? order.customer);

      return assignedCustomerIds.includes(customerId);
    });
  }, [ordersData, user, assignedCustomerIds, isAgent]);

  return {
    filteredOrder,
    assignedCustomerIds,
    agentsLoading,
    isAgent,
  };
}
