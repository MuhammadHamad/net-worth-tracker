import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { tRaw } from '@/i18n';

interface Props { children: ReactNode }
interface State { error: Error | null }

/** Catches render-time errors so one broken view can't blank the whole app. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // Kept simple (no external logging) to honor the app's privacy stance.
    console.error('Unhandled UI error:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-6 text-center">
          <h1 className="text-xl font-semibold">{tRaw('errboundary.title')}</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            {tRaw('errboundary.desc')}
          </p>
          <Button onClick={() => window.location.reload()}>{tRaw('common.reload')}</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
