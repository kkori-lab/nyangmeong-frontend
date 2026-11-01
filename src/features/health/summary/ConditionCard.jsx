import Card from '@/components/Card';
import { PATHS } from '@/routes/paths';
import { splitList } from '@/utils/petFormat';
import { CardTitle, MoreLink } from './SummaryParts';

/**
 * [알레르기 · 기저질환] (FN-HLT-011-05)
 * - 마이페이지 프로필의 두 필드를 각각 한 줄로 조회만 함. 빈 줄은 "등록된 내용 없음"
 * - [수정하러 가기]는 두 필드가 모두 비면 [입력하러 가기]. 입력하는 마이페이지 반려동물 관리로 보냄 (명세 v1.1)
 */
export default function ConditionCard({ pet }) {
  const isEmpty = !pet.algyCn && !pet.dssCn;

  return (
    <Card
      title={
        <CardTitle icon="error">
          알레르기 · 기저질환
        </CardTitle>
      }
      sub={
        <span className="text-sm/[1.6] max-sm:hidden">진료 시 반드시 확인</span>
      }
      action={
        <MoreLink to={PATHS.MYPAGE_PETS} state={{ petSn: pet.petSn }}>
          {isEmpty ? '입력하러 가기' : '수정하러 가기'}
        </MoreLink>
      }
      className="flex-1"
    >
      <Line label="알레르기" value={pet.algyCn} />
      <div className="mt-4 border-t border-line-soft pt-4">
        <Line label="기저질환" value={pet.dssCn} />
      </div>
    </Card>
  );
}

/** 제목은 왼쪽에 고정 폭으로 두고, 세로 구분선 너머 오른쪽에 내용을 나열 */
function Line({ label, value }) {
  const items = splitList(value);

  return (
    <div className="flex items-stretch gap-4">
      <p className="w-20 shrink-0 border-r border-line-soft text-sm/[1.6] text-subtle">
        {label}
      </p>
      {items.length > 0 ? (
        <ul className="flex min-w-0 flex-wrap gap-x-3 gap-y-1">
          {items.map((item) => (
            <li key={item}>{item.trim()}</li>
          ))}
        </ul>
      ) : (
        <p className="text-placeholder">등록된 내용 없음</p>
      )}
    </div>
  );
}
