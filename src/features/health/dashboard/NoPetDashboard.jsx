import { Link } from 'react-router-dom';
import EmptyResult from '@/components/EmptyResult';
import Icon from '@/components/Icon';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import { getRegisterPath } from '../shared/registerPath';

/**
 * [반려동물 0마리 대시보드 자리] (※신규 정책)
 * - 공용 빈 안내(EmptyResult) + [반려동물 등록]: 공통 반려동물 카드와 같은 마이페이지 등록 모달 경로(?register=1&returnTo=)
 * - returnTo: 등록하고 돌아올 주소(종합 건강기록은 튜토리얼을 열도록 표시를 붙임)
 * - description: 화면마다 다른 설명. 기본값은 종합 건강기록 문구 (※신규 정책)
 */
export default function NoPetDashboard({
  returnTo,
  description = '반려동물을 등록하면 건강 대시보드에서 기록을 모아 볼 수 있어요',
}) {
  return (
    <section aria-label="반려동물 등록 안내">
      <EmptyResult
        icon={<Icon name="pets" className="text-page text-line-strong" />}
        title="아직 등록된 반려동물이 없어요"
        description={description}
      >
        <Link to={getRegisterPath(returnTo)} className={BTN_PRIMARY}>
          반려동물 등록하기
        </Link>
      </EmptyResult>
    </section>
  );
}
