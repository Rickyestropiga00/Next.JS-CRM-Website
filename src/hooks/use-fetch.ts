'use client';
import { fetchData } from '@/lib/api/fetch-data';
import { useEffect, useState } from 'react';
import { agents as mockAgents } from '@/app/(main)/agents/data';
import { orders as mockOrders } from '@/app/(main)/orders/data';
import { customers as mockCustomers } from '@/app/(main)/customers/data';
import { products as mockProducts } from '@/app/(main)/products/data';
import { tasks as mockTasks } from '@/app/(main)/tasks/data';
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
    if (!endpoint) return;
    const fetchEndpoint = async () => {
      try {
        setLoading(true);
        setError(null);
        const baseKey = endpoint.split('?')[0];
        const mock = mockDataMap[baseKey] || [];
        if (useMock) {
          setData(mock);
        } else {
          const fetchResult = await fetchData(endpoint);
          const apiData = fetchResult;
          let finalData: T[] = [];
          if (Array.isArray(apiData)) {
            finalData = apiData;
          } else if (apiData.data) {
            finalData = apiData.data;
          } else if (apiData.assigned) {
            finalData = [...apiData.assigned, ...(apiData.unAssigned || [])];
          }
          setData(mergeMock ? [...mock, ...finalData] : finalData);
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
