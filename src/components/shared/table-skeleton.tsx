import { Skeleton } from '../ui/skeleton';
import { TableBody, TableCell, TableRow } from '../ui/table';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  withAvatar?: boolean;
}

export const TableSkeleton = ({
  rows = 5,
  columns = 8,
  withAvatar = false,
}: TableSkeletonProps) => {
  return (
    <TableBody>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: columns }).map((_, j) => (
            <TableCell key={j}>
              {withAvatar && j === 2 ? (
                <div className="flex items-center gap-3">
                  <Skeleton className=" w-10 h-10 rounded-sm" />
                  <Skeleton className="my-2 h-5 w-full max-w-[150px]" />
                </div>
              ) : (
                <Skeleton className="my-2 h-5 w-full max-w-[120px] " />
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
};
