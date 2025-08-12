'use client';

import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    />
  );
}

export function MessageSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className="space-y-2 max-w-xs">
            <LoadingSkeleton className="h-4 w-20" />
            <LoadingSkeleton className="h-16 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatroomSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <LoadingSkeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <LoadingSkeleton className="h-4 w-32" />
                <LoadingSkeleton className="h-3 w-48" />
                <LoadingSkeleton className="h-3 w-20" />
              </div>
            </div>
            <LoadingSkeleton className="h-6 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}