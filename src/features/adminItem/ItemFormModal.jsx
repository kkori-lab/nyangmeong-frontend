import { ImagePlus } from 'lucide-react';
import { useId, useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import Select from '@/components/Select';
import { showToast } from '@/components/toastStore';
import Toggle from '@/components/Toggle';
import { toFieldErrors, toFormError } from '@/utils/fieldErrors';
import {
  RECEIPT_ACCEPT,
  RECEIPT_HELP,
  validateReceiptFile,
} from '@/utils/receiptFile';
import { ItemImage } from './ItemTable';
import { useCreateAdminItem, useUpdateAdminItem } from './queries';

const INPUT_CLASS =
  'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)] aria-invalid:border-danger';

const TEXTAREA_CLASS = INPUT_CLASS.replace(
  'h-10',
  'min-h-[88px] resize-y py-2',
).replace('leading-[1.4]', 'leading-6');

/** 굽기 지시 최대 글자 수(서버와 같음) */
const BAKE_HINT_MAX = 300;

/** 필요 포인트: 0 이상 정수 */
const NEED_PNT_PATTERN = /^\d+$/;

/** 폼 칸(서버 fields 이름) */
const FORM_FIELDS = ['itemRegnCd', 'itemNm', 'image', 'bakeHint', 'needPnt'];

/** 칸 아래 안내 */
function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-danger">
      {message}
    </p>
  );
}

/** 칸마다 빠졌거나 틀린 값 안내: 없으면 빈 객체 */
const validate = ({ itemRegnCd, itemNm, needPnt, image, isEdit }) => ({
  ...(itemRegnCd ? {} : { itemRegnCd: '부위를 골라 주세요' }),
  ...(itemNm.trim() ? {} : { itemNm: '이름을 입력해 주세요' }),
  ...(NEED_PNT_PATTERN.test(needPnt.trim())
    ? {}
    : { needPnt: '포인트는 0 이상 정수로 입력해 주세요' }),
  ...(image || isEdit ? {} : { image: '이미지를 골라 주세요' }),
});

/**
 * [아이템 등록·수정 모달]
 * - item이 있으면 그 행 값으로 채운 수정, 없으면 등록
 * - 삭제는 없고 판매를 끄면 판매 중지: 이미 산 회원의 아이템은 남음
 * - [등록]·[저장]을 누르면 칸마다 검사하고, 저장하면 토스트 후 닫음. 실패하면 입력 유지 + 서버 문구
 * - 등록 성공 뒤 onCreated({ itemSn, ...보낸 값 }): 화면이 전체 굽기를 시작할지 정함
 */
