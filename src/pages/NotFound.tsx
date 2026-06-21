import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-bold tracking-tight text-primary">404</p>
      <h1 className="mt-2 text-xl font-semibold">Page not found</h1>
      <p className="mt-1 text-sm text-muted-foreground">That page doesn’t exist or has moved.</p>
      <Button asChild className="mt-6">
        <Link to="/">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
