import { PageHeader } from '@/components/layout/PageHeader';
import { BorrowedList } from '@/components/loans/BorrowedList';
import { LentList } from '@/components/loans/LentList';

export default function Loans() {
  return (
    <div>
      <PageHeader title="Loans" description="Money you owe, and money owed to you." />
      <div className="grid gap-4 lg:grid-cols-2">
        <LentList />
        <BorrowedList />
      </div>
    </div>
  );
}
