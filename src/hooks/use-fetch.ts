'use client';
import { fetchData } from '@/lib/api/fetch-data';
import { useEffect, useRef, useState } from 'react';
import { agents as mockAgents } from '@/app/data/agents.ts';
import { orders as mockOrders } from '@/app/data/orders.ts';
import { customers as mockCustomers } from '@/app/data/customers.ts';
import { products as mockProducts } from '@/app/data/products.ts';
import { tasks as mockTasks } from '@/app/data/tasks.ts';

const mockDataMap: Record<string, any[]> = {
  agents: mockAgents,
  orders: mockOrders,
  customers: mockCustomers,
  products: mockProducts,
  tasks: mockTasks,
};

type CacheEntry = {
  data: any[];
  promise: Promise<any[]> | null;
};
const cache = new Map<string, CacheEntry>();

function cacheKey(endpoint: string, useMock: boolean, mergeMock: boolean) {
  return `${endpoint}|${useMock}|${mergeMock}`;
}

export const useFetch = <T>(
  endpoint: string,
  useMock: boolean = false,
  mergeMock: boolean = true
) => {
  const key = cacheKey(endpoint, useMock, mergeMock);

  const [data, setData] = useState<T[]>(() => {
    const hit = cache.get(key);
    return hit ? (hit.data as T[]) : [];
  });
  const [loading, setLoading] = useState<boolean>(() => !cache.has(key));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!endpoint) return;

    const hit = cache.get(key);

    if (hit && hit.data.length > 0 && !hit.promise) {
      setData(hit.data as T[]);
      setLoading(false);
      return;
    }

    if (hit?.promise) {
      hit.promise.then((result) => {
        setData(result as T[]);
        setLoading(false);
      });
      return;
    }

    setLoading(true);
    setError(null);

    const baseKey = endpoint.split('?')[0];
    const mock = mockDataMap[baseKey] || [];

    const promise = fetchData(endpoint)
      .then((fetchResult) => {
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
          ? (mock as T[])
          : mergeMock
          ? ([...mock, ...apiData] as T[])
          : apiData;

        cache.set(key, { data: finalData as any[], promise: null });

        return finalData;
      })
      .catch((err) => {
        cache.delete(key);
        throw err;
      });

    cache.set(key, { data: hit?.data ?? [], promise });

    promise
      .then((finalData) => {
        setData(finalData as T[]);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [key]);

  return { data, setData, loading, error };
};

export function invalidateCache(endpoint: string) {
  for (const k of cache.keys()) {
    if (k.startsWith(`${endpoint}|`)) {
      cache.delete(k);
    }
  }
}
