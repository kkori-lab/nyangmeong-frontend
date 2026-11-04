import { useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import ConfirmModal from '@/components/ConfirmModal';
import Select from '@/components/Select';
import { showToast } from '@/components/toastStore';
import { PATHS } from '@/routes/paths';
import { TRMS_CN_MAX, TRMS_TTL_MAX, TRMS_VER_ID_MAX } from './api';
import { useCreateAdminTerm } from './queries';
import {
  TERMS_KINDS,
  TERMS_REAGREE_GUIDE,
  getTermsKindName,
} from './termsKinds';

const INPUT_CLASS =
  'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)] aria-invalid:border-danger';
const TEXTAREA_CLASS =
  'block min-h-[360px] w-full resize-y rounded-[6px] border border-[#d3dae2] bg-white px-3 py-2 text-base leading-6 text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)] aria-invalid:border-danger';

const KIND_OPTIONS = [
  { value: '', label: '약관 종류' },
  ...TERMS_KINDS.map(({ trmsFixIdntfKey, name }) => ({
    value: trmsFixIdntfKey,
    label: name,
  })),
];

/** 칸 아래 안내(빈 값·서버 오류) */
function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-danger">
      {message}
    </p>
  );
}

/** 칸 이름 + 글자 수 */
function FieldLabel({ htmlFor, label, length, maxLength }) {
  return (
    <div className="mb-1.5 flex items-center justify-between">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink-2">
        {label}
      </label>
      {maxLength != null && (
        <span className="text-sm text-subtle tabular-nums">
          {length.toLocaleString()}/{maxLength.toLocaleString()}
        </span>
      )}
    </div>
  );
}

/** 필수·선택 라디오 */
function EsntlOption({ name, checked, onChange, children }) {
  return (
    <label className="flex min-h-8 cursor-pointer items-center gap-2 font-medium text-ink">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="size-4 accent-brand-500"
      />
      {children}
    </label>
  );
}

/**
 * [약관 새 버전 등록 폼]
 * - initialKind: ?trmsFixIdntfKey=로 미리 고른 종류(없으면 빈 값)
 * - currentByKind: 종류 키 -> 사용 중 버전 행. 종류를 고르면 현재 버전 안내와 필수 여부 기본값에 씀
 * - 빈 칸은 손댄 뒤나 [등록]을 누른 뒤 칸 아래 안내, 다 채워야 [등록]
 * - [등록] -> 확인 모달 "이전 버전은 더 쓰지 않아요" -> 등록 -> 목록(완료 안내는 목록에서)
 * - 같은 버전이 있으면(DUPLICATE_TRMS_VER) 모달을 닫고 버전 칸 아래 서버 문구
 * - 입력값 오류(400 fields)도 모달을 닫고 칸 아래 서버 문구, 그 밖 오류는 폼 아래 서버 문구
 */
