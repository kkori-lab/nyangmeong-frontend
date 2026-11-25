import { PawPrint } from 'lucide-react';
import EmptyResult from '@/components/EmptyResult';
import { BTN_PRIMARY } from '@/components/buttonStyles';

/**
 * [반려동물 0마리 안내]
 * - 공용 EmptyResult 사용. 설명은 <p> 안이라 줄은 span으로 나눈다(Skeleton은 div라 쓰지 않는다)
 * - 둘째 줄(최대 마리 수): 한도 불러오는 중이면 막대, 못 불러오면 생략
 */
export default function PetEmpty({ onRegister, limit }) {
  return (
    <EmptyResult
      icon={<PawPrint className="size-7" />}
      title="아직 등록된 반려동물이 없어요"
      description={
        <>
          <span className="block">
            반려동물을 등록하면 건강기록·케어미션·픽셀 캐릭터를 이용할 수
            있어요
          </span>
          {limit.isPending ? (
            <span
              aria-hidden="true"
              className="mx-auto mt-1 block h-5 w-64 max-w-full animate-pulse rounded-md bg-surface-2"
            />
          ) : (
            limit.data && (
              <span className="block">
                공동양육을 포함해 최대 {limit.data.petMaxCnt}마리까지 등록할 수
                있어요
              </span>
            )
          )}
        </>
      }
    >
      <button type="button" onClick={onRegister} className={BTN_PRIMARY}>
        반려동물 등록하기
      </button>
    </EmptyResult>
  );
}
