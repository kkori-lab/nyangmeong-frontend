import { useState } from 'react';
import Checkbox from '@/components/Checkbox';
import FieldError from '@/components/FieldError';
import Modal from '@/components/Modal';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { INPUT, LABEL } from '@/components/formStyles';
import { showToast } from '@/components/toastStore';
import { getYmdOf } from '@/utils/formatDate';
import { useCaregiversOf, useCreateInvitation } from '../queries';
import { BRUP_ROLE, MAX_CAREGIVERS } from '@/utils/petCodes';

/**
 * [가족 초대하기 모달]
 * - 이메일 입력(형식 검사만, 상대 조회 없음, [확인] 버튼 없음) + 주양육 동물 다중 선택 -> 초대 1건 발송
 * - 공동양육자 5명이 찬 동물은 선택 불가
 * - 서버가 409로 알려 준 충돌 동물(이미 가족·초대 대기)은 선택을 풀고 비활성화, 이메일을 바꾸면 초기화
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 'YYYY-MM-DDTHH:mm:ss' → 'MM-DD' */
const toMonthDay = (dateTime) => getYmdOf(dateTime).slice(5);

/** 409 충돌 안내 문구: 이미 가족 / 이미 초대 대기 */
const conflictMessages = ({ linkedPets, pendingPets }) => [
  ...(linkedPets.length > 0
    ? [`이미 ${linkedPets.map((pet) => pet.petNm).join(', ')}의 가족이에요`]
    : []),
  ...(pendingPets.length > 0
    ? [
        `이미 초대를 보냈어요: ${pendingPets
          .map((pet) =>
            pet.invtnExpryDt
              ? `${pet.petNm}(${toMonthDay(pet.invtnExpryDt)} 만료)`
              : pet.petNm,
          )
          .join(', ')}`,
      ]
    : []),
];

