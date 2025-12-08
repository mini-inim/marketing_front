import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const HomePage = lazy(() => import('../pages/home/page'));
const SwotPage = lazy(() => import('../pages/swot/page'));
const DetailPage = lazy(() => import('../pages/detail/page'));
const ChatPage = lazy(() => import('../pages/chat/page'));
const ResultPage = lazy(() => import('../pages/result/page'));
const NotFound = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/swot',
    element: <SwotPage />,
  },
  {
    path: '/detail',
    element: <DetailPage />,
  },
  {
    path: '/chat',
    element: <ChatPage />,
  },
  {
    path: '/result-html',
    element: <ResultPage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
