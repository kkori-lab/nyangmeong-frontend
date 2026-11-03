import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import Skeleton from '@/components/Skeleton';
import { formatDate } from '@/utils/formatDate';
import { useAdminTerm, useAdminTermsHistory } from './queries';
import { getTermsKindName } from './termsKinds';

/** 조회 실패 안내 + [다시 시도] */
function LoadError({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-10">
      <p className="text-base text-subtle">{message}</p>
      <button type="button" className={BTN_SECONDARY} onClick={onRetry}>
        다시 시도
      </button>
    </div>
  );
}

/** 지난 버전 목록(최신순). 행을 누르면 onSelect(버전 행) */
function VersionList({ history, onSelect }) {
  if (history.isPending) {
    return (
      <div className="space-y-2" aria-busy="true">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }
  if (history.isError) {
    return (
      <LoadError
        message="버전 이력을 불러오지 못했어요."
        onRetry={() => history.refetch()}
      />
    );
  }
  if (history.data.length === 0) {
    return (
      <p className="py-10 text-center text-base text-subtle">
        등록된 버전이 없어요
      </p>
    );
  }
  return (
    <ul className="divide-y divide-line rounded-[10px] border border-line">
      {history.data.map((terms) => (
        <li key={terms.trmsSn}>
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2"
            onClick={() => onSelect(terms)}
          >
            <span className="w-14 shrink-0 font-semibold text-ink tabular-nums">
              {terms.trmsVerId}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-base text-ink-2">
                {terms.trmsTtl}
              </span>
              <span className="mt-0.5 block text-sm text-subtle">
                {terms.esntlAgreYn ? '필수' : '선택'} ·{' '}
                {terms.useYn ? '사용' : '사용 안 함'} ·{' '}
                {formatDate(terms.regDt)}
              </span>
            </span>
            <ChevronRight
              className="size-4 shrink-0 text-subtle"
              aria-hidden="true"
            />
          </button>
        </li>
      ))}
    </ul>
  );
}

/** 버전 하나의 내용 */
function VersionDetail({ summary, onBack }) {
  const detail = useAdminTerm(summary.trmsSn);

  const renderContent = () => {
    if (detail.isPending) {
      return (
        <div aria-busy="true">
          <Skeleton className="h-[240px] w-full" />
        </div>
      );
    }
    if (detail.isError) {
      return (
        <LoadError
          message="약관 내용을 불러오지 못했어요."
          onRetry={() => detail.refetch()}
        />
      );
    }
    return (
      <div className="max-h-[50vh] overflow-y-auto rounded-[10px] border border-line bg-surface-2 p-4 text-base leading-6 whitespace-pre-wrap text-ink-2">
        {detail.data.trmsCn}
      </div>
    );
  };

  return (
    <div>
      <button
        type="button"
        className="mb-3 inline-flex h-8 items-center gap-1 text-sm font-semibold text-subtle hover:text-ink"
        onClick={onBack}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        목록으로
      </button>
      <p className="text-lg font-bold text-ink">
        {summary.trmsVerId} {summary.trmsTtl}
      </p>
      <p className="mt-1 mb-3 text-sm text-subtle">
        {summary.esntlAgreYn ? '필수' : '선택'} ·{' '}
        {summary.useYn ? '사용' : '사용 안 함'} · {formatDate(summary.regDt)}{' '}
        등록
      </p>
      {renderContent()}
    </div>
  );
}

/**
 * [약관 버전 이력]
 * - 한 종류의 모든 버전(최신순). 버전을 누르면 같은 모달에서 내용, [목록으로]로 돌아감
 */
export default function TermsHistoryModal({ trmsFixIdntfKey, onClose }) {
  const history = useAdminTermsHistory(trmsFixIdntfKey);
  /** 내용을 보고 있는 버전 행, null이면 목록 */
  const [selected, setSelected] = useState(null);

  return (
    <Modal
      title={`${getTermsKindName(trmsFixIdntfKey)} 이력`}
      isWide
      onClose={onClose}
    >
      {selected ? (
        <VersionDetail summary={selected} onBack={() => setSelected(null)} />
      ) : (
        <VersionList history={history} onSelect={setSelected} />
      )}
    </Modal>
  );
}
