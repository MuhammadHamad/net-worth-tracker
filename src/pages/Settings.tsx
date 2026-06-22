import { Moon, Sun, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CloudSyncCard } from '@/components/settings/CloudSyncCard';
import { useProfileStore } from '@/store/useProfileStore';
import { useThemeStore } from '@/store/useThemeStore';
import { CURRENCIES, type Currency } from '@/types';

export default function Settings() {
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <div>
      <PageHeader title="Settings" description="Personalize your tracker. Everything stays on this device." />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                placeholder="e.g. Hammad"
                value={profile.name}
                onChange={(e) => updateProfile({ name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={profile.currency} onValueChange={(v) => updateProfile({ currency: v as Currency })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.symbol} · {c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">All amounts across the app use this currency.</p>
            </div>
          </CardContent>
        </Card>

        <CloudSyncCard />

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Dark mode</p>
                <p className="text-xs text-muted-foreground">{theme === 'dark' ? 'On' : 'Off'}</p>
              </div>
              <Button variant="outline" onClick={toggleTheme} className="gap-2">
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start gap-3 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--success))]" />
            <div>
              <p className="text-sm font-medium">Private by design</p>
              <p className="text-xs text-muted-foreground">
                No accounts, no servers. Your data lives only in this browser’s local storage and works fully offline.
              </p>
            </div>
          </CardContent>
        </Card>

        <Separator />
        <p className="text-center text-xs text-muted-foreground">NetWorth Tracker · MVP</p>
      </div>
    </div>
  );
}
