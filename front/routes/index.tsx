import { createBrowserRouter } from 'react-router-dom';
import AdminLayout from '../layouts/admin/AdminLayout.tsx';
import AdminHome from '../pages/admin/AdminHome.tsx';

export const router = createBrowserRouter([
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminHome />,
      },
    ],
  },
]);