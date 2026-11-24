import { useState } from 'react';
import NoticeBox from '@/components/NoticeBox';
import Badge from '@/components/Badge';
import Checkbox from '@/components/Checkbox';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import { BTN_DANGER, BTN_SECONDARY } from '@/components/buttonStyles';
import { formatDate } from '@/utils/formatDate';
import { round2 } from '../numberFormat';
import { useDeleteInspections } from '../queries';
import BloodResultModal from './BloodResultModal';
import { ADD_ROW, ROW_LINE } from './checkupStyles';
import { findBloodItem } from '../labInput/bloodItems';
import { FUNCTION_TAGS, findName, getInspectionName } from './checkupTypes';

/** 항목의 기능 태그(혈구·신장·간·당): 서버가 주지 않아 항목 약어로 찾는다. 직접입력은 없음 */
const getFunctionTag = (item) =>
  findBloodItem(getInspectionName(item))?.fnctTagCd;

/**
 * 참고범위를 벗어난 방향: 초과 'high', 미만 'low', 범위 안이거나 미입력이면 null
 * - 화면에 보이는 값끼리 비교하도록 결과·참고범위 모두 소수 둘째 자리로 반올림해 비교 (※신규 정책)
 */
const getOutDirection = ({ rsltNvl, refLlmtNvl, refUplmtNvl }) => {
  const value = round2(rsltNvl);
  if (refLlmtNvl != null && value < round2(refLlmtNvl)) return 'low';
  if (refUplmtNvl != null && value > round2(refUplmtNvl)) return 'high';
  return null;
};

/** 참고범위 밖 측정값 색: 초과 빨강, 미만 파랑 (※신규 정책, 2026-11-23) */
const DIRECTION_COLOR = { high: 'text-danger', low: 'text-tone-blue-fg' };

/**
 * [혈액검사 결과 목록]
 * - 기능 태그·태그별 건수, 항목·측정값·참고범위 한 줄, 참고범위 밖은 색 + ▲▼ (FN-HLT-005-02)
 * - 행의 어디를 눌러도(체크박스 제외) 검사 수치 수정 모달, [＋ 검사 수치 추가] → 검사 수치 추가 모달
 * - 측정값 앞 ▲(초과, 빨강)·▼(미만, 파랑) (※신규 정책, 2026-11-23)
 * - 줄마다 있던 「추이 보기 ›」(종합 건강기록 검사 수치 카드로 이동)는 취소. 목록 아래 안내로 대신함 (※신규 정책 취소, 2026-11-23)
 * - 체크박스로 고른 항목을 확인 뒤 삭제
 */
