import { PageHeader } from '@/components/layout/PageHeader';
import { BorrowedList } from '@/components/loans/BorrowedList';
import { LentList } from '@/components/loans/LentList';
import { useT } from '@/i18n';

export default function Loans() {
  const t = useT();
  return (
    <div>
      <PageHeader title={t('nav.loans')} description={t('loans.subtitle')} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LentList />
        <BorrowedList />
      </div>
    </div>
  );
}
