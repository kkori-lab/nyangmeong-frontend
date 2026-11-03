import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import { SERVICE_CTPV } from './api';
import { useRegions, useServiceSggRegions } from './queries';

/** 지역 이름: 그 단계에서 채워진 가장 깊은 이름 */
const regionName = (region) =>
  region.emdNm || region.sggNm || region.ctpvNm || region.admdstCd;

/** 목록 칸 하나 높이를 채우는 스켈레톤 */
function ColumnSkeleton() {
  return (
    <div className="space-y-2 p-3" aria-busy="true">
      {Array.from({ length: 8 }, (_, index) => (
        <Skeleton key={index} className="h-9 w-full" />
      ))}
    </div>
  );
}

/**
 * [지역 단계 칸]
 * - query: 그 단계 useRegions 결과, parentName이 null이면(앞 단계 안 고름) hint만
 * - isLast: 마지막 단계는 고르는 버튼 대신 이름만
 */
function RegionColumn({
  title,
  hint,
  query,
  parentName,
  selectedSn,
  isLast,
  onSelect,
}) {
  const renderBody = () => {
    if (parentName === null) {
      return (
        <p className="px-4 py-10 text-center text-sm text-subtle">{hint}</p>
      );
    }
    if (query.isPending) return <ColumnSkeleton />;
    if (query.isError) {
      return (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 px-4 py-10"
        >
          <p className="text-sm text-subtle">지역을 불러오지 못했어요.</p>
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => query.refetch()}
          >
            다시 시도
          </button>
        </div>
      );
    }
    if (query.data.length === 0) {
      return (
        <p className="px-4 py-10 text-center text-sm text-subtle">
          하위 지역이 없어요
        </p>
      );
    }
    return (
      <ul className="py-1">
        {query.data.map((region) => {
          const name = regionName(region);
          if (isLast) {
            return (
              <li key={region.rgnSn} className="px-4 py-2 text-base text-ink-2">
                {name}
              </li>
            );
          }
          const isSelected = region.rgnSn === selectedSn;
          return (
            <li key={region.rgnSn}>
              <button
                type="button"
                aria-pressed={isSelected}
                className={`flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-base ${
                  isSelected
                    ? 'bg-surface-2 font-bold text-brand-900'
                    : 'text-ink-2 hover:bg-surface-2'
                }`}
                onClick={() => onSelect(region)}
              >
                <span className="truncate">{name}</span>
                <ChevronRight
                  className="size-4 shrink-0 text-subtle"
                  aria-hidden="true"
                />
              </button>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <section
      aria-label={title}
      className="flex min-w-0 flex-col overflow-hidden rounded-[14px] border border-line bg-white"
    >
      <h2 className="border-b border-line px-4 py-3 text-sm font-semibold text-subtle">
        {title}
        {parentName && (
          <span className="ml-1.5 font-normal text-ink-2">{parentName}</span>
        )}
        {query.isSuccess && parentName !== null && (
          <span className="ml-1.5 font-normal tabular-nums">
            {query.data.length.toLocaleString()}
          </span>
        )}
      </h2>
      <div className="h-[480px] overflow-y-auto max-[760px]:h-[280px]">
        {renderBody()}
      </div>
    </section>
  );
}

/**
 * [지역 조회]
 * - 시도 -> 시군구 -> 읍면동, 고르면 다음 단계를 불러옴. 수정은 없음
 * - 서비스 지역이 전북뿐이라 시도는 고르지 않고 전북 시군구부터 보여 줌
 * - 넓은 화면은 2열, 좁은 폭(760px 이하)은 단계별로 위아래
 */
export default function RegionBrowser() {
  const [sgg, setSgg] = useState(null);

  const sggQuery = useServiceSggRegions();
  const emdQuery = useRegions(sgg?.rgnSn, { enabled: Boolean(sgg) });

  return (
    <div className="grid grid-cols-2 gap-4 max-[760px]:grid-cols-1">
      <RegionColumn
        title="시군구"
        query={sggQuery}
        parentName={SERVICE_CTPV.ctpvNm}
        selectedSn={sgg?.rgnSn}
        onSelect={setSgg}
      />
      <RegionColumn
        title="읍면동"
        hint="시군구를 골라 주세요"
        query={emdQuery}
        parentName={sgg ? regionName(sgg) : null}
        isLast
      />
    </div>
  );
}
