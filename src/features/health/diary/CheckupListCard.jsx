import { useState } from 'react';
import { Link, generatePath } from 'react-router-dom';
import DropdownSelect from '@/components/DropdownSelect';
import Badge from '@/components/Badge';
import Card from '@/components/Card';
import Pagination from '@/components/Pagination';
import SkeletonCard from '@/components/SkeletonCard';
import {
  BTN_PRIMARY,
  FILTER_CHIP,
  FILTER_CHIP_ON,
} from '@/components/buttonStyles';
import { PATHS } from '@/routes/paths';
import { formatDate, getTodayYmd, getYear } from '@/utils/formatDate';
import { useCheckupYears, useCheckups } from '../queries';
import CheckupModal from './CheckupModal';
import EmptyResult from '@/components/EmptyResult';
import Icon from '@/components/Icon';

/** 한 페이지에 고정으로 보여 주는 검진기록 수 */
const PAGE_SIZE = 10;

/** 필터 칩으로 따로 세는 검진 종류(예방접종) */
const VACCINATION = 'HLTC0002';

/**
 * [검진기록 카드]
 * - 조회 연도 드롭다운·검진 건수 필터 칩 2종·검진기록 리스트·[검진기록 추가] (FN-HLT-002-05·06·14)
 * - 리스트는 서버 페이지(10건), 칩 건수는 그해 전체·예방접종 건수를 따로 받는다
 * - 줄을 누르면 검진상세로 이동. 검진기록 삭제는 검진상세에서만 (※신규 정책)
 * - 등록 방법 선택에서 영수증을 고르면 이 모달 닫힘, onReceipt로 페이지가 영수증 등록 이어받음
 */
export default function CheckupListCard({ pet, pets, onReceipt }) {
  const currentYear = getYear(getTodayYmd());
  const [year, setYear] = useState(currentYear);
  // 켜진 필터 칩: 'ALL'(그해 전체)·VACCINATION(예방접종)·null(둘 다 꺼짐, 그해 전체)
  const [chipFilter, setChipFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { petSn } = pet;
  const list = useCheckups({
    petSn,
    year,
    ckupTypeCd: chipFilter === VACCINATION ? VACCINATION : undefined,
    page,
    size: PAGE_SIZE,
  });
  const yearCount = useCheckups({ petSn, year, size: 1 });
  const vaccinationCount = useCheckups({
    petSn,
    year,
    ckupTypeCd: VACCINATION,
    size: 1,
  });
  const years = useCheckupYears(petSn);

  if (
    list.isPending ||
    yearCount.isPending ||
    vaccinationCount.isPending ||
    years.isPending
  ) {
    return (
      <div aria-busy="true">
        <SkeletonCard className="h-[1145px] max-[760px]:h-[1437px]" />
      </div>
    );
  }

  const pageCheckups = list.data.content;
  const pageCount = Math.max(1, list.data.totalPages);
  const hasAnyCheckup = years.data.length > 0;
  const yearOptions = [...new Set([currentYear, year, ...years.data])].sort(
    (a, b) => b - a,
  );
  const yearLabel = year === currentYear ? '올해' : `${year}년`;

  // 켜진 칩을 다시 누르면 꺼진다 (FN-HLT-002-06 재클릭 해제)
  const toggleChip = (filter) => {
    setChipFilter((prev) => (prev === filter ? null : filter));
    setPage(1);
  };

  const chipClass = (isActive) => (isActive ? FILTER_CHIP_ON : FILTER_CHIP);

  /** 연도 선택은 제목 바로 옆(Card의 sub 자리), 등록 버튼은 제목줄 오른쪽 끝 */
  const yearSelect = (
    <DropdownSelect
      label="조회 연도"
      value={year}
      disabled={!hasAnyCheckup}
      options={yearOptions.map((option) => ({
        value: option,
        label: `${option}년`,
      }))}
      className="w-30"
      onChange={(value) => {
        setYear(value);
        setPage(1);
      }}
    />
  );
  /** 760px 미만은 제목줄이 좁아 지속 관찰처럼 짧은 [+ 추가], 760px 이상은 [검진기록 추가] */
  const registerButton = (
    <button
      type="button"
      className={`${BTN_PRIMARY} shrink-0`}
      onClick={() => setIsModalOpen(true)}
    >
      <span className="min-[760px]:hidden">+ 추가</span>
      <span className="hidden min-[760px]:inline">검진기록 추가</span>
    </button>
  );

  return (
    <Card
      title="검진기록"
      sub={yearSelect}
      className="min-w-0"
      action={registerButton}
    >
      <div
        role="group"
        aria-label="검진 건수 필터"
        className="mb-4 flex flex-wrap gap-2"
      >
        <button
          type="button"
          aria-pressed={chipFilter === 'ALL'}
          className={chipClass(chipFilter === 'ALL')}
          onClick={() => toggleChip('ALL')}
        >
          {yearLabel} 검진 {yearCount.data.totalElements}
        </button>
        <button
          type="button"
          aria-pressed={chipFilter === VACCINATION}
          className={chipClass(chipFilter === VACCINATION)}
          onClick={() => toggleChip(VACCINATION)}
        >
          예방접종 {vaccinationCount.data.totalElements}
        </button>
      </div>

      {pageCheckups.length === 0 ? (
        <EmptyResult
          isCompact
          icon={
            <Icon
              name="local_hospital"
              className="text-[28px] text-line-strong"
            />
          }
          title="등록된 검진기록이 없어요"
          description="병원에 다녀왔다면 직접 입력하거나 영수증으로 등록해 보세요"
        />
      ) : (
        <>
          <ul className="border-t border-line-soft">
            {pageCheckups.map((checkup) => (
              <li
                key={checkup.ckupRcdSn}
                className="relative flex cursor-pointer items-start gap-3 border-b border-line-soft px-4 py-4 hover:bg-surface-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    {/* 누르는 영역만 after로 줄 전체에 넓힌다. 낭독기·키보드 링크는 병원명 하나다 */}
                    <Link
                      to={generatePath(PATHS.HEALTH_CHECKUP_DETAIL, {
                        petSn,
                        ckupRcdSn: checkup.ckupRcdSn,
                      })}
                      className="text-lg font-semibold text-ink underline-offset-4 after:absolute after:inset-0 hover:text-brand-600 hover:underline"
                    >
                      {checkup.hsptlNm}
                    </Link>
                    <span className="text-subtle tabular-nums">
                      {formatDate(checkup.ckupYmd)} · {checkup.ckupTypeCdNm}
                    </span>
                    {checkup.schdlDelYn && (
                      <Badge tone="gray">연결된 일정 삭제됨</Badge>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-7">
            <Pagination page={page} pageCount={pageCount} onChange={setPage} />
          </div>
        </>
      )}

      {isModalOpen && (
        <CheckupModal
          pets={pets}
          defaultPetSn={pet.petSn}
          onReceipt={() => {
            setIsModalOpen(false);
            onReceipt();
          }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </Card>
  );
}
