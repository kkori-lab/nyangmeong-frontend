import { CircleAlert, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { showToast } from '@/components/toastStore';
import { useCaregiversOf, useCreateInvitation } from '../queries';
import { BRUP_ROLE, CGVR_ROLE, MAX_CAREGIVERS } from '@/utils/petCodes';

/**
 * [가족 초대하기 모달]
 * - 이메일 입력(형식 검사만, 상대 조회 없음, [확인] 버튼 없음) + 주양육 동물 다중 선택 -> 초대 1건 발송
 * - 공동양육자 5명이 찬 동물은 선택 불가
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INPUT =
  'block h-10 w-full min-w-0 rounded-md border border-input-line bg-white px-3 placeholder:text-placeholder hover:border-line-strong focus:border-brand-500 focus:ring-focus focus:outline-none aria-invalid:border-danger aria-invalid:focus:ring-error';
const LABEL = 'leading-[1.4] font-semibold';

export default function InviteModal({ pets, initialPetSn, onClose }) {
  const createInvitation = useCreateInvitation();
  const ownPets = pets.filter((pet) => pet.brupRoleCd === BRUP_ROLE.PRIMARY);
  const caregiverResults = useCaregiversOf(ownPets.map((pet) => pet.petSn));

  const [invtEml, setInvtEml] = useState('');
  /** 입력란을 벗어나거나 보내기를 눌러야 형식 오류를 안내 */
  const [isEmailTouched, setIsEmailTouched] = useState(false);
  const [selectedPetSns, setSelectedPetSns] = useState(
    initialPetSn == null ? [] : [initialPetSn],
  );

  /** 동물별 공동양육자 수 (조회 전이면 null) */
  const coParentCounts = Object.fromEntries(
    ownPets.map((pet, index) => {
      const caregivers = caregiverResults[index]?.data;
      return [
        pet.petSn,
        caregivers
          ? caregivers.filter((c) => c.cgvrRoleCd === CGVR_ROLE.CCG).length
          : null,
      ];
    }),
  );
  const isFull = (petSn) => coParentCounts[petSn] >= MAX_CAREGIVERS;
  const pickedPetSns = selectedPetSns.filter(
    (petSn) => coParentCounts[petSn] != null && !isFull(petSn),
  );
  const isEmailValid = EMAIL_PATTERN.test(invtEml.trim());
  const isEmailInvalid = isEmailTouched && !isEmailValid;
  const canSend =
    isEmailValid && pickedPetSns.length > 0 && !createInvitation.isPending;

  const close = () => {
    if (!createInvitation.isPending) onClose();
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  const handleEmailChange = (event) => {
    setInvtEml(event.target.value);
  };

  const handleTogglePet = (petSn) =>
    setSelectedPetSns((prev) =>
      prev.includes(petSn)
        ? prev.filter((sn) => sn !== petSn)
        : [...prev, petSn],
    );

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsEmailTouched(true);
    if (!canSend) return;
    createInvitation.mutate(
      { invtEml: invtEml.trim(), petSns: pickedPetSns },
      {
        onSuccess: () => {
          onClose();
          showToast('초대를 보냈어요');
        },
        onError: () =>
          showToast('초대를 보내지 못했어요. 잠시 후 다시 시도해 주세요'),
      },
    );
  };

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto px-4 py-8">
      <div className="fixed inset-0 bg-[rgba(15,23,35,0.45)]" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-title"
        className="relative m-auto flex w-full max-w-[560px] shrink-0 flex-col rounded-modal bg-white shadow-depth-lg"
      >
        <header className="flex items-start gap-3.5 border-b border-line-strong px-7 pt-4 pb-2">
          <h2 id="invite-title" className="text-xl leading-[1.35] font-bold">
            가족 초대하기
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="닫기"
            className="-mt-1 -mr-2 ml-auto grid size-9 shrink-0 place-items-center rounded-box text-muted hover:bg-surface-3 hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </header>
        <form
          id="invite-form"
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-6 px-7 pt-6 pb-7"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="invite-email" className={LABEL}>
              초대할 상대의 이메일
            </label>
            <input
              id="invite-email"
              type="email"
              value={invtEml}
              onChange={handleEmailChange}
              onBlur={() => invtEml.trim() && setIsEmailTouched(true)}
              placeholder="이메일 주소 입력"
              aria-invalid={isEmailInvalid ? 'true' : undefined}
              aria-describedby={
                isEmailInvalid
                  ? 'invite-email-h invite-email-e'
                  : 'invite-email-h'
              }
              className={INPUT}
            />
            <p id="invite-email-h" className="text-sm text-subtle">
              가입한 회원에게는 알림으로, 아직 가입하지 않았다면 이메일로 초대가
              가요
            </p>
            {isEmailInvalid && (
              <p
                id="invite-email-e"
                className="flex items-center gap-1 text-sm text-danger"
              >
                <CircleAlert className="size-4 shrink-0" />
                <span>이메일 형식이 올바르지 않아요</span>
              </p>
            )}
          </div>

          <fieldset className="m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0">
            <legend className={`${LABEL} mb-1.5 p-0`}>초대할 반려동물</legend>
            <div className="flex flex-col overflow-hidden rounded-lg border border-line">
              {ownPets.map((pet) => {
                const count = coParentCounts[pet.petSn];
                const disabled = count == null || isFull(pet.petSn);
                const checked = !disabled && selectedPetSns.includes(pet.petSn);
                return (
                  <label
                    key={pet.petSn}
                    className={`flex min-h-12 items-center gap-3 border-t border-line-soft px-4 first:border-t-0 ${
                      disabled
                        ? 'cursor-not-allowed bg-surface-2 text-subtle'
                        : checked
                          ? 'cursor-pointer bg-brand-50'
                          : 'cursor-pointer'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => handleTogglePet(pet.petSn)}
                      className="size-5 cursor-pointer accent-brand-500 disabled:cursor-not-allowed"
                    />
                    {pet.petNm}
                    {count != null && (
                      <span className="ml-auto text-sm text-subtle">
                        {count}/{MAX_CAREGIVERS}명
                        {isFull(pet.petSn) && ' · 초대 불가'}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </form>
        <footer className="flex items-center justify-end gap-2 rounded-b-modal border-t border-line bg-[#fbfcfd] px-7 py-4">
          <button
            type="button"
            onClick={close}
            className="inline-flex h-10 min-w-24 items-center justify-center rounded-md border border-line bg-white px-4 font-semibold hover:border-line-strong hover:bg-surface-2"
          >
            취소
          </button>
          <button
            type="submit"
            form="invite-form"
            disabled={!canSend}
            className="inline-flex h-10 min-w-24 items-center justify-center rounded-md bg-brand-500 px-4 font-semibold text-white hover:enabled:bg-brand-600 disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-line-strong"
          >
            초대 보내기
          </button>
        </footer>
      </div>
    </div>
  );
}
