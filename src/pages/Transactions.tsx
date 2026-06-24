import { PageHeader } from '@/components/layout/PageHeader';
import { TransactionList } from '@/components/transactions/TransactionList';
import { useT } from '@/i18n';

export default function Transactions() {
  const t = useT();
  return (
    <div>
      <PageHeader title={t('nav.transactions')} description={t('tx.subtitle')} />
      <TransactionList />
    </div>
  );
}