export default function BloodResultList({ checkup, items }) {
  const { petSn, ckupRcdSn } = checkup;
  const [selectedSns, setSelectedSns] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  /** 입력 모달: null이면 닫힘, item이 null이면 새로 추가 */
  const [modal, setModal] = useState(null);
  const deleteInspections = useDeleteInspections();

  const tagCounts = FUNCTION_TAGS.map((tag) => ({
    ...tag,
    count: items.filter((item) => getFunctionTag(item) === tag.cd).length,
  })).filter((tag) => tag.count > 0);
  const isAllSelected =
    items.length > 0 &&
    items.every((item) => selectedSns.includes(item.inspNvlSn));

  const toggleItem = (inspNvlSn) =>
    setSelectedSns((prev) =>
      prev.includes(inspNvlSn)
        ? prev.filter((sn) => sn !== inspNvlSn)
        : [...prev, inspNvlSn],
    );

  const handleDelete = () =>
    deleteInspections.mutate(
      { petSn, ckupRcdSn, inspNvlSns: selectedSns },
      {
        onSuccess: () => {
          setSelectedSns([]);
          setIsConfirmOpen(false);
        },
      },
    );

  const openEdit = (item) => setModal({ item });

  return (
    <div>
      {items.length === 0 ? (
        <p className="text-muted">결과가 없어요</p>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <h3 className="text-lg font-semibold">혈액검사</h3>
            <span className="text-subtle tabular-nums">
              검사일 {formatDate(checkup.ckupYmd)} · {checkup.hsptlNm} ·{' '}
              {items.length}건
            </span>
          </div>
          <div
            aria-label="기능 태그별 건수"
            className="mb-3 flex flex-wrap gap-2"
          >
            {tagCounts.map((tag) => (
              <Badge key={tag.cd}>
                {tag.nm} {tag.count}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-3 border-b border-line py-2">
            <Checkbox
              checked={isAllSelected}
              className="h-10 rounded-md border border-input-line bg-white px-3"
              onChange={(event) =>
                setSelectedSns(
                  event.target.checked
                    ? items.map((item) => item.inspNvlSn)
                    : [],
                )
              }
            >
              전체 선택
            </Checkbox>
            <button
              type="button"
              disabled={selectedSns.length === 0}
              className={`${BTN_SECONDARY} ml-auto`}
              onClick={() => setIsConfirmOpen(true)}
            >
              선택 삭제 ({selectedSns.length})
            </button>
          </div>

          <ul className="max-h-96 overflow-y-auto">
            {items.map((item) => {
              const direction = getOutDirection(item);
              const hasRange =
                item.refLlmtNvl != null && item.refUplmtNvl != null;
              return (
                <li
                  key={item.inspNvlSn}
                  className={`flex cursor-pointer items-center gap-3 py-3 hover:bg-surface-2 ${ROW_LINE}`}
                  onClick={() => openEdit(item)}
                >
                  <span onClick={(event) => event.stopPropagation()}>
                    <Checkbox
                      ariaLabel={`${getInspectionName(item)} 선택`}
                      checked={selectedSns.includes(item.inspNvlSn)}
                      className="h-10 rounded-md border border-input-line bg-white px-3"
                      onChange={() => toggleItem(item.inspNvlSn)}
                    />
                  </span>
                  {getFunctionTag(item) && (
                    <Badge
                      tone={direction ? 'ink' : 'gray'}
                      className="min-w-12 justify-center"
                    >
                      {findName(FUNCTION_TAGS, getFunctionTag(item))}
                    </Badge>
                  )}
                  <span className="min-w-0 flex-1">
                    <button
                      type="button"
                      className="text-left text-lg font-semibold text-ink underline underline-offset-4 hover:text-brand-600"
                      onClick={(event) => {
                        event.stopPropagation();
                        openEdit(item);
                      }}
                    >
                      {getInspectionName(item)}
                    </button>
                    {hasRange && (
                      <span className="block text-sm text-subtle tabular-nums">
                        참고범위 {round2(item.refLlmtNvl)}~
                        {round2(item.refUplmtNvl)} {item.unitNm}
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-right text-lg font-semibold whitespace-nowrap tabular-nums ${DIRECTION_COLOR[direction] ?? ''}`}
                  >
                    {direction && (
                      <>
                        <span
                          aria-label={
                            direction === 'high'
                              ? '참고범위 초과'
                              : '참고범위 미만'
                          }
                        >
                          {direction === 'high' ? '▲' : '▼'}
                        </span>{' '}
                      </>
                    )}
                    {round2(item.rsltNvl)}{' '}
                    <span className="text-sm font-normal text-subtle">
                      {item.unitNm}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <button
        type="button"
        className={`${BTN_SECONDARY} ${ADD_ROW} w-full`}
        onClick={() => setModal({ item: null })}
      >
        <Icon name="add" className="text-lg" />
        검사 수치 추가
      </button>
      {modal && (
        <BloodResultModal
          petSn={petSn}
          ckupRcdSn={ckupRcdSn}
          item={modal.item}
          registeredNames={new Set(items.map(getInspectionName))}
          onClose={() => setModal(null)}
        />
      )}
      {/* 수치 변화 안내 줄 (※신규 정책, 2026-11-23) */}
      <NoticeBox className="mt-3 flex gap-2.5">
        <Icon name="info" className="text-lg text-subtle" />
        <ul>
          <li>
            · 항목별 수치 변화는 종합 건강기록 [검사 수치] 카드에서 볼 수 있어요
          </li>
          <li>· PDF로 받은 결과지는 첨부 자료 탭에서 [PDF 분석]</li>
        </ul>
      </NoticeBox>

      {isConfirmOpen && (
        <Modal
          isConfirm
          title={`선택한 ${selectedSns.length}개 항목을 삭제할까요?`}
          description="삭제하면 되돌릴 수 없어요."
          isPending={deleteInspections.isPending}
          onClose={() => setIsConfirmOpen(false)}
          footer={
            <>
              <button
                type="button"
                className={BTN_SECONDARY}
                disabled={deleteInspections.isPending}
                onClick={() => setIsConfirmOpen(false)}
              >
                취소
              </button>
              <button
                type="button"
                className={BTN_DANGER}
                disabled={deleteInspections.isPending}
                onClick={handleDelete}
              >
                삭제하기
              </button>
            </>
          }
        />
      )}
    </div>
  );
}