export default function TermsVersionForm({ initialKind, currentByKind }) {
  const formId = useId();
  const navigate = useNavigate();
  const create = useCreateAdminTerm();

  const getDefaultEsntl = (kind) =>
    currentByKind.get(kind)?.esntlAgreYn ?? true;

  const [trmsFixIdntfKey, setTrmsFixIdntfKey] = useState(initialKind);
  const [trmsVerId, setTrmsVerId] = useState('');
  const [trmsTtl, setTrmsTtl] = useState(
    currentByKind.get(initialKind)?.trmsTtl ?? '',
  );
  const [trmsCn, setTrmsCn] = useState('');
  const [esntlAgreYn, setEsntlAgreYn] = useState(getDefaultEsntl(initialKind));
  /** 빈 칸 안내를 보일 칸 */
  const [touched, setTouched] = useState({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const current = currentByKind.get(trmsFixIdntfKey);
  const values = {
    trmsFixIdntfKey,
    trmsVerId: trmsVerId.trim(),
    trmsTtl: trmsTtl.trim(),
    trmsCn: trmsCn.trim() ? trmsCn : '',
  };
  const emptyMessages = {
    trmsFixIdntfKey: '약관 종류를 골라 주세요',
    trmsVerId: '버전을 입력해 주세요',
    trmsTtl: '제목을 입력해 주세요',
    trmsCn: '내용을 입력해 주세요',
  };
  const serverFieldErrors = new Map(
    (create.error?.fields ?? []).map((item) => [item.field, item.message]),
  );
  const getError = (field) =>
    touched[field] && !values[field]
      ? emptyMessages[field]
      : (serverFieldErrors.get(field) ?? null);
  const isFilled = Object.keys(emptyMessages).every((field) => values[field]);
  const duplicateMessage =
    create.error?.code === 'DUPLICATE_TRMS_VER' ? create.error.message : null;

  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleKindChange = (nextKind) => {
    setTrmsFixIdntfKey(nextKind);
    touch('trmsFixIdntfKey');
    setEsntlAgreYn(getDefaultEsntl(nextKind));
    if (!trmsTtl.trim()) setTrmsTtl(currentByKind.get(nextKind)?.trmsTtl ?? '');
    create.reset();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched({
      trmsFixIdntfKey: true,
      trmsVerId: true,
      trmsTtl: true,
      trmsCn: true,
    });
    if (!isFilled || create.isPending) return;
    create.reset();
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    create.mutate(
      { ...values, esntlAgreYn },
      {
        onSuccess: (saved) => {
          showToast('새 버전을 등록했어요');
          navigate(PATHS.ADMIN_TERMS, {
            state: { registeredTerms: saved },
          });
        },
        onError: (error) => {
          if (error?.code === 'DUPLICATE_TRMS_VER' || error?.fields) {
            setIsConfirmOpen(false);
          }
        },
      },
    );
  };

  const handleConfirmCancel = () => setIsConfirmOpen(false);

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="space-y-5 rounded-[14px] border border-line bg-white p-6 max-[760px]:p-4"
    >
      <div>
        <p className="mb-1.5 text-sm font-semibold text-ink-2">약관 종류</p>
        <Select
          label="약관 종류"
          value={trmsFixIdntfKey}
          options={KIND_OPTIONS}
          placeholder="약관 종류를 골라 주세요"
          className="w-[280px] max-[760px]:w-full"
          onChange={handleKindChange}
        />
        <FieldError
          id={`${formId}-kind-error`}
          message={getError('trmsFixIdntfKey')}
        />
        {current && (
          <p className="mt-1.5 text-sm text-subtle">
            지금 쓰는 버전은 {current.trmsVerId}예요
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-start gap-x-8 gap-y-5">
        <div className="w-[200px] max-[760px]:w-full">
          <FieldLabel htmlFor={`${formId}-ver`} label="버전" />
          <input
            id={`${formId}-ver`}
            type="text"
            value={trmsVerId}
            maxLength={TRMS_VER_ID_MAX}
            placeholder="예: v1.3"
            aria-invalid={Boolean(getError('trmsVerId') || duplicateMessage)}
            aria-describedby={`${formId}-ver-error`}
            className={INPUT_CLASS}
            onChange={(event) => {
              setTrmsVerId(event.target.value);
              if (duplicateMessage) create.reset();
            }}
            onBlur={() => touch('trmsVerId')}
          />
          <FieldError
            id={`${formId}-ver-error`}
            message={getError('trmsVerId') ?? duplicateMessage}
          />
        </div>
        <div>
          <p className="mb-1.5 text-sm font-semibold text-ink-2">필수 여부</p>
          <div className="flex h-10 items-center gap-5">
            <EsntlOption
              name={`${formId}-esntl`}
              checked={esntlAgreYn}
              onChange={() => setEsntlAgreYn(true)}
            >
              필수
            </EsntlOption>
            <EsntlOption
              name={`${formId}-esntl`}
              checked={!esntlAgreYn}
              onChange={() => setEsntlAgreYn(false)}
            >
              선택
            </EsntlOption>
          </div>
        </div>
      </div>
      <div>
        <FieldLabel
          htmlFor={`${formId}-ttl`}
          label="제목"
          length={trmsTtl.length}
          maxLength={TRMS_TTL_MAX}
        />
        <input
          id={`${formId}-ttl`}
          type="text"
          value={trmsTtl}
          maxLength={TRMS_TTL_MAX}
          placeholder="회원 화면에 보이는 약관 제목"
          aria-invalid={Boolean(getError('trmsTtl'))}
          aria-describedby={`${formId}-ttl-error`}
          className={INPUT_CLASS}
          onChange={(event) => setTrmsTtl(event.target.value)}
          onBlur={() => touch('trmsTtl')}
        />
        <FieldError id={`${formId}-ttl-error`} message={getError('trmsTtl')} />
      </div>
      <div>
        <FieldLabel
          htmlFor={`${formId}-cn`}
          label="내용"
          length={trmsCn.length}
          maxLength={TRMS_CN_MAX}
        />
        <textarea
          id={`${formId}-cn`}
          value={trmsCn}
          maxLength={TRMS_CN_MAX}
          placeholder="약관 전문을 입력해 주세요"
          aria-invalid={Boolean(getError('trmsCn'))}
          aria-describedby={`${formId}-cn-error`}
          className={TEXTAREA_CLASS}
          onChange={(event) => setTrmsCn(event.target.value)}
          onBlur={() => touch('trmsCn')}
        />
        <FieldError id={`${formId}-cn-error`} message={getError('trmsCn')} />
      </div>
      <p className="rounded-[10px] bg-surface-2 px-4 py-3 text-sm leading-[22px] text-subtle">
        {TERMS_REAGREE_GUIDE}
      </p>
      {create.isError &&
        !duplicateMessage &&
        !create.error.fields &&
        !isConfirmOpen && (
          <p role="alert" className="text-sm text-danger">
            {create.error.message}
          </p>
        )}
      <div className="flex justify-end gap-2 max-[760px]:[&>*]:flex-1">
        <Link to={PATHS.ADMIN_TERMS} className={BTN_SECONDARY}>
          취소
        </Link>
        <button
          type="submit"
          className={BTN_PRIMARY}
          disabled={!isFilled || create.isPending}
        >
          등록
        </button>
      </div>
      {isConfirmOpen && (
        <ConfirmModal
          title={`${getTermsKindName(trmsFixIdntfKey)} ${values.trmsVerId} 등록`}
          description={
            current
              ? `이전 버전은 더 쓰지 않아요. 지금 쓰는 ${current.trmsVerId}는 사용 안 함으로 바뀌어요.`
              : '이전 버전은 더 쓰지 않아요.'
          }
          confirmLabel="등록"
          errorMessage={create.isError ? create.error.message : null}
          isPending={create.isPending}
          onConfirm={handleConfirm}
          onCancel={handleConfirmCancel}
        />
      )}
    </form>
  );
}