export default function ItemFormModal({ item, parts, onClose, onCreated }) {
  const formId = useId();
  const isEdit = Boolean(item);

  const [itemRegnCd, setItemRegnCd] = useState(item?.itemRegnCd ?? '');
  const [itemNm, setItemNm] = useState(item?.itemNm ?? '');
  const [needPnt, setNeedPnt] = useState(item ? String(item.needPnt) : '');
  const [ntslYn, setNtslYn] = useState(item?.ntslYn ?? true);
  const [bakeHint, setBakeHint] = useState(item?.bakeHint ?? '');
  /** 새로 고른 이미지: { file, url } */
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const create = useCreateAdminItem();
  const update = useUpdateAdminItem();
  const save = isEdit ? update : create;

  const clientErrors = isSubmitted
    ? validate({ itemRegnCd, itemNm, needPnt, image, isEdit })
    : {};
  // 400 칸별 오류: 클라이언트 안내가 없는 칸에만 서버 문구
  const serverFieldErrors = toFieldErrors(save.error);
  const errors = Object.fromEntries(
    FORM_FIELDS.map((field) => [
      field,
      clientErrors[field] ?? serverFieldErrors[field],
    ]),
  );
  const formError = toFormError(save.error, FORM_FIELDS);
  const imageMessage = imageError || errors.image;

  const partOptions = [
    { value: '', label: '부위 선택' },
    ...parts.map(({ comCd, comCdNm }) => ({ value: comCd, label: comCdNm })),
  ];

  const handleImageChange = async (event) => {
    const [file] = event.target.files;
    event.target.value = '';
    if (!file) return;
    const reason = await validateReceiptFile(file);
    if (reason) {
      setImageError(reason);
      return;
    }
    setImageError('');
    setImage({ file, url: URL.createObjectURL(file) });
  };

  const handleSaved = () => {
    showToast(isEdit ? '아이템을 수정했어요' : '아이템을 등록했어요');
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (save.isPending) return;
    setIsSubmitted(true);
    const nextErrors = validate({ itemRegnCd, itemNm, needPnt, image, isEdit });
    if (Object.keys(nextErrors).length > 0) return;
    const body = {
      itemRegnCd,
      itemNm: itemNm.trim(),
      needPnt: Number(needPnt.trim()),
      ntslYn,
      /** 수정에서 비우면 빈 값을 보내 지움 */
      bakeHint: bakeHint.trim(),
      ...(image ? { image: image.file } : {}),
    };
    if (isEdit) {
      update.mutate(
        { itemSn: item.itemSn, ...body },
        { onSuccess: handleSaved },
      );
      return;
    }
    create.mutate(body, {
      onSuccess: ({ itemSn }) => {
        handleSaved();
        onCreated?.({ itemSn, ...body });
      },
    });
  };

  return (
    <Modal
      title={isEdit ? '아이템 수정' : '아이템 등록'}
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
        <div>
          <p className="mb-1.5 text-sm font-semibold text-ink-2">부위</p>
          <Select
            label="부위"
            value={itemRegnCd}
            options={partOptions}
            placeholder="부위 선택"
            onChange={setItemRegnCd}
          />
          <FieldError message={errors.itemRegnCd} />
        </div>
        <div>
          <label
            htmlFor={`${formId}-itemNm`}
            className="mb-1.5 block text-sm font-semibold text-ink-2"
          >
            이름
          </label>
          <input
            id={`${formId}-itemNm`}
            type="text"
            value={itemNm}
            placeholder="아이템 이름을 입력해 주세요"
            aria-invalid={Boolean(errors.itemNm)}
            aria-describedby={`${formId}-itemNm-error`}
            className={INPUT_CLASS}
            onChange={(event) => setItemNm(event.target.value)}
          />
          <FieldError id={`${formId}-itemNm-error`} message={errors.itemNm} />
        </div>
        <div>
          <p className="mb-1.5 text-sm font-semibold text-ink-2">이미지</p>
          <div className="flex items-center gap-4">
            {image ? (
              <img
                src={image.url}
                alt="고른 이미지 미리보기"
                className="size-20 rounded-[6px] bg-surface-2 object-contain"
              />
            ) : (
              isEdit && (
                <ItemImage item={item} className="size-20 bg-surface-2" />
              )
            )}
            <div>
              <label
                htmlFor={`${formId}-image`}
                className={`${BTN_SECONDARY} cursor-pointer gap-1.5`}
              >
                <ImagePlus className="size-4" aria-hidden="true" />
                {image || isEdit ? '이미지 바꾸기' : '이미지 고르기'}
              </label>
              <input
                id={`${formId}-image`}
                type="file"
                accept={RECEIPT_ACCEPT}
                className="sr-only"
                onChange={handleImageChange}
              />
              <p className="mt-1.5 text-sm text-subtle">{RECEIPT_HELP}</p>
            </div>
          </div>
          <FieldError message={imageMessage} />
        </div>
        <div>
          <label
            htmlFor={`${formId}-bakeHint`}
            className="mb-1.5 block text-sm font-semibold text-ink-2"
          >
            굽기 지시 <span className="font-normal text-subtle">(선택)</span>
          </label>
          <textarea
            id={`${formId}-bakeHint`}
            value={bakeHint}
            maxLength={BAKE_HINT_MAX}
            rows={3}
            placeholder="예: Place the hat on top of the head."
            aria-invalid={Boolean(errors.bakeHint)}
            aria-describedby={`${formId}-bakeHint-help ${formId}-bakeHint-error`}
            className={TEXTAREA_CLASS}
            onChange={(event) => setBakeHint(event.target.value)}
          />
          <p
            id={`${formId}-bakeHint-help`}
            className="mt-1.5 flex justify-between gap-3 text-sm text-subtle"
          >
            <span>AI가 이미지를 캐릭터에 입힐 때 쓰는 영어 한 문장</span>
            <span aria-hidden="true">
              {bakeHint.length}/{BAKE_HINT_MAX}
            </span>
          </p>
          <FieldError
            id={`${formId}-bakeHint-error`}
            message={errors.bakeHint}
          />
        </div>
        <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
          <div className="w-[160px]">
            <label
              htmlFor={`${formId}-needPnt`}
              className="mb-1.5 block text-sm font-semibold text-ink-2"
            >
              필요 포인트
            </label>
            <input
              id={`${formId}-needPnt`}
              type="text"
              inputMode="numeric"
              value={needPnt}
              placeholder="0 이상 숫자"
              aria-invalid={Boolean(errors.needPnt)}
              aria-describedby={`${formId}-needPnt-error`}
              className={INPUT_CLASS}
              onChange={(event) => setNeedPnt(event.target.value)}
            />
            <FieldError
              id={`${formId}-needPnt-error`}
              message={errors.needPnt}
            />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-semibold text-ink-2">판매</p>
            <div className="flex h-10 items-center gap-3">
              <Toggle checked={ntslYn} onChange={setNtslYn} label="판매" />
              <span className="text-sm text-subtle">
                {ntslYn ? '판매' : '중지'}
              </span>
            </div>
          </div>
        </div>
        {isEdit && (
          <p className="text-sm text-subtle">
            판매를 멈춰도 이미 산 회원의 아이템은 남아요
          </p>
        )}
        {formError && (
          <p role="alert" className="text-sm text-danger">
            {formError}
          </p>
        )}
      </form>
    </Modal>
  );
}
