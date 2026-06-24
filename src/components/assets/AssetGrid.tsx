import { useMemo } from 'react';
import type { Asset } from '@/types';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useCurrency } from '@/hooks/useCurrency';
import { Card, CardContent } from '@/components/ui/card';
import { useT } from '@/i18n';
import { AssetCard } from './AssetCard';

export function AssetGrid() {
  const t = useT();
  const transactions = useTransactionStore((s) => s.transactions);
  const { format } = useCurrency();

  const assets = useMemo(
    () => transactions.filter((t): t is Asset => t.type === 'asset')
      .sort((a, b) => b.estimatedValue - a.estimatedValue),
    [transactions]
  );

  const total = assets.reduce((sum, a) => sum + a.estimatedValue, 0);

  if (assets.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          {t('assets.empty')}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <span className="text-sm text-muted-foreground">{assets.length === 1 ? t('assets.countOne', { n: assets.length }) : t('assets.countMany', { n: assets.length })}</span>
          <span className="text-lg font-bold">{format(total)}</span>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((a) => <AssetCard key={a.id} asset={a} />)}
      </div>
    </div>
  );
}
