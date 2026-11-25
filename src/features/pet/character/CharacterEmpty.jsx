import { Cat } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyResult from '@/components/EmptyResult';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import { PATHS } from '@/routes/paths';

/** 주양육·공동양육 어느 쪽으로도 연결된 동물이 없을 때 (FN-MYP-010-22) */
export default function CharacterEmpty() {
  return (
    <EmptyResult
      icon={<Cat className="size-7" aria-hidden="true" />}
      title="내 반려동물의 픽셀 캐릭터를 만들어보세요"
      description="반려동물을 등록하면 캐릭터를 만들 수 있어요"
    >
      <Link to={PATHS.MYPAGE_PETS} className={BTN_PRIMARY}>
        반려동물 등록하기
      </Link>
    </EmptyResult>
  );
}
