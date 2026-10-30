import { Cat, Dog, ImagePlus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '@/components/Modal';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { PATHS } from '@/routes/paths';
import { useCreateCharacter } from '../queries';
import { COLR_DRCT_INPT, COLR_OPTIONS, PET_SE } from '../shared/petCodes';

/** 반려동물 등록 정보에서 읽기 전용으로 보여 줄 털색 */
const getColrNm = (pet) => {
  if (pet.colrCd === COLR_DRCT_INPT) return pet.colrDrctInptNm;
  return COLR_OPTIONS[pet.petSeCd]?.find((c) => c.code === pet.colrCd)?.name;
};

/**
 * [캐릭터 만들기 모달 1~3단계] (FN-MYP-010-08~10·12)
 * - 1 사진 첨부 → 2 생성 중 → 3 결과 확인, 생성 실패면 4 실패 안내
 * - 2단계에서 닫아도 생성은 계속되고(useCreateCharacter), 완료되면 목록 카드에 반영
 */
export default function CharacterCreateModal({ pet, onClose }) {
  const [step, setStep] = useState('photo');
  const [photo, setPhoto] = useState(null);
  const { mutate } = useCreateCharacter();

  const colrNm = getColrNm(pet);

  const handleCreate = () => {
    setStep('creating');
    mutate(
      {
        petSn: pet.petSn,
        photo,
        colrCd: pet.colrCd,
        ...(pet.colrCd === COLR_DRCT_INPT && {
          colrDrctInptNm: pet.colrDrctInptNm,
        }),
      },
      {
        onSuccess: () => setStep('done'),
        onError: () => setStep('fail'),
      },
    );
  };

  if (step === 'done') {
    return (
      <Modal
        isConfirm
        title={`${pet.petNm}의 캐릭터가 완성됐어요`}
        description="캐릭터는 한 번만 만들 수 있어요"
        onClose={onClose}
        footer={
          <>
            <Link
              to={PATHS.INQUIRY_NEW}
              state={{
                inquiryType: 'PIXEL_CHARACTER',
                petSn: pet.petSn,
                imageUrl: pet.chrcImgUrl,
              }}
              className={BTN_SECONDARY}
            >
              오류 문의
            </Link>
            <button type="button" onClick={onClose} className={BTN_PRIMARY}>
              확인
            </button>
          </>
        }
      >
        <ResultImage petSeCd={pet.petSeCd} />
      </Modal>
    );
  }

  if (step === 'fail') {
    return (
      <Modal
        isConfirm
        title="캐릭터를 만들지 못했어요"
        description="종별 기본 캐릭터로 보여 드려요. 잠시 뒤 다시 시도해 주세요"
        onClose={onClose}
        footer={
          <button type="button" onClick={onClose} className={BTN_PRIMARY}>
            확인
          </button>
        }
      >
        <ResultImage petSeCd={pet.petSeCd} muted />
      </Modal>
    );
  }

  if (step === 'creating') {
    return (
      <Modal title={`${pet.petNm}의 캐릭터 만들기`} onClose={onClose}>
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="mb-3 grid size-48 max-w-full place-items-center rounded-xl bg-surface-2 shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
            <span
              aria-hidden="true"
              className="size-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500"
            />
          </div>
          <p className="text-lg font-bold">
            {pet.petNm}의 캐릭터를 만들고 있어요
          </p>
          <p className="text-muted">
            창을 닫아도 캐릭터는 계속 만들어져요
            <br />
            완료되면 알림으로 알려드릴게요
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={`${pet.petNm}의 캐릭터 만들기`}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>
            취소
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!photo}
            className={BTN_PRIMARY}
          >
            만들기
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="char-photo"
            className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed border-line-strong p-6 text-center text-muted hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600"
          >
            <ImagePlus className="size-9 text-line-strong" aria-hidden="true" />
            <b className="font-semibold">{photo ? photo.name : '사진 첨부'}</b>
            <input
              id="char-photo"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => setPhoto(event.target.files[0] ?? null)}
            />
          </label>
          <p className="text-sm text-muted">
            귀·꼬리·발이 모두 보이는 사진을 올려주세요
          </p>
        </div>
        <dl className="flex flex-col gap-1 rounded-xl bg-surface-2 px-5 pt-5 pb-4">
          <Row label="품종" value={pet.vrtyNm ?? pet.vrtyDrctInptNm} />
          <Row label="털색" value={colrNm} />
          <Row label="특징" value={pet.chrcCn} />
        </dl>
      </div>
    </Modal>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-4">
      <dt className="w-10 shrink-0 text-subtle">{label}</dt>
      <dd>{value || '-'}</dd>
    </div>
  );
}

function ResultImage({ petSeCd, muted = false }) {
  const Icon = petSeCd === PET_SE.CAT ? Cat : Dog;
  return (
    <div
      className={`mx-auto mt-4 grid size-48 max-w-full place-items-center rounded-xl bg-brand-50 text-brand-500 ${
        muted ? 'opacity-55 grayscale' : ''
      }`}
    >
      <Icon className="size-24" aria-hidden="true" />
    </div>
  );
}
