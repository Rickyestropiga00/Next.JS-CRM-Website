import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const TaskSkeleton = () => {
  return (
    <Card className="flex flex-col gap-4 p-7 mt-8 rounded-3xl">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-4 w-20 rounded-full" />
      </div>

      <Skeleton className="h-5 w-3/4" />

      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      <div className="flex items-center justify-between mt-2">
        <Skeleton className="h-3 w-24" />

        <div className="flex -space-x-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-full" />
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-2">
        <Skeleton className="h-2 w-24 rounded-full" />
      </div>
    </Card>
  );
};
