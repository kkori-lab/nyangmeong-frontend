import { ChevronRight, Circle, CircleCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Icon from '@/components/Icon';
import Reveal from '@/components/Reveal';
import { PATHS } from '@/routes/paths';
import { getTodayYmd } from '@/utils/formatDate';
import { MAX_MAIN_CARE } from './careDue';
import { useCareItems } from './queries';

const CARE_LIST_PATH = `${PATHS.HEALTH_CALENDAR}#hlt003-care`;

const CARD =
  'rounded-card border border-line bg-white/72 shadow-[0_1px_2px_rgba(26,50,52,0.04)] backdrop-blur-lg backdrop-saturate-[1.6]';

/**
 * [토탈 케어리스트 미리보기] 메인 SCR-MAN-001 (FN-MAN-009)
 * - 건강기록에서 메인 노출로 고른 항목(mainExpsrYn)을 mainSortSeq 순으로 최대 6개, 읽기 전용
 * - 완료 체크는 하지 않고 오늘 완료 여부만. 투약 항목은 하루 복용 횟수를 채워야 완료(CareList와 같은 규칙)
 */
export default function CarePreview({ petSn }) {
  const { data, isPending, isError } = useCareItems(petSn);

  return (
    <Reveal as="section" aria-labelledby="main-care" className={`${CARD} mt-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-[22px] py-[18px]">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 id="main-care" className="text-lg font-bold tracking-[-0.01em]">
            토탈 케어리스트
          </h3>
          <span className="text-sm text-subtle">
            보기 전용 · 체크는 건강기록에서
          </span>
        </div>
        <Link
          to={CARE_LIST_PATH}
          className="inline-flex items-center gap-0.5 text-sm font-semibold text-brand-600 hover:underline hover:underline-offset-[3px]"
        >
          건강기록에서 관리
          <ChevronRight className="size-[18px]" aria-hidden="true" />
        </Link>
      </div>
      <CareBody data={data} isPending={isPending} isError={isError} />
    </Reveal>
  );
}

function CareBody({ data, isPending, isError }) {
  if (isPending) {
    return (
      <div
        aria-hidden="true"
        className="mx-6 my-8 h-36 animate-pulse rounded-md bg-[#e9eded] max-[700px]:mx-4"
      />
    );
  }
  if (isError) {
    return (
      <p role="alert" className="px-6 py-8 text-muted max-[700px]:px-4">
        케어리스트를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요
      </p>
    );
  }

  const { careItems, careRecords } = data;
  const todayYmd = getTodayYmd();
  const mainItems = careItems
    .filter((item) => item.mainExpsrYn)
    .sort((a, b) => a.mainSortSeq - b.mainSortSeq)
    .slice(0, MAX_MAIN_CARE);
  const isDoneToday = (item) =>
    item.prscSn != null
      ? item.todayCmptnCnt >= item.dayMdcnNmtm
      : careRecords.some(
          (record) =>
            record.careArtclSn === item.careArtclSn &&
            record.cmptnYmd === todayYmd,
        );

  if (mainItems.length === 0) {
    return (
      <p className="px-6 py-8 text-muted max-[700px]:px-4">
        메인에 보일 케어 항목이 없어요.{' '}
        <Link
          to={CARE_LIST_PATH}
          className="font-semibold text-brand-600 underline underline-offset-3"
        >
          건강기록에서 설정하기
        </Link>
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-6 gap-3 px-6 py-8 max-[1100px]:grid-cols-3 max-[700px]:grid-cols-2 max-[700px]:px-4">
      {mainItems.map((item) => {
        const isDone = isDoneToday(item);
        const Mark = isDone ? CircleCheck : Circle;
        return (
          <li
            key={item.careArtclSn}
            className="relative flex flex-col items-center justify-center gap-2 rounded-box bg-surface-2 px-2 pt-5 pb-4 text-center"
          >
            <Mark
              className={`absolute top-2 right-2 size-6 ${isDone ? 'text-ok' : 'text-line-strong'}`}
              aria-hidden="true"
            />
            <span
              aria-hidden="true"
              className={`grid size-16 shrink-0 place-items-center rounded-full ${isDone ? 'bg-brand-50 text-brand-600' : 'bg-surface-3 text-subtle'}`}
            >
              <Icon name={item.rprsIconId} className="text-[40px]" />
            </span>
            <span className="grow">
              <span className="block font-semibold">{item.careArtclNm}</span>
              <span className="mt-1 block text-sm leading-[1.4] text-muted">
                {isDone ? '오늘 완료' : '오늘 미완료'}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
