import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { useUiStore } from '@/store/useUiStore';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n';
import { useNavigate } from 'react-router-dom';

export function LogoutButton({
  variant = 'outline',
  className,
  size = 'default',
}: {
  variant?: 'outline' | 'ghost' | 'destructive' | 'default';
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}) {
  const t = useT();
  const navigate = useNavigate();
  const signOut = useAuthStore((s) => s.signOut);
  const setAuthSkipped = useUiStore((s) => s.setAuthSkipped);

  const handleLogout = async () => {
    await signOut();
    setAuthSkipped(false);
    toast.success(t('sync.signOut') || 'Logged out successfully');
    navigate('/');
  };

  return (
    <Button variant={variant} size={size} className={className} onClick={handleLogout}>
      <LogOut className="h-4 w-4" />
      <span>{t('sync.signOut') || 'Log Out'}</span>
    </Button>
  );
}
