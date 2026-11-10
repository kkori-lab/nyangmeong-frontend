import { useId, useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import ConfirmModal from '@/components/ConfirmModal';
import Modal from '@/components/Modal';
import Select from '@/components/Select';
import { showToast } from '@/components/toastStore';
import Toggle from '@/components/Toggle';
import { pickJosa } from '@/utils/josa';
import {
  useAdminAiRoutes,
  useCreateAdminAiRoute,
  useDeleteAdminAiRoute,
  useUpdateAdminAiRoute,
} from './queries';
import {
  INST_KWRD_CN_MAX,
  MVMN_MTHD,
  MVMN_MTHD_OPTIONS,
  RMRK_CN_MAX,
  SCREEN_OPTIONS,
  SCRN_ID_MAX,
  SCRN_PARAM_CN_MAX,
  TRGT_SCRN_NM_MAX,
  isRoutable,
  splitKeywords,
} from './routeLabels';
import { findDuplicates } from './routeOverlap';

const INPUT_CLASS =
  'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)] aria-invalid:border-danger';
const TEXTAREA_CLASS = `${INPUT_CLASS} h-auto resize-none py-2 leading-[24px]`;
const LABEL_CLASS = 'mb-1.5 block text-sm font-semibold text-ink-2';

const SCREEN_SELECT_OPTIONS = [
  { value: '', label: '화면 선택' },
  ...SCREEN_OPTIONS,
];
const SCREEN_IDS = new Set(SCREEN_OPTIONS.map((option) => option.value));

const SAVED_MESSAGE = '저장했습니다. 다음 요청부터 반영됩니다';

/** 1 이상 정수 */
const POSITIVE_INT_PATTERN = /^[1-9]\d*$/;

/** 칸마다 틀린 값 안내: 없으면 빈 객체 */
const validate = ({
  trgtScrnNm,
  mvmnMthdCd,
  scrnId,
  scrnParamCn,
  instKwrdCn,
  prrtSeq,
  maxSeq,
}) => {
  const errors = {};
  const seq = prrtSeq.trim();
  if (!POSITIVE_INT_PATTERN.test(seq)) {
    errors.prrtSeq =
      maxSeq == null
        ? '순서는 1 이상 정수로 입력해 주세요'
        : `순서는 1~${maxSeq} 사이 정수로 입력해 주세요`;
  } else if (maxSeq != null && Number(seq) > maxSeq) {
    errors.prrtSeq = `순서는 1~${maxSeq} 사이 정수로 입력해 주세요`;
  }
  const routable = isRoutable(mvmnMthdCd);
  if (!trgtScrnNm.trim()) errors.trgtScrnNm = '대상 화면명을 입력해 주세요';
  if (routable && !SCREEN_IDS.has(scrnId)) {
    errors.scrnId = '이동할 화면을 골라 주세요';
  }
  const param = scrnParamCn.trim();
  if (param && !param.startsWith('?')) {
    errors.scrnParamCn = '파라미터는 ?로 시작해 주세요 (예: ?cat=hospital)';
  }
  if (routable && splitKeywords(instKwrdCn).length === 0) {
    errors.instKwrdCn = '지시어를 1개 이상 입력해 주세요';
  }
  return errors;
};

/** 칸 아래 안내 */
function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-danger">
      {message}
    </p>
  );
}

/** 다른 행과 겹치는 지시어 경고: 저장은 막지 않는다 */
function DuplicateWarning({ duplicates }) {
  if (duplicates.length === 0) return null;
  const shown = duplicates.slice(0, 3);
  return (
    <div
      role="status"
      className="mt-2 rounded-[8px] border border-warn-line bg-warn-soft px-3 py-2 text-sm leading-[22px] text-warn"
    >
      <ul>
        {shown.map(({ keyword, route }) => (
          <li key={`${keyword}-${route.aiRoutMpngSn}`}>
            '{keyword}'{pickJosa(keyword, '은/는')} '{route.trgtScrnNm}'에도
            있어요
          </li>
        ))}
      </ul>
      {duplicates.length > shown.length && (
        <p>그 밖에 {duplicates.length - shown.length}건 더 겹쳐요</p>
      )}
      <p>같은 지시어는 순서 숫자가 작은 행이 먼저 걸려요</p>
    </div>
  );
}

