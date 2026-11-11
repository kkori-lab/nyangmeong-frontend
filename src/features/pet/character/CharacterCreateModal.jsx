import { Cat, Dog, ImagePlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '@/components/Modal';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { showToast } from '@/components/toastStore';
import { useCharacterImage } from '@/hooks/useCharacterImage';
import { PATHS } from '@/routes/paths';
import { getColrName } from '@/utils/petFormat';
import { useCreateCharacter } from '../queries';
import { CHRC_STTS, PET_SE } from '../shared/petCodes';

const PHOTO_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const PHOTO_MAX_BYTES = 10 * 1024 * 1024;
const MSG_PHOTO_TYPE = 'jpg, png, webp 사진만 올릴 수 있어요';
const MSG_PHOTO_SIZE = '10MB 이하 사진만 올릴 수 있어요';

/** 선택한 사진이 올릴 수 있는지: 문제가 있으면 안내 문구, 없으면 null */
const getPhotoError = (file) => {
  const ext = file.name.split('.').pop().toLowerCase();
  if (!PHOTO_EXTENSIONS.includes(ext)) return MSG_PHOTO_TYPE;
  if (file.size > PHOTO_MAX_BYTES) return MSG_PHOTO_SIZE;
  return null;
};

/**
 * [캐릭터 만들기 모달 1~3단계] (FN-MYP-010-08~10·12·23)
 * - 1 사진 첨부 → 2 생성 중 → 3 결과 확인, 생성 실패면 4 실패 안내
 * - 요청 뒤 단계는 pet(최신 목록의 같은 동물)의 charStatus로 정한다
 * - 2단계에서 닫아도 생성은 계속되고, 완료되면 목록 카드에 반영
 */
export default function CharacterCreateModal({ pet, onClose }) {
  /** photo: 사진 첨부 / sent: 요청 보냄(상태는 pet이 정함) / fail: 요청 자체가 실패 */
  const [phase, setPhase] = useState('photo');
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState(null);
  /** 고른 사진 미리보기 주소: 사진이 바뀌거나 닫히면 해제 */
  const [photoUrl, setPhotoUrl] = useState(null);
  const { mutate, isPending } = useCreateCharacter();
  const characterImage = useCharacterImage(pet.petSn, 'full');

  const colrNm = getColrName(pet);

  useEffect(
    () => () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    },
    [photoUrl],
  );

  const handlePhotoChange = (event) => {
    const file = event.target.files[0] ?? null;
    const nextPhoto = file && !getPhotoError(file) ? file : null;
    setPhoto(nextPhoto);
    setPhotoUrl(nextPhoto ? URL.createObjectURL(nextPhoto) : null);
    setPhotoError(file ? getPhotoError(file) : null);
  };

  const handleCreate = () => {
    mutate(
      { petSn: pet.petSn, photo },
      {
        onSuccess: () => setPhase('sent'),
        onError: (error) => {
          if (error.code === 'FILE_TYPE_NOT_ALLOWED') {
            setPhotoError(MSG_PHOTO_TYPE);
          } else if (error.code === 'FILE_SIZE_EXCEEDED') {
            setPhotoError(MSG_PHOTO_SIZE);
          } else if (
            error.code === 'PIXEL_CHARACTER_CREATING' ||
            error.code === 'PIXEL_CHARACTER_ALREADY_EXISTS'
          ) {
            showToast('이미 캐릭터를 만들었거나 만드는 중이에요');
            onClose();
          } else if (error.code === 'PET_PRIMARY_ONLY') {
            showToast('주양육자만 만들 수 있어요');
            onClose();
          } else {
            setPhase('fail');
          }
        },
      },
    );
  };

  let step = 'photo';
  if (isPending) step = 'creating';
  else if (phase === 'fail') step = 'fail';
  else if (phase === 'sent') {
    if (pet.charStatus === CHRC_STTS.GENERATING) step = 'creating';
    else if (pet.charStatus === CHRC_STTS.DONE && !pet.isCharError)
      step = 'done';
    else step = 'fail';
  }

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
                pixelCharSn: pet.pixelCharSn,
                imageUrl: characterImage,
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
        <ResultImage petSeCd={pet.petSeCd} src={characterImage} />
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
            disabled={!photo || Boolean(photoError)}
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
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="첨부한 사진"
                className="max-h-60 max-w-full rounded-md object-contain"
              />
            ) : (
              <ImagePlus
                className="size-9 text-line-strong"
                aria-hidden="true"
              />
            )}
            <b className="font-semibold">{photo ? photo.name : '사진 첨부'}</b>
            <input
              id="char-photo"
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="sr-only"
              onChange={handlePhotoChange}
            />
          </label>
          {photoError ? (
            <p role="alert" className="text-sm text-danger">
              {photoError}
            </p>
          ) : (
            <p className="text-sm text-muted">
              귀·꼬리·발이 모두 보이는 사진을 올려주세요
            </p>
          )}
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

function ResultImage({ petSeCd, src = null, muted = false }) {
  const Icon = petSeCd === PET_SE.CAT ? Cat : Dog;
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="mx-auto mt-4 size-48 max-w-full rounded-xl bg-brand-50 object-contain"
      />
    );
  }
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
