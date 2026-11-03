import { useId, useRef, useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import { showToast } from '@/components/toastStore';
import Toggle from '@/components/Toggle';
import {
  useCreateAdminNotificationTemplate,
  useUpdateAdminNotificationTemplate,
} from './queries';

const INPUT_CLASS =
  'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)] aria-invalid:border-danger';
const TEXTAREA_CLASS =
  'block min-h-[200px] w-full resize-y rounded-[6px] border border-[#d3dae2] bg-white px-3 py-2 text-base leading-[1.6] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)] aria-invalid:border-danger';
const CHIP_CLASS =
  'inline-flex h-8 items-center rounded-md border border-line bg-surface-2 px-2.5 text-sm text-ink-2 hover:border-line-strong';

/** 제목·본문 최대 글자 수(NOTI_TMPLT 컬럼 길이) */
const MAX_TTL_LENGTH = 200;
const MAX_CN_LENGTH = 4000;

/** 치환 변수: 서버 발송 코드가 {{이름}}을 값으로 바꾼다(지금은 케어 일정 기준, 모든 유형에 같은 목록) */
const VARIABLES = [
  '{{닉네임}}',
  '{{반려동물명}}',
  '{{검진유형}}',
  '{{병원명}}',
  '{{일정일}}',
  '{{시간}}',
  '{{D-N}}',
  '{{캘린더링크}}',
];

/** 칸 아래 안내 */
function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-danger">
      {message}
    </p>
  );
}

/** 칸마다 빠졌거나 긴 값 안내: 없으면 빈 객체 */
const validate = ({ notiTtl, notiCn }) => ({
  ...(!notiTtl.trim()
    ? { notiTtl: '제목을 입력해 주세요' }
    : notiTtl.length > MAX_TTL_LENGTH
      ? { notiTtl: `제목은 ${MAX_TTL_LENGTH}자 이하로 입력해 주세요` }
      : {}),
  ...(!notiCn.trim()
    ? { notiCn: '본문을 입력해 주세요' }
    : notiCn.length > MAX_CN_LENGTH
      ? {
          notiCn: `본문은 ${MAX_CN_LENGTH.toLocaleString()}자 이하로 입력해 주세요`,
        }
      : {}),
});

/**
 * [알림 템플릿 등록·수정 모달]
 * - row: { type, channel, template }. template이 있으면 수정, 없으면 그 유형·채널로 등록
 * - 유형·채널은 읽기 전용(유형 × 채널당 1개)
 * - 치환 변수를 누르면 마지막으로 누른 칸(처음엔 본문)의 커서 자리에 넣는다
 * - 사용을 끄면 그 알림은 기본 문구로 보낸다
 */
