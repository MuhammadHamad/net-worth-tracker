import { PageHeader } from '@/components/layout/PageHeader';
import { TransactionList } from '@/components/transactions/TransactionList';

export default function Transactions() {
  return (
    <div>
      <PageHeader title="Transactions" description="Every income, expense, asset, and loan you’ve logged." />
      <TransactionList />
    </div>
  );
}
