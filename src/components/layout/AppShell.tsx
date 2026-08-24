import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export function AppShell() {
  return (
    <div className="min-h-svh bg-background">
      <Sidebar />
      <div className="md:ms-56">
        <main className="mx-auto w-full max-w-5xl px-4 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:px-8 md:py-8 md:pt-8">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
