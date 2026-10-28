import { useCallback, useMemo, useRef } from 'react';
import { Outlet, useLocation, useMatch, useNavigate } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import SubPageLayout from './SubPageLayout';

/** 메뉴별 부제(Figma에 있는 것만). 메뉴 이름·순서는 subMenus.js(support) */
const DESCRIPTIONS = {
  [PATHS.NOTICES]: '냥멍케어의 새로운 소식과 서비스 안내를 알려 드려요',
  [PATHS.FAQS]: '궁금한 점을 빠르게 찾아보세요',
  [PATHS.INQUIRIES]:
    '궁금한 점을 남겨 주시면 확인 후 답변을 알림으로 보내 드려요',
};

/**
 * [고객센터 틀]
 * - 공지사항·FAQ·1:1 문의가 한 틀을 공유한다(라우트의 부모 틀, 화면은 Outlet)
 * - 경로·사이드 메뉴·페이지 머리는 공용 SubPageLayout. 여기서는 선택 메뉴·제목·부제만 정한다
 * - 작성·수정 폼이 Outlet context의 leaveRef에 나가기 확인 함수를 걸어 두면,
 *   사이드 메뉴·머리 이동도 그 확인을 거친다(걸린 게 없으면 바로 이동)
 */
export default function CustomerCenterLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const leaveRef = useRef(null);
  const onLeave = useCallback(
    (to) => (leaveRef.current ? leaveRef.current(to) : navigate(to)),
    [navigate],
  );
  const outletContext = useMemo(() => ({ leaveRef }), []);
  /** 상세·작성·수정도 소속 메뉴를 선택 상태로 */
  const menu = Object.keys(DESCRIPTIONS).find((to) => pathname.startsWith(to));
  /** 1:1 문의 작성·수정은 경로에 한 단계 더 붙는다 */
  const isInquiryNew = useMatch(PATHS.INQUIRY_NEW);
  const isInquiryEdit = useMatch(PATHS.INQUIRY_EDIT);
  let title;
  if (isInquiryNew) title = '문의 작성';
  if (isInquiryEdit) title = '문의 수정';

  return (
    <SubPageLayout
      section="support"
      menu={menu}
      title={title}
      back={false}
      description={DESCRIPTIONS[menu]}
      onLeave={onLeave}
      contentClassName="min-[1101px]:pt-4"
    >
      <Outlet context={outletContext} />
    </SubPageLayout>
  );
}
