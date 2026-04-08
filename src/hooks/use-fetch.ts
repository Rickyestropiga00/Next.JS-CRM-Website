'use client';

import { fetchData } from '@/lib/api/fetch-data';
import { useEffect, useState } from 'react';
import { agents as mockAgents } from '@/app/agents/data';
import { orders as mockOrders } from '@/app/orders/data';
import { customers as mockCustomers } from '@/app/customers/data';
import { products as mockProducts } from '@/app/products/data';
import { tasks as mockTasks } from '@/app/tasks/data';

const mockDataMap: Record<string, any[]> = {
  agent: mockAgents,
  order: mockOrders,
  customer: mockCustomers,
  product: mockProducts,
  task: mockTasks,
};

export const useFetch = <T>(
  endpoint: string,
  useMock: boolean = false,
  mergeMock: boolean = true
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>('null');
  useEffect(() => {
    const fetchEndpoint = async () => {
      try {
        setLoading(true);
        setError(null);
        const mock = mockDataMap[endpoint] || [];
        if (useMock) {
          setData(mock);
        } else {
          const fetchResult = await fetchData(endpoint);
          const apiData: T[] = await fetchResult.data;
          setData(mergeMock ? [...mock, ...apiData] : apiData);
        }
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchEndpoint();
  }, [endpoint, useMock, mergeMock]);
  return { data, setData, loading, error };
};
