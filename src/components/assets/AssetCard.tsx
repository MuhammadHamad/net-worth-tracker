import type { Asset } from '@/types';
import { Wallet } from 'lucide-react';
import { ASSET_CATEGORIES } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';
import { formatDate } from '@/lib/formatters';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RowActionsMenu } from '@/components/shared/RowActionsMenu';

export function AssetCard({ asset }: { asset: Asset }) {
  const { format } = useCurrency();
  const categoryLabel = ASSET_CATEGORIES.find((c) => c.value === asset.category)?.label ?? asset.category;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Wallet className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{asset.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary">{categoryLabel}</Badge>
                {asset.isPaidFromCash && <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400">Paid from cash</Badge>}
              </div>
            </div>
          </div>
          <RowActionsMenu transaction={asset} deleteName={asset.name} deleteDetail={format(asset.estimatedValue)} />
        </div>
        <div className="mt-4">
          <p className="text-xs text-muted-foreground">Estimated value</p>
          <p className="text-xl font-bold tracking-tight">{format(asset.estimatedValue)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Added {formatDate(asset.dateAdded)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
