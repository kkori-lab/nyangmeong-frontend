import { useState } from 'react';
import { BTN_DANGER, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import Skeleton from '@/components/Skeleton';
import { showToast } from '@/components/toastStore';
import {
  ROLE_OPTIONS,
  STATUS_OPTIONS,
  SUSPENSION_DAY_OPTIONS,
} from './memberLabels';
import { useAdminMembers, useSuspendMember } from './queries';

const INPUT_CLASS =
  'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)]';
const TEXTAREA_CLASS =
  'block min-h-24 w-full resize-none rounded-[6px] border border-[#d3dae2] bg-white px-3 py-2 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)]';
const RADIO_LABEL_CLASS = 'inline-flex items-center gap-1.5 text-base text-ink';

/** 검색 결과 한 번에 보여 줄 수 */
const SEARCH_SIZE = 20;

/** 정지 대상 회원 검색: 정상 일반회원만 */
function MemberSearch({ selected, onSelect }) {
  const [keyword, setKeyword] = useState('');
  const [q, setQ] = useState('');

  const members = useAdminMembers(
    {
      q,
      status: STATUS_OPTIONS[0].value,
      role: ROLE_OPTIONS[0].value,
      page: 1,
      size: SEARCH_SIZE,
    },
    { enabled: Boolean(q) },
  );

  const handleSearch = () => {
    setQ(keyword.trim());
    onSelect(null);
  };

  const handleKeyDown = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    handleSearch();
  };

  /** 검색 결과: 로딩 / 오류 / 없음 / 목록 */
  const renderResult = () => {
    if (members.isPending) return <Skeleton className="h-10 w-full" />;
    if (members.isError) {
      return (
        <p role="alert" className="text-sm text-danger">
          {members.error.message}
        </p>
      );
    }
    if (members.data.content.length === 0) {
      return (
        <p className="text-sm text-subtle">정지할 수 있는 회원이 없어요</p>
      );
    }
    return (
      <ul className="max-h-44 overflow-y-auto rounded-[6px] border border-line">
        {members.data.content.map((member) => (
          <li key={member.mbrSn}>
            <label className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-surface-2">
              <input
                type="radio"
                name="suspend-member"
                className="accent-brand-500"
                checked={selected?.mbrSn === member.mbrSn}
                onChange={() => onSelect(member)}
              />
              <span className="text-base text-ink">{member.mbrNcnm}</span>
              <span className="min-w-0 truncate text-sm text-subtle">
                {member.maskedAcntEml}
              </span>
            </label>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="search"
          aria-label="회원 닉네임"
          placeholder="닉네임으로 검색"
          value={keyword}
          className={INPUT_CLASS}
          onChange={(event) => setKeyword(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className={`${BTN_SECONDARY} shrink-0`}
          onClick={handleSearch}
        >
          검색
        </button>
      </div>
      {q && renderResult()}
    </div>
  );
}

/**
 * [회원 정지 모달]
 * - 회원 검색 -> 기간·영구 -> 7일·30일 -> 사유 필수
 * - member를 넘기면 검색 없이 그 회원으로 시작: 회원 상세 진입용
 * - 실패하면 입력을 유지하고 서버 문구 표시
 */
export default function SuspendModal({ member, onClose }) {
  const [selected, setSelected] = useState(member ?? null);
  const [isPermanent, setIsPermanent] = useState(false);
  const [suspnDayCnt, setSuspnDayCnt] = useState(SUSPENSION_DAY_OPTIONS[0]);
  const [suspnRsn, setSuspnRsn] = useState('');
  const suspend = useSuspendMember();

  const trimmedRsn = suspnRsn.trim();

  const handleSuspend = () =>
    suspend.mutate(
      {
        mbrSn: selected.mbrSn,
        suspnDayCnt: isPermanent ? null : suspnDayCnt,
        suspnRsn: trimmedRsn,
      },
      {
        onSuccess: () => {
          showToast('회원을 정지했어요');
          onClose();
        },
      },
    );

  return (
    <Modal
      title="회원 정지"
      isTop
      isPending={suspend.isPending}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className={BTN_SECONDARY}
            disabled={suspend.isPending}
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className={BTN_DANGER}
            disabled={!selected || !trimmedRsn || suspend.isPending}
            onClick={handleSuspend}
          >
            정지
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-sm font-semibold text-ink-2">회원</p>
          {member ? (
            <p className="text-base text-ink">{member.mbrNcnm}</p>
          ) : (
            <MemberSearch selected={selected} onSelect={setSelected} />
          )}
        </div>
        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold text-ink-2">
            종류
          </legend>
          <div className="flex gap-4">
            <label className={RADIO_LABEL_CLASS}>
              <input
                type="radio"
                name="suspend-type"
                className="accent-brand-500"
                checked={!isPermanent}
                onChange={() => setIsPermanent(false)}
              />
              기간 정지
            </label>
            <label className={RADIO_LABEL_CLASS}>
              <input
                type="radio"
                name="suspend-type"
                className="accent-brand-500"
                checked={isPermanent}
                onChange={() => setIsPermanent(true)}
              />
              영구 정지
            </label>
          </div>
        </fieldset>
        {!isPermanent && (
          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold text-ink-2">
              기간
            </legend>
            <div className="flex gap-4">
              {SUSPENSION_DAY_OPTIONS.map((dayCnt) => (
                <label key={dayCnt} className={RADIO_LABEL_CLASS}>
                  <input
                    type="radio"
                    name="suspend-days"
                    className="accent-brand-500"
                    checked={suspnDayCnt === dayCnt}
                    onChange={() => setSuspnDayCnt(dayCnt)}
                  />
                  {dayCnt}일
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <label className="block text-sm font-semibold text-ink-2">
          사유
          <textarea
            value={suspnRsn}
            placeholder="정지 사유를 입력해 주세요"
            className={`${TEXTAREA_CLASS} mt-1.5 font-normal`}
            onChange={(event) => setSuspnRsn(event.target.value)}
          />
        </label>
        {suspend.isError && (
          <p role="alert" className="text-sm text-danger">
            {suspend.error.message}
          </p>
        )}
      </div>
    </Modal>
  );
}
