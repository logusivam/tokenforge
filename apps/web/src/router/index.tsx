import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminRoute } from './AdminRoute'

import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { DashboardPage } from '../pages/DashboardPage'
import { AdminPage } from '../pages/AdminPage'
import { ForbiddenPage } from '../pages/errors/ForbiddenPage'
import { SecurityAlertPage } from '../pages/errors/SecurityAlertPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProtectedLayout } from '../components/layout/ProtectedLayout'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/security-alert',
    element: <SecurityAlertPage />,
  },
  {
    path: '/403',
    element: <ForbiddenPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <ProtectedLayout />,
        children: [
          {
            path: '/',
            element: <DashboardPage />,
          },
          {
            element: <AdminRoute />,
            children: [
              {
                path: '/admin',
                element: <AdminPage />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
