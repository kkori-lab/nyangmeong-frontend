import { Check, ImagePlus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import {
  RECEIPT_ACCEPT,
  RECEIPT_HELP,
  validateReceiptFile,
} from '@/utils/receiptFile';
import { ItemImage } from './ItemTable';

/** 미리보기 한 칸: 그림 + 아래 이름 */
function Preview({ label, children }) {
  return (
    <figure className="flex flex-col items-center gap-1">
      {children}
      <figcaption className="text-xs text-subtle">{label}</figcaption>
    </figure>
  );
}

const PREVIEW_CLASS = 'size-20 rounded-[6px] bg-surface-2 object-contain';

/**
 * [아이템 이미지 칸: 실사 사진 → 픽셀 그림]
 * - 사진은 픽셀 그림을 만드는 입력으로만 쓰고 등록 이미지로 올리지 않음
 * - [픽셀로 만들기] 전에 onRequireInputs()로 부위·이름을 검사(비면 그 칸 오류를 모달이 보임)
 * - 만든 그림을 [이 그림 쓰기]로 고르면 onImageChange({ file, url }): 등록·수정 이미지가 됨
 * - pixelMake: 모달이 가진 useCreateItemPixelImage 결과(만드는 동안 모달 닫기·저장을 막으려고 모달이 가짐)
 */
export default function ItemPixelImageField({
  formId,
  item,
  itemRegnCd,
  itemNm,
  image,
  message,
  pixelMake,
  onImageChange,
  onRequireInputs,
}) {
  /** 고른 실사 사진: { file, url } */
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState('');
  /** 만든 픽셀 그림(아직 안 골랐을 수 있음): { file, url } */
  const [pixel, setPixel] = useState(null);

  const isMaking = pixelMake.isPending;
  const isPixelChosen = Boolean(pixel) && image?.url === pixel.url;
  const errorMessage = photoError || pixelMake.error?.message || message;

  const handlePhotoChange = async (event) => {
    const [file] = event.target.files;
    event.target.value = '';
    if (!file) return;
    const reason = await validateReceiptFile(file);
    if (reason) {
      setPhotoError(reason);
      return;
    }
    setPhotoError('');
    setPhoto({ file, url: URL.createObjectURL(file) });
    setPixel(null);
    pixelMake.reset();
    onImageChange(null);
  };

  const handleMake = () => {
    if (!photo || isMaking) return;
    if (!onRequireInputs()) return;
    pixelMake.mutate(
      { image: photo.file, regnCd: itemRegnCd, itemNm: itemNm.trim() },
      {
        onSuccess: (blob) => {
          const file = new File([blob], 'pixel-item.png', {
            type: 'image/png',
          });
          setPixel({ file, url: URL.createObjectURL(file) });
          onImageChange(null);
        },
      },
    );
  };

  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-ink-2">이미지</p>
      <div className="flex flex-wrap items-start gap-4">
        {!photo && item && (
          <Preview label="지금 그림">
            <ItemImage item={item} className="size-20 bg-surface-2" />
          </Preview>
        )}
        {photo && (
          <Preview label="실사 사진">
            <img
              src={photo.url}
              alt="고른 실사 사진 미리보기"
              className={PREVIEW_CLASS}
            />
          </Preview>
        )}
        {pixel && (
          <Preview label={isPixelChosen ? '쓸 그림' : '픽셀 그림'}>
            <img
              src={pixel.url}
              alt="만든 픽셀 그림 미리보기"
              className={`${PREVIEW_CLASS} [image-rendering:pixelated] ${
                isPixelChosen ? 'ring-2 ring-[#285a5c]' : ''
              }`}
            />
          </Preview>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <label
              htmlFor={`${formId}-photo`}
              aria-disabled={isMaking}
              className={`${BTN_SECONDARY} gap-1.5 whitespace-nowrap ${
                isMaking ? 'pointer-events-none opacity-50' : 'cursor-pointer'
              }`}
            >
              <ImagePlus className="size-4" aria-hidden="true" />
              {photo ? '사진 바꾸기' : '실사 사진 고르기'}
            </label>
            <input
              id={`${formId}-photo`}
              type="file"
              accept={RECEIPT_ACCEPT}
              disabled={isMaking}
              className="sr-only"
              onChange={handlePhotoChange}
            />
            {photo && (
              <button
                type="button"
                className={`${BTN_SECONDARY} gap-1.5 whitespace-nowrap`}
                disabled={isMaking}
                onClick={handleMake}
              >
                <Sparkles className="size-4" aria-hidden="true" />
                {pixel ? '다시 만들기' : '픽셀로 만들기'}
              </button>
            )}
            {pixel && !isPixelChosen && (
              <button
                type="button"
                className={`${BTN_PRIMARY} gap-1.5 whitespace-nowrap`}
                disabled={isMaking}
                onClick={() => onImageChange(pixel)}
              >
                <Check className="size-4" aria-hidden="true" />이 그림 쓰기
              </button>
            )}
          </div>
          <p className="text-sm text-subtle">
            {RECEIPT_HELP} · 픽셀 그림은 만들 때마다 이미지 1장 비용이 들어요
          </p>
          {isMaking && (
            <p role="status" className="text-sm text-ink-2">
              픽셀 그림을 만드는 중이에요(30~40초)
            </p>
          )}
          {isPixelChosen && (
            <p className="text-sm text-ink-2">
              이 픽셀 그림을 아이템 이미지로 써요
            </p>
          )}
        </div>
      </div>
      {errorMessage && (
        <p className="mt-1.5 text-sm text-danger">{errorMessage}</p>
      )}
    </div>
  );
}
