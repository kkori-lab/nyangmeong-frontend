import { useId, useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import ConfirmModal from '@/components/ConfirmModal';
import Modal from '@/components/Modal';
import Select from '@/components/Select';
import { showToast } from '@/components/toastStore';
import {
  ARTCL_NM_MAX,
  INTRP_RSLT_CN_MAX,
  KWRD_CN_MAX,
  RMRK_CN_MAX,
  codeResult,
  splitKeywords,
} from './keywordLabels';
import {
  useCreateAdminAiKeyword,
  useDeleteAdminAiKeyword,
  useUpdateAdminAiKeyword,
} from './queries';

const INPUT_CLASS =
  'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)] aria-invalid:border-danger';
const TEXTAREA_CLASS = `${INPUT_CLASS} h-auto resize-none py-2 leading-[24px]`;
const LABEL_CLASS = 'mb-1.5 block text-sm font-semibold text-ink-2';

const SAVED_MESSAGE = '저장했습니다. 다음 요청부터 반영됩니다';

const tooLong = (max) => `${max}자 이하로 입력해 주세요`;

/** 칸마다 틀린 값 안내: 없으면 빈 객체 */
const validate = ({ tab, artclNm, kwrdCn, intrpRsltCn, mpngCd, rmrkCn }) => {
  const errors = {};
  if (!artclNm.trim()) errors.artclNm = '항목명을 입력해 주세요';
  else if (artclNm.trim().length > ARTCL_NM_MAX) {
    errors.artclNm = tooLong(ARTCL_NM_MAX);
  }
  const joined = splitKeywords(kwrdCn).join(', ');
  if (!joined) errors.kwrdCn = '키워드를 하나 이상 입력해 주세요';
  else if (joined.length > KWRD_CN_MAX) errors.kwrdCn = tooLong(KWRD_CN_MAX);
  if (tab.codes != null && !mpngCd) errors.mpngCd = '연결할 코드를 골라 주세요';
  if (tab.codes == null && intrpRsltCn.trim().length > INTRP_RSLT_CN_MAX) {
    errors.intrpRsltCn = tooLong(INTRP_RSLT_CN_MAX);
  }
  if (rmrkCn.trim().length > RMRK_CN_MAX) errors.rmrkCn = tooLong(RMRK_CN_MAX);
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

/** 칸 아래 줄: 오류(왼쪽) + 글자 수(오른쪽) */
function FieldFoot({ id, message, value, max }) {
  return (
    <div className="flex justify-between gap-2">
      <FieldError id={id} message={message} />
      <p
        className={`mt-1.5 ml-auto shrink-0 text-sm tabular-nums ${
          value.length > max ? 'text-danger' : 'text-subtle'
        }`}
      >
        {value.length}/{max}
      </p>
    </div>
  );
}

/**
 * [키워드 등록·수정 모달]
 * - keyword가 없으면 tab에 등록, 있으면 수정 + [삭제](확인 모달)
 * - 키워드는 쉼표로 나눠 적는다
 * - 결과가 코드인 탭은 연결 코드 필수, 해석 결과는 코드 이름으로 채운다("일정 종류 = 병원(HLTG19)")
 * - [저장]을 누르면 칸마다 검사하고, 틀리면 요청을 보내지 않는다. 저장하면 토스트 후 닫음
 */
export default function AiKeywordFormModal({ tab, keyword, onClose }) {
  const formId = useId();
  const isEdit = keyword != null;
  const hasCode = tab.codes != null;
  const [artclNm, setArtclNm] = useState(keyword?.artclNm ?? '');
  const [kwrdCn, setKwrdCn] = useState(keyword?.kwrdCn ?? '');
  const [intrpRsltCn, setIntrpRsltCn] = useState(keyword?.intrpRsltCn ?? '');
  const [mpngCd, setMpngCd] = useState(keyword?.mpngCd ?? '');
  const [rmrkCn, setRmrkCn] = useState(keyword?.rmrkCn ?? '');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const create = useCreateAdminAiKeyword();
  const update = useUpdateAdminAiKeyword();
  const remove = useDeleteAdminAiKeyword();
  const save = isEdit ? update : create;
  const isPending = save.isPending || remove.isPending;

  const values = { tab, artclNm, kwrdCn, intrpRsltCn, mpngCd, rmrkCn };
  const errors = isSubmitted ? validate(values) : {};

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isPending) return;
    setIsSubmitted(true);
    if (Object.keys(validate(values)).length > 0) return;
    const body = {
      artclNm: artclNm.trim(),
      kwrdCn: splitKeywords(kwrdCn).join(', '),
      intrpRsltCn: hasCode
        ? codeResult(tab, mpngCd)
        : intrpRsltCn.trim() || null,
      mpngCd: hasCode ? mpngCd : null,
      rmrkCn: rmrkCn.trim() || null,
    };
    const payload = isEdit
      ? { kwrdDictSn: keyword.kwrdDictSn, ...body }
      : { dictUsgCd: tab.dictUsgCd, kwrdClsfNm: tab.label, ...body };
    save.mutate(payload, {
      onSuccess: () => {
        showToast(SAVED_MESSAGE);
        onClose();
      },
    });
  };

  const handleDelete = () => {
    remove.mutate(keyword.kwrdDictSn, {
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
        title={isEdit ? '키워드 수정' : '키워드 등록'}
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
            <p className={LABEL_CLASS}>용도</p>
            <p className="text-base leading-[24px] text-ink-2">{tab.label}</p>
          </div>

          <div>
            <label htmlFor={`${formId}-name`} className={LABEL_CLASS}>
              항목명
            </label>
            <input
              id={`${formId}-name`}
              type="text"
              value={artclNm}
              placeholder="예: 상대 날짜"
              aria-invalid={Boolean(errors.artclNm)}
              aria-describedby={`${formId}-name-error`}
              className={INPUT_CLASS}
              onChange={(event) => setArtclNm(event.target.value)}
            />
            <FieldFoot
              id={`${formId}-name-error`}
              message={errors.artclNm}
              value={artclNm.trim()}
              max={ARTCL_NM_MAX}
            />
          </div>

          <div>
            <label htmlFor={`${formId}-keywords`} className={LABEL_CLASS}>
              키워드
            </label>
            <textarea
              id={`${formId}-keywords`}
              rows={3}
              value={kwrdCn}
              placeholder="쉼표로 나눠 적어요 (예: 병원, 동물병원, 진료)"
              aria-invalid={Boolean(errors.kwrdCn)}
              aria-describedby={`${formId}-keywords-error`}
              className={TEXTAREA_CLASS}
              onChange={(event) => setKwrdCn(event.target.value)}
            />
            <FieldFoot
              id={`${formId}-keywords-error`}
              message={errors.kwrdCn}
              value={splitKeywords(kwrdCn).join(', ')}
              max={KWRD_CN_MAX}
            />
          </div>

          {hasCode ? (
            <div className="max-w-[320px]">
              <p className={LABEL_CLASS}>연결 코드</p>
              <Select
                label="연결 코드"
                value={mpngCd}
                options={[
                  { value: '', label: '코드 선택' },
                  ...tab.codes.map((code) => ({
                    value: code.value,
                    label: `${code.value} ${code.label}`,
                  })),
                ]}
                placeholder="연결할 코드를 골라 주세요"
                onChange={setMpngCd}
              />
              <FieldError id={`${formId}-code-error`} message={errors.mpngCd} />
            </div>
          ) : (
            <div>
              <label htmlFor={`${formId}-result`} className={LABEL_CLASS}>
                해석 결과 (선택)
              </label>
              <input
                id={`${formId}-result`}
                type="text"
                value={intrpRsltCn}
                placeholder="예: 날짜(오늘 KST 기준 계산)"
                aria-invalid={Boolean(errors.intrpRsltCn)}
                aria-describedby={`${formId}-result-error`}
                className={INPUT_CLASS}
                onChange={(event) => setIntrpRsltCn(event.target.value)}
              />
              <FieldFoot
                id={`${formId}-result-error`}
                message={errors.intrpRsltCn}
                value={intrpRsltCn.trim()}
                max={INTRP_RSLT_CN_MAX}
              />
            </div>
          )}

          <div>
            <label htmlFor={`${formId}-memo`} className={LABEL_CLASS}>
              비고 (선택)
            </label>
            <textarea
              id={`${formId}-memo`}
              rows={2}
              value={rmrkCn}
              aria-invalid={Boolean(errors.rmrkCn)}
              aria-describedby={`${formId}-memo-error`}
              className={TEXTAREA_CLASS}
              onChange={(event) => setRmrkCn(event.target.value)}
            />
            <FieldFoot
              id={`${formId}-memo-error`}
              message={errors.rmrkCn}
              value={rmrkCn.trim()}
              max={RMRK_CN_MAX}
            />
          </div>

          <p className="text-sm leading-[22px] text-subtle">
            저장하면 AI 대화창의 다음 요청부터 반영돼요.
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
          title="키워드를 삭제할까요?"
          description={`'${keyword.artclNm}' 행이 사전에서 빠져요. 다음 요청부터 이 키워드로는 판정하지 않아요.`}
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
