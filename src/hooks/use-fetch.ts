'use client';
import { fetchData } from '@/lib/api/fetch-data';
import { useEffect, useRef, useState } from 'react';
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!endpoint) return;

    const fetchEndpoint = async () => {
      try {
        setLoading(true);
        setError(null);

        const baseKey = endpoint.split('?')[0];
        const mock = mockDataMap[baseKey] || [];

        const fetchResult = await fetchData(endpoint);

        let apiData: T[] = [];

        if (Array.isArray(fetchResult)) {
          apiData = fetchResult;
        } else if (fetchResult?.data) {
          apiData = fetchResult.data;
        } else if (fetchResult?.assigned) {
          apiData = [
            ...fetchResult.assigned,
            ...(fetchResult.unAssigned || []),
          ];
        }

        const finalData = useMock
          ? mock
          : mergeMock
          ? [...mock, ...apiData]
          : apiData;

        setData(finalData);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchEndpoint();
  }, [endpoint, useMock, mergeMock]);

  return { data, setData, loading, error };
};
