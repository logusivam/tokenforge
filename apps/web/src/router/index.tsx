import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminRoute } from './AdminRoute'

import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { LandingPage } from '../pages/LandingPage'
import { DashboardPage } from '../pages/DashboardPage'
import { ProfilePage } from '../pages/ProfilePage'
import { AdminPage } from '../pages/AdminPage'
import { ForbiddenPage } from '../pages/errors/ForbiddenPage'
import { SecurityAlertPage } from '../pages/errors/SecurityAlertPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { OAuthCallbackPage } from '../pages/OAuthCallbackPage'
import { ProtectedLayout } from '../components/layout/ProtectedLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
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
    path: '/oauth/callback/google',
    element: <OAuthCallbackPage />,
  },
  {
    path: '/oauth/callback/github',
    element: <OAuthCallbackPage />,
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
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/profile',
            element: <ProfilePage />,
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
