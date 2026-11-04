import { useId, useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import SearchInput from '@/components/SearchInput';
import Skeleton from '@/components/Skeleton';
import { showToast } from '@/components/toastStore';
import { formatDate } from '@/utils/formatDate';
import { useAssignHealthTip, useHealthTipCandidates } from './queries';

/** 펫정보 게시판·정상 상태 코드 */
const PET_INFO_BBS_CD = 'CMUC0001';
const NORMAL_STATUS_CD = 'CMUC0003';
/** 검색 결과 수 */
const CANDIDATE_SIZE = 10;
/** 노출 순서 */
const SEQ_OPTIONS = [1, 2, 3];

/**
 * [건강팁 지정 모달]
 * - 펫정보 정상 글을 제목으로 검색 -> 고르기 -> 노출 순서
 * - 같은 순서에 지정된 글은 새 글로 바뀜
 */
export default function HealthTipAssignModal({ onClose }) {
  const formId = useId();
  const [draftQ, setDraftQ] = useState('');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [seq, setSeq] = useState(1);

  const candidates = useHealthTipCandidates({
    ...(q ? { q } : {}),
    bbsCd: PET_INFO_BBS_CD,
    status: NORMAL_STATUS_CD,
    page: 1,
    size: CANDIDATE_SIZE,
  });
  const assign = useAssignHealthTip();

  const handleSearch = () => {
    setQ(draftQ.trim());
    setSelected(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selected || assign.isPending) return;
    assign.mutate(
      {
        pstSn: selected.pstSn,
        pstTtl: selected.pstTtl,
        hlthInfoExpsrSeq: seq,
      },
      {
        onSuccess: () => {
          showToast('건강팁을 지정했어요');
          onClose();
        },
      },
    );
  };

  /** 검색 결과: 로딩 / 오류 / 없음 / 목록 */
  const renderCandidates = () => {
    if (candidates.isPending) {
      return <Skeleton className="h-[240px] w-full" />;
    }
    if (candidates.isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-10">
          <p className="text-base text-subtle">
            {candidates.error?.code === 'INVALID_INPUT_VALUE'
              ? candidates.error.message
              : '게시글을 불러오지 못했어요.'}
          </p>
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => candidates.refetch()}
          >
            다시 시도
          </button>
        </div>
      );
    }
    if (candidates.data.content.length === 0) {
      return (
        <p className="py-10 text-center text-base text-subtle">
          검색된 펫정보 글이 없어요
        </p>
      );
    }
    return (
      <ul className="divide-y divide-line">
        {candidates.data.content.map((post) => {
          const isSelected = selected?.pstSn === post.pstSn;
          return (
            <li key={post.pstSn}>
              <label
                className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 ${isSelected ? 'bg-surface-2' : 'hover:bg-surface-2'}`}
              >
                <input
                  type="radio"
                  name={`${formId}-post`}
                  checked={isSelected}
                  className="h-4 w-4 shrink-0 accent-brand-900"
                  onChange={() => setSelected(post)}
                />
                <span className="min-w-0 flex-1 truncate text-base text-ink">
                  {post.pstTtl}
                </span>
                <span className="shrink-0 text-sm text-subtle">
                  {formatDate(post.regDt, { separator: '-' })}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <Modal
      title="건강팁 지정"
      isWide
      isTop
      isPending={assign.isPending}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className={BTN_SECONDARY}
            disabled={assign.isPending}
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="submit"
            form={formId}
            className={BTN_PRIMARY}
            disabled={!selected || assign.isPending}
          >
            지정
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <p className="mb-1.5 text-sm font-semibold text-ink-2">
            펫정보 게시글
          </p>
          <SearchInput
            value={draftQ}
            onChange={setDraftQ}
            onSubmit={handleSearch}
            placeholder="제목으로 검색"
          />
          <div className="mt-2 rounded-[6px] border border-line">
            {renderCandidates()}
          </div>
        </div>
        <form
          id={formId}
          noValidate
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold text-ink-2">
              노출 순서
            </legend>
            <div className="flex gap-4">
              {SEQ_OPTIONS.map((option) => (
                <label
                  key={option}
                  className="flex h-10 cursor-pointer items-center gap-2 text-base text-ink"
                >
                  <input
                    type="radio"
                    name={`${formId}-seq`}
                    checked={seq === option}
                    className="h-4 w-4 accent-brand-900"
                    onChange={() => setSeq(option)}
                  />
                  {option}번
                </label>
              ))}
            </div>
          </fieldset>
          {assign.isError && (
            <p role="alert" className="text-sm text-danger">
              {assign.error.message}
            </p>
          )}
        </form>
      </div>
    </Modal>
  );
}
