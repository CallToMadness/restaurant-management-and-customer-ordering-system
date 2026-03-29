import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ManagerDashboard from './pages/ManagerDashboard';
import CustomerOrder from './pages/CustomerOrder';
import CustomerDashboard from './pages/CustomerDashboard';
import EmployeeLogin from './pages/EmployeeLogin';
import EmployeeDashboard from './pages/EmployeeDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
  validateSearch: (search: Record<string, unknown>): { table?: string } => {
    return {
      table: (search.table as string) || undefined,
    };
  },
});

const managerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/manager',
  component: ManagerDashboard,
});

const customerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customer',
  component: CustomerOrder,
  validateSearch: (search: Record<string, unknown>): { table?: string } => {
    return {
      table: (search.table as string) || undefined,
    };
  },
});

const customerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customer-dashboard',
  component: CustomerDashboard,
});

const employeeLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employee-login',
  component: EmployeeLogin,
});

const employeeDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employee-dashboard',
  component: EmployeeDashboard,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      restaurantId: (search.restaurantId as string) || '',
      name: (search.name as string) || '',
      category: (search.category as string) || '',
    };
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  managerRoute,
  customerRoute,
  customerDashboardRoute,
  employeeLoginRoute,
  employeeDashboardRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <StrictMode>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>
  );
}
