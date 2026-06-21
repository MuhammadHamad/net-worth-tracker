import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export function AppShell() {
  return (
    <div className="min-h-svh bg-background">
      <Sidebar />
      <div className="md:ml-56">
        <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
