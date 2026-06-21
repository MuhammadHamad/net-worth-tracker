import { PageHeader } from '@/components/layout/PageHeader';
import { AssetGrid } from '@/components/assets/AssetGrid';

export default function Assets() {
  return (
    <div>
      <PageHeader title="Assets" description="Everything you own — vehicles, gold, savings, and more." />
      <AssetGrid />
    </div>
  );
}
