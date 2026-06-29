import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import * as Pages from './components/pages';

const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { path: 'dashboard', element: <Pages.Dashboard /> },
      { path: 'nodes', element: <Pages.Nodes /> },
      { path: 'vms', element: <Pages.VMs /> },
      { path: 'logs', element: <Pages.Logs/> },
      { path: 'historical-trends', element: <Pages.HistoricalTrend /> },
      { path: 'system-status', element: <Pages.SystemStatus /> },
      { path: 'settings', element: <div>Global Settings Coming Soon</div> },
      
      // Default auto-redirect index route
      { index: true, element: <Navigate to="/dashboard" replace /> }
    ]
  }
])

export default function App() {
  return (
    <RouterProvider router={router} />
  );
}