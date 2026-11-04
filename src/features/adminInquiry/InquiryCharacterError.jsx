import { ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import ConfirmModal from '@/components/ConfirmModal';
import Skeleton from '@/components/Skeleton';
import { showToast } from '@/components/toastStore';
import { CHARACTER_ERROR_OPTIONS } from './inquiryLabels';
import { useProcessAdminInquiryCharacterError } from './queries';

/** 접수 시점 캐릭터: 받는 중 undefined, 실패 null */
function CharacterImage({ url }) {
  const className = 'size-40 rounded-[10px] border border-line';
  if (url === undefined) return <Skeleton className={className} />;
  if (!url) {
    return (
      <span
        role="img"
        aria-label="접수 시점 캐릭터를 불러오지 못했어요"
        className={`grid place-items-center bg-surface-2 text-line-strong ${className}`}
      >
        <ImageIcon className="size-8" aria-hidden="true" />
      </span>
    );
  }
  return (
    <img
      src={url}
      alt="접수 시점 캐릭터"
      className={`bg-surface-2 object-contain [image-rendering:pixelated] ${className}`}
    />
  );
}

/**
 * [캐릭터 오류 처리]
 * - 픽셀 캐릭터 문의만: 접수 시점 캐릭터 + [무료 재생성]/[원래 캐릭터 복원] -> 확인 뒤 실행
 * - 처리한 뒤나 회원이 삭제한 문의는 결과만, 버튼 없음
 * - imageUrl: 접수 시점 캐릭터 이미지 주소(첨부 이미지와 같은 주소 묶음)
 */
export default function InquiryCharacterError({ inquiry, imageUrl }) {
  const [selected, setSelected] = useState(null);
  const process = useProcessAdminInquiryCharacterError();

  const isProcessed = inquiry.charErrPrcsRsltCd != null;
  const canProcess =
    !isProcessed && !inquiry.delYn && inquiry.pixelCharSn != null;

  const handleOpen = (option) => {
    process.reset();
    setSelected(option);
  };

  const handleConfirm = () =>
    process.mutate(
      {
        otoInqrySn: inquiry.otoInqrySn,
        charErrPrcsRsltCd: selected.value,
      },
      {
        onSuccess: () => {
          setSelected(null);
          showToast(`${selected.label}을 실행했어요`);
        },
      },
    );

  const renderStatus = () => {
    if (isProcessed) {
      return (
        <p className="text-base text-ink-2">
          처리 결과:{' '}
          <span className="font-semibold">
            {inquiry.charErrPrcsRsltCdNm ?? inquiry.charErrPrcsRsltCd}
          </span>
        </p>
      );
    }
    if (inquiry.delYn) {
      return <p className="text-base text-subtle">회원이 삭제한 문의예요</p>;
    }
    if (inquiry.pixelCharSn == null) {
      return (
        <p className="text-base text-subtle">
          처리할 캐릭터가 연결되지 않은 문의예요
        </p>
      );
    }
    return (
      <p className="text-base text-subtle">
        오류가 맞으면 무료 재생성, 아니면 원래 캐릭터를 복원해 주세요
      </p>
    );
  };

  return (
    <section className="flex gap-4 rounded-[14px] border border-line bg-white p-4 max-[760px]:flex-col">
      {inquiry.charImgAtchFileSn != null && <CharacterImage url={imageUrl} />}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        {renderStatus()}
        {canProcess && (
          <div className="flex flex-wrap justify-end gap-2">
            {CHARACTER_ERROR_OPTIONS.map((option, index) => (
              <button
                key={option.value}
                type="button"
                className={`${index === 0 ? BTN_PRIMARY : BTN_SECONDARY} max-[760px]:flex-1`}
                onClick={() => handleOpen(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {selected && (
        <ConfirmModal
          title={`${selected.label}을 실행할까요?`}
          description={selected.description}
          confirmLabel={selected.label}
          errorMessage={process.isError ? process.error.message : undefined}
          isPending={process.isPending}
          onConfirm={handleConfirm}
          onCancel={() => setSelected(null)}
        />
      )}
    </section>
  );
}
