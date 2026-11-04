import { Pencil, User } from 'lucide-react';
import { useId } from 'react';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import { showToast } from '@/components/toastStore';
import { useUpdateProfileImage } from '../queries';

/** 기본 정보 맨 위 프로필 요약: 사진·닉네임·계정 표시(children)와 사진 변경 버튼 */
export default function ProfileImageField({ prflImgUrl, mbrNcnm, children }) {
  const fileId = useId();
  const { mutate, isPending } = useUpdateProfileImage();

  const handleError = (error) =>
    showToast(
      error.code === 'FILE_TYPE_NOT_ALLOWED' || error.code === 'FILE_TOO_LARGE'
        ? 'jpg·png·webp 이미지, 10MB 이하만 올릴 수 있어요'
        : '사진을 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.',
    );

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('jpg·png·webp 이미지, 10MB 이하만 올릴 수 있어요');
      return;
    }
    mutate({ file }, { onError: handleError });
  };

  return (
    <div className="flex flex-wrap items-center gap-5 px-5 py-5 sm:px-8 sm:py-7 max-[760px]:gap-4">
      <div className="relative shrink-0">
        <span className="grid size-[76px] place-items-center overflow-hidden rounded-full bg-surface-3 text-subtle">
          {prflImgUrl ? (
            <img
              src={prflImgUrl}
              alt="프로필 사진"
              className="size-full object-cover"
            />
          ) : (
            <User className="size-9" />
          )}
        </span>
        <label
          htmlFor={fileId}
          aria-hidden="true"
          className="absolute -right-0.5 -bottom-0.5 grid size-7 cursor-pointer place-items-center rounded-full border-2 border-white bg-ink-2 text-white has-focus-visible:ring-focus"
        >
          <Pencil className="size-3.5" />
        </label>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-bold">{mbrNcnm}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-muted">
          {children}
        </p>
      </div>
      <div className="flex items-center gap-2 max-sm:w-full">
        <label
          htmlFor={fileId}
          className={`${BTN_SECONDARY} cursor-pointer has-focus-visible:ring-focus ${
            isPending ? 'pointer-events-none opacity-60' : ''
          }`}
        >
          사진 변경
        </label>
        <input
          id={fileId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFile}
          className="sr-only"
        />
        <button
          type="button"
          disabled={!prflImgUrl || isPending}
          onClick={() => mutate({ file: null }, { onError: handleError })}
          className="inline-flex h-10 items-center rounded-md px-4 font-semibold text-muted hover:enabled:bg-surface-2 hover:enabled:text-ink disabled:cursor-not-allowed disabled:text-line-strong"
        >
          기본 이미지로
        </button>
      </div>
    </div>
  );
}
