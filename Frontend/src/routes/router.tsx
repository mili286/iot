import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { LiveStreamPage } from '../pages/live-stream/LiveStreamPage';
import { RecordingsListPage } from '../pages/recordings/RecordingsListPage';
import { RecordingPlaybackPage } from '../pages/recordings/RecordingPlaybackPage';
import { LoginPage } from '../features/auth/components/LoginPage';
import { RegisterPage } from '../features/auth/components/RegisterPage';
import { ProtectedRoute } from './ProtectedRoute';

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
    path: '/',
    element: <Layout />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <Navigate to="/live-stream" replace />,
          },
          {
            path: 'live-stream',
            element: <LiveStreamPage />,
          },
          {
            path: 'recordings',
            element: <RecordingsListPage />,
          },
          {
            path: 'recordings/:id',
            element: <RecordingPlaybackPage />,
          },
        ],
      },
    ],
  },
]);
