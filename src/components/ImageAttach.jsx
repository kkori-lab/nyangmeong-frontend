import { CircleAlert, ImageIcon, ImagePlus, X } from 'lucide-react';
import { useId, useState } from 'react';
import { RECEIPT_ACCEPT, validateReceiptFile } from '@/utils/receiptFile';

export const MAX_IMAGES = 10;

/**
 * 이미지 첨부: images는 [{ id, name, url, file }], 최대 10장, jpg·png·webp, 한 장 10MB
 * - file: 방금 고른 원본 File. 서버에 업로드용
 * - 서버에서 받아 온 첨부는 file 없이 url도 null일 수 있다(받는 중이거나 실패): 이름만 있는 자리 표시
 * - hint: 안내 문구 위에 덧붙일 한 줄(선택)
 * - 형식·용량 검사는 영수증 업로드와 같은 validateReceiptFile 사용
 * - 미리보기 주소(blob:)는 삭제해도 해제 안 함
 */
export default function ImageAttach({ images, onChange, hint }) {
  const inputId = useId();
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const isFull = images.length >= MAX_IMAGES;

  const addFiles = async (fileList) => {
    const files = Array.from(fileList);
    const accepted = [];
    let nextError = '';
    for (const file of files) {
      if (images.length + accepted.length >= MAX_IMAGES) {
        nextError = `이미지는 최대 ${MAX_IMAGES}장까지 올릴 수 있어요`;
        break;
      }
      const reason = await validateReceiptFile(file);
      if (reason) {
        nextError = reason;
        continue;
      }
      accepted.push({
        id: crypto.randomUUID(),
        name: file.name,
        url: URL.createObjectURL(file),
        file,
      });
    }
    setErrorMessage(nextError);
    if (accepted.length > 0) onChange([...images, ...accepted]);
  };

  const handleInputChange = (event) => {
    addFiles(event.target.files);
    /** 같은 파일을 재선택을 위해 비움 */
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const handleRemove = (id) => {
    setErrorMessage('');
    onChange(images.filter((image) => image.id !== id));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-base leading-[1.4] font-semibold text-[#1a3234]">
          이미지 첨부
        </span>
        <span className="text-sm text-[#667374]">
          {images.length} / {MAX_IMAGES}
        </span>
      </div>

      <ul className="grid grid-cols-[repeat(6,minmax(0,148px))] items-start gap-x-3 gap-y-4 max-[760px]:grid-cols-3 max-[760px]:gap-2">
        {/** 10장이 차면 추가 칸은 사라지지 않고 비활성으로 남고, 한 장을 지우면 다시 활성 */}
        <li>
          <label
            htmlFor={inputId}
            aria-disabled={isFull}
            onDragOver={
              isFull
                ? undefined
                : (event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }
            }
            onDragLeave={isFull ? undefined : () => setIsDragging(false)}
            onDrop={isFull ? undefined : handleDrop}
            className={`relative flex aspect-square flex-col items-center justify-center gap-1 overflow-hidden rounded-[10px] border border-dashed text-sm font-medium has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#285a5c] ${
              isFull
                ? 'cursor-not-allowed border-[#d3dae2] bg-[#f4f6f6] text-[#b9c4c4]'
                : isDragging
                  ? 'cursor-pointer border-[#285a5c] bg-[#e9f2f2] text-[#1e4a4c]'
                  : 'cursor-pointer border-[#b9c4c4] bg-[#f4f6f6] text-[#566465] hover:border-[#285a5c] hover:bg-[#e9f2f2] hover:text-[#1e4a4c]'
            }`}
          >
            <input
              id={inputId}
              type="file"
              accept={RECEIPT_ACCEPT}
              multiple
              disabled={isFull}
              onChange={handleInputChange}
              className="absolute size-px opacity-0"
            />
            <ImagePlus size={28} aria-hidden="true" />
            <b className="font-semibold">이미지 추가</b>
          </label>
        </li>
        {images.map((image) => (
          <li key={image.id} className="flex min-w-0 flex-col gap-1.5">
            <div className="group relative aspect-square overflow-hidden rounded-[10px] border border-[#e2e7e7] bg-[#eef1f1]">
              {image.url ? (
                <img
                  src={image.url}
                  alt={image.name}
                  className="size-full object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="grid size-full place-items-center text-[#b9c4c4]"
                >
                  <ImageIcon size={32} />
                </span>
              )}
              <button
                type="button"
                aria-label={`${image.name} 삭제`}
                onClick={() => handleRemove(image.id)}
                className="absolute top-1 right-1 flex size-8 cursor-pointer items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-[760px]:top-0 max-[760px]:right-0 max-[760px]:size-10 max-[760px]:opacity-100 [@media(hover:none)]:opacity-100"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-[rgba(15,23,35,0.62)] text-white hover:bg-[#1a3234]">
                  <X size={16} aria-hidden="true" />
                </span>
              </button>
            </div>
            <span className="truncate text-sm leading-[1.4] text-[#566465]">
              {image.name}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-sm leading-normal text-[#566465]">
        {hint && (
          <span className="mb-0.5 block font-medium text-[#2f6f57]">
            {hint}
          </span>
        )}
        최대 10장(JPG · PNG · WEBP), 한 장에 10MB까지 올릴 수 있어요.
      </p>
      {errorMessage && (
        <p
          role="alert"
          className="flex items-center gap-1 text-sm text-[#b4473a]"
        >
          <CircleAlert size={14} aria-hidden="true" />
          {errorMessage}
        </p>
      )}
    </div>
  );
}
