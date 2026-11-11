import { lazy } from 'react';
import { IS_DEV } from '@/api/env';

const SubPageDevPage = lazy(() => import('@/pages/dev/SubPageDevPage'));
const ChatDevPage = lazy(() => import('@/pages/dev/ChatDevPage'));
const FormControlsDevPage = lazy(
  () => import('@/pages/dev/FormControlsDevPage'),
);

/** SubPageDevPage: 각 섹션 화면이 SubPageLayout으로 옮겨 가면 지움 */
/** ChatDevPage: 게시글 [채팅하기](KSJ)가 생기면 지움 */
/** FormControlsDevPage: 기본 select·날짜 입력을 공용 컴포넌트로 바꾸면 지움 */
export default IS_DEV
  ? [
      {
        layout: 'user',
        auth: 'public',
        routes: [
          { path: '/dev/sub-page', Component: SubPageDevPage },
          { path: '/dev/chat', Component: ChatDevPage },
          { path: '/dev/form-controls', Component: FormControlsDevPage },
        ],
      },
    ]
  : [];
