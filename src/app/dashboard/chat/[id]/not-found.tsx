import Button from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Chat Not Found</h1>
        <div className="text-muted-foreground mb-4">
          The chat you're looking for doesn't exist or may have been deleted.
        </div>
        <Button >
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}