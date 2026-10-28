import { lazy } from 'react';
import CustomerCenterLayout from '@/layouts/CustomerCenterLayout';
import { PATHS } from '@/routes/paths';

const NoticeListPage = lazy(() => import('@/pages/notice/NoticeListPage'));
const NoticeDetailPage = lazy(() => import('@/pages/notice/NoticeDetailPage'));
const FaqListPage = lazy(() => import('@/pages/faq/FaqListPage'));
const InquiryListPage = lazy(() => import('@/pages/inquiry/InquiryListPage'));
const InquiryWritePage = lazy(() => import('@/pages/inquiry/InquiryWritePage'));
const InquiryDetailPage = lazy(
  () => import('@/pages/inquiry/InquiryDetailPage'),
);
const InquiryEditPage = lazy(() => import('@/pages/inquiry/InquiryEditPage'));

/** 공지사항·FAQ·1:1 문의(KSJ). 로그인 구현 전 public: 연결 때 member로 전환 */
export default [
  {
    layout: 'user',
    auth: 'member',
    routes: [
      {
        Component: CustomerCenterLayout,
        children: [
          { path: PATHS.NOTICES, Component: NoticeListPage },
          { path: PATHS.NOTICE_DETAIL, Component: NoticeDetailPage },
          { path: PATHS.FAQS, Component: FaqListPage },
          { path: PATHS.INQUIRIES, Component: InquiryListPage },
          { path: PATHS.INQUIRY_NEW, Component: InquiryWritePage },
          { path: PATHS.INQUIRY_DETAIL, Component: InquiryDetailPage },
          { path: PATHS.INQUIRY_EDIT, Component: InquiryEditPage },
        ],
      },
    ],
  },
];
