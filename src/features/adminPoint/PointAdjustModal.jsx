import { useId, useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import { showToast } from '@/components/toastStore';
import { ADJUST_PNT_MAX, MEMO_CN_MAX } from './pointLabels';
import {
  useAdjustAdminPoint,
  useAdminPointBalance,
  useAdminPointMemberSearch,
} from './queries';

const INPUT_CLASS =
  'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)] aria-invalid:border-danger';

const LABEL_CLASS = 'mb-1.5 block text-sm font-semibold text-ink-2';

/** 1 이상 정수 */
const POSITIVE_INT_PATTERN = /^[1-9]\d*$/;

const DIRECTIONS = [
  { value: 'give', label: '지급' },
  { value: 'take', label: '차감' },
];

/** 칸마다 틀린 값 안내: 없으면 빈 객체 */
const validate = ({ member, pnt, memoCn }) => {
  const errors = {};
  if (!member) errors.member = '조정할 회원을 골라 주세요';
  const trimmed = pnt.trim();
  if (!POSITIVE_INT_PATTERN.test(trimmed)) {
    errors.pnt = '포인트는 1 이상 정수로 입력해 주세요';
  } else if (Number(trimmed) > ADJUST_PNT_MAX) {
    errors.pnt = `포인트는 ${ADJUST_PNT_MAX.toLocaleString()} 이하로 입력해 주세요`;
  }
  if (!memoCn.trim()) errors.memoCn = '사유를 입력해 주세요';
  return errors;
};

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-danger">
      {message}
    </p>
  );
}