export default function InviteModal({ pets, initialPetSn, onClose }) {
  const createInvitation = useCreateInvitation();
  const ownPets = pets.filter((pet) => pet.brupRoleCd === BRUP_ROLE.PRIMARY);
  const caregiverResults = useCaregiversOf(ownPets.map((pet) => pet.petSn));

  const [invtnTrgtEml, setInvtnTrgtEml] = useState('');
  /** 입력란을 벗어나거나 보내기를 눌러야 형식 오류를 안내 */
  const [isEmailTouched, setIsEmailTouched] = useState(false);
  const [selectedPetSns, setSelectedPetSns] = useState(
    initialPetSn == null ? [] : [initialPetSn],
  );
  /** 서버가 알려 준 충돌 { linkedPets, pendingPets }, 이메일을 바꾸면 null */
  const [conflict, setConflict] = useState(null);
  /** 서버가 알려 준 이메일 칸 오류 문구 */
  const [serverEmailError, setServerEmailError] = useState(null);

  /** 동물별 공동양육자 수 (조회 전이면 null) */
  const coParentCounts = Object.fromEntries(
    ownPets.map((pet, index) => {
      const caregivers = caregiverResults[index]?.data;
      return [
        pet.petSn,
        caregivers
          ? caregivers.filter((c) => c.brupRoleCd === BRUP_ROLE.CO_PARENT)
              .length
          : null,
      ];
    }),
  );
  const isFull = (petSn) => coParentCounts[petSn] >= MAX_CAREGIVERS;
  /** 충돌 동물 옆에 보일 문구 (없으면 null) */
  const conflictLabelOf = (petSn) => {
    if (conflict?.linkedPets.some((pet) => pet.petSn === petSn)) {
      return '이미 가족';
    }
    const pending = conflict?.pendingPets.find((pet) => pet.petSn === petSn);
    if (!pending) return null;
    return pending.invtnExpryDt
      ? `초대 대기 · ${toMonthDay(pending.invtnExpryDt)} 만료`
      : '초대 대기';
  };
  const pickedPetSns = selectedPetSns.filter(
    (petSn) =>
      coParentCounts[petSn] != null &&
      !isFull(petSn) &&
      conflictLabelOf(petSn) == null,
  );
  const isEmailValid = EMAIL_PATTERN.test(invtnTrgtEml.trim());
  const isEmailInvalid = isEmailTouched && !isEmailValid;
  const canSend =
    isEmailValid && pickedPetSns.length > 0 && !createInvitation.isPending;

  const close = () => {
    if (!createInvitation.isPending) onClose();
  };

  const handleEmailChange = (event) => {
    setInvtnTrgtEml(event.target.value);
    setConflict(null);
    setServerEmailError(null);
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
      { invtnTrgtEml: invtnTrgtEml.trim(), petSns: pickedPetSns },
      {
        onSuccess: () => {
          onClose();
          showToast('초대를 보냈어요', { type: 'success' });
        },
        onError: (error) => {
          const emailField = error.fields?.find(
            (f) => f.field === 'invtnTrgtEml',
          );
          if (emailField) {
            setServerEmailError(emailField.message);
          } else if (error.code === 'CAREGIVER_INVITATION_SELF') {
            setServerEmailError(error.message);
          } else if (
            error.code === 'CAREGIVER_ALREADY_LINKED' ||
            error.code === 'CAREGIVER_INVITATION_DUPLICATED'
          ) {
            const { linkedPets = [], pendingPets = [] } = error.data ?? {};
            setConflict({ linkedPets, pendingPets });
            if (linkedPets.length === 0 && pendingPets.length === 0) {
              showToast(error.message, { type: 'error' });
            }
          } else {
            showToast(error.message, { type: 'error' });
          }
        },
      },
    );
  };

  return (
    <Modal
      width={560}
      isPending={createInvitation.isPending}
      title="가족 초대하기"
      onClose={close}
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <button
            type="button"
            onClick={close}
            className={`${BTN_SECONDARY} min-w-24`}
          >
            취소
          </button>
          <button
            type="submit"
            form="invite-form"
            disabled={!canSend}
            className={`${BTN_PRIMARY} min-w-24`}
          >
            초대 보내기
          </button>
        </div>
      }
    >
      <form
        id="invite-form"
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="invite-email" className={LABEL}>
            초대할 상대의 이메일
          </label>
          <input
            id="invite-email"
            type="email"
            value={invtnTrgtEml}
            onChange={handleEmailChange}
            onBlur={() => invtnTrgtEml.trim() && setIsEmailTouched(true)}
            placeholder="이메일 주소 입력"
            aria-invalid={
              isEmailInvalid || serverEmailError ? 'true' : undefined
            }
            aria-describedby={
              isEmailInvalid || serverEmailError
                ? 'invite-email-h invite-email-e'
                : 'invite-email-h'
            }
            className={`${INPUT} min-w-0`}
          />
          <p id="invite-email-h" className="text-sm text-subtle">
            가입한 회원에게는 알림으로, 아직 가입하지 않았다면 이메일로 초대가
            가요
          </p>
          <FieldError id="invite-email-e">
            {isEmailInvalid
              ? '이메일 형식이 올바르지 않아요'
              : serverEmailError}
          </FieldError>
        </div>

        <fieldset className="m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0">
          <legend className={`${LABEL} mb-1.5 p-0`}>초대할 반려동물</legend>
          <div className="flex flex-col overflow-hidden rounded-lg border border-line">
            {ownPets.map((pet) => {
              const count = coParentCounts[pet.petSn];
              const conflictLabel = conflictLabelOf(pet.petSn);
              const disabled =
                count == null || isFull(pet.petSn) || conflictLabel != null;
              const checked = !disabled && selectedPetSns.includes(pet.petSn);
              return (
                <Checkbox
                  key={pet.petSn}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => handleTogglePet(pet.petSn)}
                  className={`min-h-12 border-t border-line-soft px-4 first:border-t-0 ${
                    disabled
                      ? 'bg-surface-2 text-subtle'
                      : checked
                        ? 'bg-brand-50'
                        : ''
                  }`}
                >
                  {pet.petNm}
                  {count != null && (
                    <span className="ml-auto text-sm text-subtle">
                      {count}/{MAX_CAREGIVERS}명
                      {isFull(pet.petSn) && ' · 초대 불가'}
                      {conflictLabel && ` · ${conflictLabel}`}
                    </span>
                  )}
                </Checkbox>
              );
            })}
          </div>
          {conflict &&
            conflictMessages(conflict).map((message) => (
              <FieldError key={message}>{message}</FieldError>
            ))}
        </fieldset>
      </form>
    </Modal>
  );
}
