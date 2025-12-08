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
    path: '/:sessionId/swot', // 세션 ID 포함
    element: <SwotPage />,
  },
  {
    path: '/:sessionId/detail-html', // 세션 ID 포함
    element: <DetailPage />,
  },
  {
    path: '/:sessionId/chat', // 세션 ID 포함
    element: <ChatPage />,
  },
  {
    path: '/:sessionId/result-html', // 결과 리포트는 고정 경로 유지 (또는 필요시 수정)
    element: <ResultPage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
