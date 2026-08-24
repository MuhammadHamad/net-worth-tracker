import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n';

export default function NotFound() {
  const t = useT();
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-bold tracking-tight text-primary">404</p>
      <h1 className="mt-2 text-xl font-semibold">{t('notfound.title')}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t('notfound.desc')}</p>
      <Button asChild className="mt-6">
        <Link to="/">{t('notfound.back')}</Link>
      </Button>
    </div>
  );
}
