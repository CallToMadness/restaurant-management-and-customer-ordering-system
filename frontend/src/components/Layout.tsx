import { Outlet } from '@tanstack/react-router';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
}