export default function TemplateFormModal({ row, onClose }) {
  const formId = useId();
  const { type, channel, template } = row;
  const isEdit = Boolean(template);

  const [notiTtl, setNotiTtl] = useState(template?.notiTtl ?? '');
  const [notiCn, setNotiCn] = useState(template?.notiCn ?? '');
  const [isUsed, setIsUsed] = useState(template ? template.useYn : true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const ttlRef = useRef(null);
  const cnRef = useRef(null);
  /** 변수를 넣을 칸: 'notiTtl' | 'notiCn' */
  const targetRef = useRef('notiCn');

  const create = useCreateAdminNotificationTemplate();
  const update = useUpdateAdminNotificationTemplate();
  const save = isEdit ? update : create;

  const errors = isSubmitted ? validate({ notiTtl, notiCn }) : {};

  const handleInsert = (variable) => {
    const isTitle = targetRef.current === 'notiTtl';
    const element = isTitle ? ttlRef.current : cnRef.current;
    const value = isTitle ? notiTtl : notiCn;
    const start = element.selectionStart ?? value.length;
    const end = element.selectionEnd ?? value.length;
    const next = value.slice(0, start) + variable + value.slice(end);
    (isTitle ? setNotiTtl : setNotiCn)(next);
    const caret = start + variable.length;
    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(caret, caret);
    });
  };

  const handleSaved = () => {
    showToast(isEdit ? '템플릿을 수정했어요' : '템플릿을 등록했어요');
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (save.isPending) return;
    setIsSubmitted(true);
    if (Object.keys(validate({ notiTtl, notiCn })).length > 0) return;
    const body = {
      notiTtl: notiTtl.trim(),
      notiCn,
      useYn: isUsed,
    };
    if (isEdit) {
      update.mutate(
        { notiTmpltSn: template.notiTmpltSn, ...body },
        { onSuccess: handleSaved },
      );
      return;
    }
    create.mutate(
      { notiTypeCd: type.comCd, notiChnlCd: channel.comCd, ...body },
      { onSuccess: handleSaved },
    );
  };

  return (
    <Modal
      title={isEdit ? '템플릿 수정' : '템플릿 등록'}
      isWide
      isTop
      isPending={save.isPending}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className={BTN_SECONDARY}
            disabled={save.isPending}
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="submit"
            form={formId}
            className={BTN_PRIMARY}
            disabled={save.isPending}
          >
            {isEdit ? '저장' : '등록'}
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
        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-base">
          <div className="flex gap-2">
            <dt className="font-semibold text-ink-2">알림 유형</dt>
            <dd className="text-ink">{type.comCdNm}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold text-ink-2">채널</dt>
            <dd className="text-ink">{channel.comCdNm}</dd>
          </div>
        </dl>
        <div>
          <label
            htmlFor={`${formId}-notiTtl`}
            className="mb-1.5 block text-sm font-semibold text-ink-2"
          >
            제목
          </label>
          <input
            ref={ttlRef}
            id={`${formId}-notiTtl`}
            type="text"
            value={notiTtl}
            maxLength={MAX_TTL_LENGTH}
            placeholder="제목을 입력해 주세요"
            aria-invalid={Boolean(errors.notiTtl)}
            aria-describedby={`${formId}-notiTtl-error`}
            className={INPUT_CLASS}
            onFocus={() => {
              targetRef.current = 'notiTtl';
            }}
            onChange={(event) => setNotiTtl(event.target.value)}
          />
          <FieldError id={`${formId}-notiTtl-error`} message={errors.notiTtl} />
        </div>
        <div>
          <label
            htmlFor={`${formId}-notiCn`}
            className="mb-1.5 block text-sm font-semibold text-ink-2"
          >
            본문
          </label>
          <textarea
            ref={cnRef}
            id={`${formId}-notiCn`}
            value={notiCn}
            maxLength={MAX_CN_LENGTH}
            placeholder="본문을 입력해 주세요"
            aria-invalid={Boolean(errors.notiCn)}
            aria-describedby={`${formId}-notiCn-error`}
            className={TEXTAREA_CLASS}
            onFocus={() => {
              targetRef.current = 'notiCn';
            }}
            onChange={(event) => setNotiCn(event.target.value)}
          />
          <FieldError id={`${formId}-notiCn-error`} message={errors.notiCn} />
        </div>
        <div>
          <p
            id={`${formId}-variables`}
            className="mb-1.5 text-sm font-semibold text-ink-2"
          >
            치환 변수
          </p>
          <p className="mb-2 text-sm text-subtle">
            누르면 마지막으로 누른 칸의 커서 자리에 들어가요
          </p>
          <div
            role="group"
            aria-labelledby={`${formId}-variables`}
            className="flex flex-wrap gap-2"
          >
            {VARIABLES.map((variable) => (
              <button
                key={variable}
                type="button"
                className={CHIP_CLASS}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleInsert(variable)}
              >
                {variable}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-sm font-semibold text-ink-2">사용</p>
          <div className="flex h-10 items-center gap-3">
            <Toggle checked={isUsed} onChange={setIsUsed} label="사용" />
            <span className="text-sm text-subtle">
              {isUsed ? '사용' : '미사용 (기본 문구로 보내요)'}
            </span>
          </div>
        </div>
        {save.isError && (
          <p role="alert" className="text-sm text-danger">
            {save.error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}
