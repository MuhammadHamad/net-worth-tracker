import { PageHeader } from '@/components/layout/PageHeader';
import { AssetGrid } from '@/components/assets/AssetGrid';
import { useT } from '@/i18n';

export default function Assets() {
  const t = useT();
  return (
    <div>
      <PageHeader title={t('nav.assets')} description={t('assets.subtitle')} />
      <AssetGrid />
    </div>
  );
}