/** 글자 수 */
function CharCount({ value, max }) {
  return (
    <p className="mt-1.5 ml-auto shrink-0 text-sm text-subtle tabular-nums">
      {value.length}/{max}
    </p>
  );
}

/**
 * [매핑 등록·수정 모달]
 * - route가 없으면 등록, 있으면 수정 + [삭제](확인 모달)
 * - 화면 이동·모달 열기면 화면 ID(선택)·지시어 필수, 대상 아님·제외면 화면 ID는 메모처럼 자유 입력
 * - 지시어는 쉼표로 나눠 적는다. 다른 행과 같은 지시어가 있으면 경고만 한다(전체 매핑표 기준)
 * - 같은 지시어일 때 순서(prrtSeq): 1~행 수(등록은 행 수+1, 기본값은 맨 아래). 저장하면 그 자리에 넣고 나머지를 한 칸씩 민다
 * - [저장]을 누르면 칸마다 검사하고, 저장하면 토스트 후 닫음. 실패하면 입력 유지 + 서버 문구
 */
export default function AiRouteFormModal({ route, onClose }) {
  const formId = useId();
  const isEdit = route != null;
  const [trgtScrnNm, setTrgtScrnNm] = useState(route?.trgtScrnNm ?? '');
  const [mvmnMthdCd, setMvmnMthdCd] = useState(
    route?.mvmnMthdCd ?? MVMN_MTHD.PAGE,
  );
  const [scrnId, setScrnId] = useState(route?.scrnId ?? '');
  const [scrnParamCn, setScrnParamCn] = useState(route?.scrnParamCn ?? '');
  const [instKwrdCn, setInstKwrdCn] = useState(route?.instKwrdCn ?? '');
  const [isChip, setIsChip] = useState(route?.rprsChipYn === true);
  const [isUsed, setIsUsed] = useState(route ? route.useYn : true);
  const [rmrkCn, setRmrkCn] = useState(route?.rmrkCn ?? '');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  /** 겹침 검사·순서 범위는 검색과 상관없이 전체 매핑표로 */
  const allRoutes = useAdminAiRoutes({});
  const routeCount = allRoutes.data?.length;
  const maxSeq = routeCount == null ? null : routeCount + (isEdit ? 0 : 1);
  const [prrtSeq, setPrrtSeq] = useState(
    isEdit ? String(route.prrtSeq) : routeCount == null ? '' : String(maxSeq),
  );
  /** 등록 모달을 연 뒤에 행 수가 오면 기본값을 맨 아래로 */
  const [isSeqTouched, setIsSeqTouched] = useState(false);
  const shownSeq =
    !isEdit && !isSeqTouched && !prrtSeq && maxSeq != null
      ? String(maxSeq)
      : prrtSeq;

  const create = useCreateAdminAiRoute();
  const update = useUpdateAdminAiRoute();
  const remove = useDeleteAdminAiRoute();
  const save = isEdit ? update : create;
  const isPending = save.isPending || remove.isPending;

  const values = {
    trgtScrnNm,
    mvmnMthdCd,
    scrnId,
    scrnParamCn,
    instKwrdCn,
    prrtSeq: shownSeq,
    maxSeq,
  };
  const duplicates = findDuplicates(
    instKwrdCn,
    allRoutes.data ?? [],
    route?.aiRoutMpngSn,
  );
  const errors = isSubmitted ? validate(values) : {};
  const routable = isRoutable(mvmnMthdCd);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isPending) return;
    setIsSubmitted(true);
    if (Object.keys(validate(values)).length > 0) return;
    // 빈 칸: 수정은 ''를 보내야 서버가 비운다(null은 그대로 둠), 등록은 null
    const empty = isEdit ? '' : null;
    const body = {
      trgtScrnNm: trgtScrnNm.trim(),
      scrnId: scrnId.trim() || empty,
      scrnParamCn: scrnParamCn.trim() || empty,
      instKwrdCn: splitKeywords(instKwrdCn).join(', ') || empty,
      mvmnMthdCd,
      rprsChipYn: isChip,
      rmrkCn: rmrkCn.trim() || empty,
      useYn: isUsed,
      prrtSeq: Number(shownSeq.trim()),
    };
    save.mutate(isEdit ? { aiRoutMpngSn: route.aiRoutMpngSn, ...body } : body, {
      onSuccess: () => {
        showToast(SAVED_MESSAGE);
        onClose();
      },
    });
  };

  const handleDelete = () => {
    remove.mutate(route.aiRoutMpngSn, {
      onSuccess: () => {
        showToast('삭제했습니다. 다음 요청부터 반영됩니다');
        onClose();
      },
    });
  };

  const handleDeleteCancel = () => {
    remove.reset();
    setIsDeleting(false);
  };

  return (
    <>
      <Modal
        title={isEdit ? '매핑 수정' : '매핑 등록'}
        isWide
        isPending={isPending}
        onClose={onClose}
        footer={
          <>
            {isEdit && (
              <button
                type="button"
                className={`${BTN_SECONDARY} mr-auto text-danger`}
                disabled={isPending}
                onClick={() => setIsDeleting(true)}
              >
                삭제
              </button>
            )}
            <button
              type="button"
              className={BTN_SECONDARY}
              disabled={isPending}
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="submit"
              form={formId}
              className={BTN_PRIMARY}
              disabled={isPending}
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
          <div>
            <label htmlFor={`${formId}-name`} className={LABEL_CLASS}>
              대상 화면명
            </label>
            <input
              id={`${formId}-name`}
              type="text"
              maxLength={TRGT_SCRN_NM_MAX}
              value={trgtScrnNm}
              placeholder="예: 플레이스 병원 화면"
              aria-invalid={Boolean(errors.trgtScrnNm)}
              aria-describedby={`${formId}-name-error`}
              className={INPUT_CLASS}
              onChange={(event) => setTrgtScrnNm(event.target.value)}
            />
            <FieldError
              id={`${formId}-name-error`}
              message={errors.trgtScrnNm}
            />
          </div>

          <div className="grid grid-cols-[180px_1fr] gap-4 max-[560px]:grid-cols-1">
            <div>
              <p className={LABEL_CLASS}>이동 방식</p>
              <Select
                label="이동 방식"
                value={mvmnMthdCd}
                options={MVMN_MTHD_OPTIONS}
                onChange={setMvmnMthdCd}
              />
            </div>
            <div>
              {routable ? (
                <>
                  <p className={LABEL_CLASS}>화면 ID</p>
                  <Select
                    label="화면 ID"
                    value={SCREEN_IDS.has(scrnId) ? scrnId : ''}
                    options={SCREEN_SELECT_OPTIONS}
                    placeholder="이동할 화면을 골라 주세요"
                    onChange={setScrnId}
                  />
                </>
              ) : (
                <>
                  <label htmlFor={`${formId}-scrnId`} className={LABEL_CLASS}>
                    화면 ID (선택)
                  </label>
                  <input
                    id={`${formId}-scrnId`}
                    type="text"
                    maxLength={SCRN_ID_MAX}
                    value={scrnId}
                    placeholder="예: SCR-HLT-005"
                    className={INPUT_CLASS}
                    onChange={(event) => setScrnId(event.target.value)}
                  />
                </>
              )}
              <FieldError
                id={`${formId}-scrnId-error`}
                message={errors.scrnId}
              />
            </div>
          </div>

          <div>
            <label htmlFor={`${formId}-param`} className={LABEL_CLASS}>
              파라미터 (선택)
            </label>
            <input
              id={`${formId}-param`}
              type="text"
              maxLength={SCRN_PARAM_CN_MAX}
              value={scrnParamCn}
              placeholder="예: ?cat=hospital"
              aria-invalid={Boolean(errors.scrnParamCn)}
              aria-describedby={`${formId}-param-error`}
              className={INPUT_CLASS}
              onChange={(event) => setScrnParamCn(event.target.value)}
            />
            <FieldError
              id={`${formId}-param-error`}
              message={errors.scrnParamCn}
            />
          </div>

          <div>
            <label htmlFor={`${formId}-keywords`} className={LABEL_CLASS}>
              지시어{routable ? '' : ' (선택)'}
            </label>
            <textarea
              id={`${formId}-keywords`}
              rows={3}
              maxLength={INST_KWRD_CN_MAX}
              value={instKwrdCn}
              placeholder="쉼표로 나눠 적어요 (예: 병원, 동물병원, 진료)"
              aria-invalid={Boolean(errors.instKwrdCn)}
              aria-describedby={`${formId}-keywords-error`}
              className={TEXTAREA_CLASS}
              onChange={(event) => setInstKwrdCn(event.target.value)}
            />
            <div className="flex justify-between gap-2">
              <FieldError
                id={`${formId}-keywords-error`}
                message={errors.instKwrdCn}
              />
              <CharCount value={instKwrdCn} max={INST_KWRD_CN_MAX} />
            </div>
            <DuplicateWarning duplicates={duplicates} />
          </div>

          <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
            <div className="w-[200px]">
              <label htmlFor={`${formId}-seq`} className={LABEL_CLASS}>
                같은 지시어일 때 순서
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={`${formId}-seq`}
                  type="text"
                  inputMode="numeric"
                  value={shownSeq}
                  aria-invalid={Boolean(errors.prrtSeq)}
                  aria-describedby={`${formId}-seq-help ${formId}-seq-error`}
                  className={INPUT_CLASS}
                  onChange={(event) => {
                    setIsSeqTouched(true);
                    setPrrtSeq(event.target.value);
                  }}
                />
              </div>
              {maxSeq != null && (
                <p
                  id={`${formId}-seq-help`}
                  className="mt-1.5 text-sm text-subtle"
                >
                  1~{maxSeq} · 숫자가 작을수록 먼저
                </p>
              )}
              <FieldError id={`${formId}-seq-error`} message={errors.prrtSeq} />
            </div>
            <div>
              <p className={LABEL_CLASS}>대표 칩</p>
              <div className="flex h-10 items-center gap-3">
                <Toggle checked={isChip} onChange={setIsChip} label="대표 칩" />
                <span className="text-sm text-subtle">
                  {isChip ? '대화창 칩에 보임' : '칩 아님'}
                </span>
              </div>
            </div>
            <div>
              <p className={LABEL_CLASS}>사용</p>
              <div className="flex h-10 items-center gap-3">
                <Toggle checked={isUsed} onChange={setIsUsed} label="사용" />
                <span className="text-sm text-subtle">
                  {isUsed ? '사용' : '미사용'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor={`${formId}-memo`} className={LABEL_CLASS}>
              비고 (선택)
            </label>
            <textarea
              id={`${formId}-memo`}
              rows={2}
              maxLength={RMRK_CN_MAX}
              value={rmrkCn}
              className={TEXTAREA_CLASS}
              onChange={(event) => setRmrkCn(event.target.value)}
            />
          </div>

          <p className="text-sm leading-[22px] text-subtle">
            저장하면 AI 대화창의 다음 요청부터 반영돼요. 공백은 빼고 비교하고,
            가장 길게 일치한 지시어가 먼저예요. 길이가 같으면 같은 지시어일 때
            순서가 작은 행이 먼저예요.
          </p>
          {save.isError && (
            <p role="alert" className="text-sm text-danger">
              {save.error.message}
            </p>
          )}
        </form>
      </Modal>
      {isDeleting && (
        <ConfirmModal
          title="매핑을 삭제할까요?"
          description={`'${route.trgtScrnNm}' 행이 매핑표에서 빠져요. 다음 요청부터 이 지시어로는 이동하지 않아요.`}
          confirmLabel="삭제"
          isPending={remove.isPending}
          errorMessage={remove.isError ? remove.error.message : undefined}
          onConfirm={handleDelete}
          onCancel={handleDeleteCancel}
        />
      )}
    </>
  );
}