/** 회원 고르기: 골랐으면 그 회원 + [변경], 아니면 검색창 + 결과 */
function MemberPicker({ id, member, error, onSelect }) {
  const [keyword, setKeyword] = useState('');
  const [q, setQ] = useState('');
  const search = useAdminPointMemberSearch(q);

  const runSearch = () => setQ(keyword.trim());

  if (member) {
    return (
      <div>
        <p className={LABEL_CLASS}>회원</p>
        <div className="flex h-10 items-center gap-2 rounded-[6px] bg-surface-2 pr-1 pl-3">
          <span className="min-w-0 truncate text-base leading-[1.3] text-ink">
            {member.mbrNcnm}
          </span>
          <span className="shrink-0 text-sm text-subtle tabular-nums">
            #{member.mbrSn}
          </span>
          <button
            type="button"
            className="ml-auto h-8 shrink-0 rounded-[6px] px-3 text-sm leading-[1.3] text-ink-2 hover:bg-surface-3"
            onClick={() => onSelect(null)}
          >
            변경
          </button>
        </div>
      </div>
    );
  }

  const renderResult = () => {
    if (!q) return null;
    if (search.isPending) {
      return <p className="px-3 py-3 text-sm text-subtle">찾는 중이에요</p>;
    }
    if (search.isError) {
      return (
        <p role="alert" className="px-3 py-3 text-sm text-danger">
          회원을 찾지 못했어요. 다시 검색해 주세요.
        </p>
      );
    }
    if (search.data.length === 0) {
      return (
        <p className="px-3 py-3 text-sm text-subtle">
          &lsquo;{q}&rsquo;에 맞는 회원이 없어요
        </p>
      );
    }
    return (
      <ul className="max-h-[200px] overflow-y-auto">
        {search.data.map((candidate) => (
          <li key={candidate.mbrSn}>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-surface-2"
              onClick={() =>
                onSelect({
                  mbrSn: candidate.mbrSn,
                  mbrNcnm: candidate.mbrNcnm,
                })
              }
            >
              <span className="min-w-0 truncate text-base leading-[1.3] text-ink">
                {candidate.mbrNcnm}
              </span>
              <span className="min-w-0 truncate text-sm text-subtle">
                {candidate.maskedAcntEml}
              </span>
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        회원
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          type="search"
          placeholder="닉네임 또는 이메일"
          value={keyword}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-error`}
          className={INPUT_CLASS}
          onChange={(event) => setKeyword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            runSearch();
          }}
        />
        <button
          type="button"
          className={`${BTN_SECONDARY} shrink-0`}
          onClick={runSearch}
        >
          검색
        </button>
      </div>
      {q && (
        <div className="mt-2 rounded-[10px] border border-line">
          {renderResult()}
        </div>
      )}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

/**
 * [포인트 조정 모달]
 * - 회원 → 지급/차감 → 포인트 → 사유(필수). 거래 유형은 '관리자 조정', 사유는 메모로 남는다
 * - 회원을 고르면 현재 잔액과 조정 후 잔액을 보이고, 차감 후 0보다 작아지면 저장을 막는다
 * - [저장]을 누르면 칸마다 검사하고, 저장하면 토스트 후 닫음. 실패하면 입력 유지 + 서버 문구
 */
export default function PointAdjustModal({ initialMember, onClose }) {
  const formId = useId();
  const [member, setMember] = useState(initialMember);
  const [direction, setDirection] = useState('give');
  const [pnt, setPnt] = useState('');
  const [memoCn, setMemoCn] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const balance = useAdminPointBalance(member?.mbrSn);
  const adjust = useAdjustAdminPoint();

  const errors = isSubmitted ? validate({ member, pnt, memoCn }) : {};
  const isPntValid = POSITIVE_INT_PATTERN.test(pnt.trim());
  const dlngPnt = isPntValid
    ? Number(pnt.trim()) * (direction === 'take' ? -1 : 1)
    : 0;
  const nextBalance = balance.isSuccess ? balance.data + dlngPnt : null;
  const isBalanceShort = nextBalance !== null && nextBalance < 0;
  const isBalanceReady = !member || balance.isSuccess;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (adjust.isPending) return;
    setIsSubmitted(true);
    if (Object.keys(validate({ member, pnt, memoCn })).length > 0) return;
    if (!isBalanceReady || isBalanceShort) return;
    adjust.mutate(
      { mbrSn: member.mbrSn, dlngPnt, memoCn: memoCn.trim() },
      {
        onSuccess: () => {
          showToast(
            `${member.mbrNcnm} 님 포인트를 ${direction === 'take' ? '차감' : '지급'}했어요`,
          );
          onClose();
        },
      },
    );
  };

  const renderBalance = () => {
    if (!member) return null;
    if (balance.isPending) {
      return <p className="text-sm text-subtle">잔액을 불러오는 중이에요</p>;
    }
    if (balance.isError) {
      return (
        <p role="alert" className="text-sm text-danger">
          잔액을 불러오지 못해 조정할 수 없어요.
        </p>
      );
    }
    return (
      <dl className="flex flex-wrap gap-x-8 gap-y-2 rounded-[10px] bg-surface-2 px-4 py-3 text-base">
        <div className="flex gap-2">
          <dt className="text-ink-2">현재 잔액</dt>
          <dd className="font-semibold text-ink tabular-nums">
            {balance.data.toLocaleString()}P
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-ink-2">조정 후 잔액</dt>
          <dd
            className={`font-semibold tabular-nums ${isBalanceShort ? 'text-danger' : 'text-ink'}`}
          >
            {nextBalance.toLocaleString()}P
          </dd>
        </div>
      </dl>
    );
  };

  return (
    <Modal
      title="포인트 조정"
      isWide
      isPending={adjust.isPending}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className={BTN_SECONDARY}
            disabled={adjust.isPending}
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="submit"
            form={formId}
            className={BTN_PRIMARY}
            disabled={adjust.isPending || isBalanceShort}
          >
            저장
          </button>
        </>
      }
    >
      <form
        id={formId}
        noValidate
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <MemberPicker
          id={`${formId}-member`}
          member={member}
          error={errors.member}
          onSelect={setMember}
        />
        <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
          <fieldset>
            <legend className={LABEL_CLASS}>구분</legend>
            <div className="flex h-10 overflow-hidden rounded-[6px] border border-[#d3dae2]">
              {DIRECTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={direction === value}
                  className={`w-20 text-base leading-[1.3] ${direction === value ? 'bg-brand-500 font-semibold text-white' : 'bg-white text-ink-2 hover:bg-surface-2'}`}
                  onClick={() => setDirection(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="w-[200px]">
            <label htmlFor={`${formId}-pnt`} className={LABEL_CLASS}>
              포인트
            </label>
            <div className="flex items-center gap-2">
              <input
                id={`${formId}-pnt`}
                type="text"
                inputMode="numeric"
                value={pnt}
                aria-invalid={Boolean(errors.pnt)}
                aria-describedby={`${formId}-pnt-error`}
                className={INPUT_CLASS}
                onChange={(event) => setPnt(event.target.value)}
              />
              <span className="shrink-0 text-base text-ink-2">P</span>
            </div>
            <FieldError id={`${formId}-pnt-error`} message={errors.pnt} />
          </div>
        </div>
        <div>
          <label htmlFor={`${formId}-memo`} className={LABEL_CLASS}>
            사유
          </label>
          <textarea
            id={`${formId}-memo`}
            rows={3}
            maxLength={MEMO_CN_MAX}
            value={memoCn}
            placeholder="회원 포인트 내역에는 '관리자 조정'으로 보여요"
            aria-invalid={Boolean(errors.memoCn)}
            aria-describedby={`${formId}-memo-error`}
            className={`${INPUT_CLASS} h-auto resize-none py-2 leading-[24px]`}
            onChange={(event) => setMemoCn(event.target.value)}
          />
          <div className="flex justify-between gap-2">
            <FieldError id={`${formId}-memo-error`} message={errors.memoCn} />
            <p className="mt-1.5 ml-auto text-sm text-subtle tabular-nums">
              {memoCn.length}/{MEMO_CN_MAX}
            </p>
          </div>
        </div>
        {renderBalance()}
        {isBalanceShort && (
          <p role="alert" className="text-sm text-danger">
            차감 후 잔액이 0보다 작아져 저장할 수 없어요.
          </p>
        )}
        {adjust.isError && (
          <p role="alert" className="text-sm text-danger">
            {adjust.error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}
