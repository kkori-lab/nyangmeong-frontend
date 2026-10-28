import { lazy } from 'react';
import { PATHS } from '@/routes/paths';

const PostListPage = lazy(() => import('@/pages/community/PostListPage'));
const PostDetailPage = lazy(() => import('@/pages/community/PostDetailPage'));
const PostWritePage = lazy(() => import('@/pages/community/PostWritePage'));
const PostEditPage = lazy(() => import('@/pages/community/PostEditPage'));
const MissingListPage = lazy(() => import('@/pages/community/MissingListPage'));
const MissingDetailPage = lazy(
  () => import('@/pages/community/MissingDetailPage'),
);
const MissingWritePage = lazy(
  () => import('@/pages/community/MissingWritePage'),
);
const MissingEditPage = lazy(() => import('@/pages/community/MissingEditPage'));
const CareListPage = lazy(() => import('@/pages/community/CareListPage'));
const CareDetailPage = lazy(() => import('@/pages/community/CareDetailPage'));
const CareWritePage = lazy(() => import('@/pages/community/CareWritePage'));
const CareEditPage = lazy(() => import('@/pages/community/CareEditPage'));
const NewsListPage = lazy(() => import('@/pages/news/NewsListPage'));
const NewsDetailPage = lazy(() => import('@/pages/news/NewsDetailPage'));

/** 펫이야기·실종센터·펫뉴스·펫돌봄(KSJ). 로그인 구현 전 public: 연결 때 member로 전환 */
export default [
  {
    layout: 'user',
    auth: 'member',
    routes: [
      { path: PATHS.COMMUNITY, Component: PostListPage },
      { path: PATHS.COMMUNITY_POST_NEW, Component: PostWritePage },
      { path: PATHS.COMMUNITY_POST_DETAIL, Component: PostDetailPage },
      { path: PATHS.COMMUNITY_POST_EDIT, Component: PostEditPage },
      { path: PATHS.COMMUNITY_MISSING, Component: MissingListPage },
      { path: PATHS.COMMUNITY_MISSING_NEW, Component: MissingWritePage },
      { path: PATHS.COMMUNITY_MISSING_DETAIL, Component: MissingDetailPage },
      { path: PATHS.COMMUNITY_MISSING_EDIT, Component: MissingEditPage },
      { path: PATHS.COMMUNITY_PETCARE, Component: CareListPage },
      { path: PATHS.COMMUNITY_PETCARE_NEW, Component: CareWritePage },
      { path: PATHS.COMMUNITY_PETCARE_DETAIL, Component: CareDetailPage },
      { path: PATHS.COMMUNITY_PETCARE_EDIT, Component: CareEditPage },
      { path: PATHS.COMMUNITY_NEWS, Component: NewsListPage },
      { path: PATHS.COMMUNITY_NEWS_DETAIL, Component: NewsDetailPage },
    ],
  },
];
