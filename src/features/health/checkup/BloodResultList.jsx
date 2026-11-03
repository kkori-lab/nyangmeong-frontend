import { useState } from 'react';
import { Link, generatePath, useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import { BTN_DANGER, BTN_SECONDARY } from '@/components/buttonStyles';
import { PATHS } from '@/routes/paths';
import { formatDate } from '@/utils/formatDate';
import { useDeleteInspections } from '../queries';
import BloodResultForm from './BloodResultForm';
import { ADD_ROW, BTN_SM, ROW_LINE, TAG, TAG_STRONG } from './checkupStyles';
import { findBloodItem } from '../labInput/bloodItems';
import { FUNCTION_TAGS, findName, getInspectionName } from './checkupTypes';

/** 항목의 기능 태그(혈구·신장·간·당): 서버가 주지 않아 항목 약어로 찾는다. 직접입력은 없음 */
const getFunctionTag = (item) =>
  findBloodItem(getInspectionName(item))?.fnctTagCd;

/** 참고범위를 벗어난 방향: 초과 'high', 미만 'low', 범위 안이거나 미입력이면 null */
const getOutDirection = ({ rsltNvl, refLlmtNvl, refUplmtNvl }) => {
  if (refLlmtNvl != null && rsltNvl < refLlmtNvl) return 'low';
  if (refUplmtNvl != null && rsltNvl > refUplmtNvl) return 'high';
  return null;
};

/**
 * [혈액검사 결과 목록]
 * - 기능 태그·태그별 건수, 항목·측정값·참고범위 한 줄, 참고범위 밖은 색 + ▲▼ (FN-HLT-005-02)
 * - 행의 어디를 눌러도(체크박스 제외) 검사 수치 입력(수정), [＋ 검사 수치 추가] → 목록 아래에 입력 영역이 열림
 * - 체크박스로 고른 항목을 확인 뒤 삭제
 */
export default function BloodResultList({ checkup, items }) {
  const navigate = useNavigate();
  const { petSn, ckupRcdSn } = checkup;
  const [selectedSns, setSelectedSns] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const deleteInspections = useDeleteInspections();

  const inputPath = generatePath(PATHS.HEALTH_CHECKUP_INSPECTIONS, {
    petSn,
    ckupRcdSn,
  });
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

  const goEdit = (item) =>
    navigate({
      pathname: inputPath,
      search: `?mode=edit&item=${item.inspNvlSn}`,
    });

  return (
    <div>
      {items.length === 0 ? (
        <p className="text-muted">결과 없음</p>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <h3 className="text-lg/[1.6] font-semibold">혈액검사</h3>
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
              <span key={tag.cd} className={TAG}>
                {tag.nm} {tag.count}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 border-b border-line py-2">
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-input-line bg-white px-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                className="size-4 accent-brand-500"
                onChange={(event) =>
                  setSelectedSns(
                    event.target.checked
                      ? items.map((item) => item.inspNvlSn)
                      : [],
                  )
                }
              />
              전체 선택
            </label>
            <button
              type="button"
              disabled={selectedSns.length === 0}
              className={`${BTN_SECONDARY} ${BTN_SM} ml-auto`}
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
                  onClick={() => goEdit(item)}
                >
                  <label
                    className="inline-flex h-10 cursor-pointer items-center rounded-md border border-input-line bg-white px-3"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      aria-label={`${getInspectionName(item)} 선택`}
                      checked={selectedSns.includes(item.inspNvlSn)}
                      className="size-4 accent-brand-500"
                      onChange={() => toggleItem(item.inspNvlSn)}
                    />
                  </label>
                  {getFunctionTag(item) && (
                    <span
                      className={`${TAG} min-w-12 justify-center ${direction ? TAG_STRONG : ''}`}
                    >
                      {findName(FUNCTION_TAGS, getFunctionTag(item))}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <Link
                      to={{
                        pathname: inputPath,
                        search: `?mode=edit&item=${item.inspNvlSn}`,
                      }}
                      className="text-lg/[1.6] font-semibold text-ink underline underline-offset-4 hover:text-brand-600"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {getInspectionName(item)}
                    </Link>
                    {hasRange && (
                      <span className="block text-sm text-subtle tabular-nums">
                        참고범위 {item.refLlmtNvl}~{item.refUplmtNvl}{' '}
                        {item.unitNm}
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-right text-lg/[1.6] font-semibold whitespace-nowrap tabular-nums ${direction ? 'text-danger' : ''}`}
                  >
                    {item.rsltNvl}{' '}
                    <span className="text-sm font-normal text-subtle">
                      {item.unitNm}
                    </span>
                    {direction && (
                      <>
                        {' '}
                        <span
                          aria-label={
                            direction === 'high'
                              ? '참고범위 초과'
                              : '참고범위 미만'
                          }
                        >
                          {direction === 'high' ? '▲' : '▼'}
                        </span>
                      </>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {!isFormOpen && (
        <button
          type="button"
          className={`${BTN_SECONDARY} ${ADD_ROW} w-full`}
          onClick={() => setIsFormOpen(true)}
        >
          <Icon name="add" className="text-lg" />
          검사 수치 추가
        </button>
      )}
      {isFormOpen && (
        <BloodResultForm
          petSn={petSn}
          ckupRcdSn={ckupRcdSn}
          registeredNames={new Set(items.map(getInspectionName))}
          onClose={() => setIsFormOpen(false)}
        />
      )}
      <p className="mt-3 flex gap-2.5 rounded-[10px] bg-surface-2 px-3.5 py-3 text-muted">
        <Icon name="info" className="mt-0.5 text-lg text-subtle" />
        <span>PDF로 받은 결과지는 첨부 자료 탭에서 [PDF 분석]</span>
      </p>

      {isConfirmOpen && (
        <Modal
          isConfirm
          title={`선택한 ${selectedSns.length}개 항목을 삭제할까요?`}
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
