import AiErrorGuide from '@/components/AiErrorGuide';
import { BRUP_ROLE } from '@/utils/petCodes';
import AuthCheckBox from '../shared/AuthCheckBox';
import { OUTLINE_BTN, PRIMARY_BTN } from '../shared/authStyles';
import { WITHDRAW_MESSAGES as MSG } from './withdrawMessages';

const SECTION = 'rounded-box border border-line bg-white px-5 py-4';
const SECTION_TITLE = 'mb-2 font-bold text-ink';
const LIST = 'list-disc space-y-1 pl-5 leading-6 text-ink-2';

/** 주양육·공동양육 마릿수 */
const countPets = (pets) => ({
  primary: pets.filter((pet) => pet.brupRoleCd === BRUP_ROLE.PRIMARY).length,
  coParent: pets.filter((pet) => pet.brupRoleCd === BRUP_ROLE.CO_PARENT).length,
});

/** 탈퇴 안내 1~5: 유의사항·반려동물 영향·확인 체크·계속·취소 */
export default function WithdrawNotice({
  pets,
  isPetsError,
  isChecked,
  noticeError,
  onToggle,
  onContinue,
  onCancel,
}) {
  const count = pets ? countPets(pets) : null;

  return (
    <div className="flex flex-col gap-4">
      <section className={SECTION}>
        <h3 className={SECTION_TITLE}>탈퇴 전 꼭 확인해 주세요</h3>
        <ul className={LIST}>
          <li>탈퇴 즉시 모든 기기의 로그인이 종료됩니다.</li>
          <li>회원정보·반려동물·건강기록·픽셀캐릭터는 30일간 보관합니다.</li>
          <li>
            30일 이내 같은 이메일로 본인확인 후 재가입하면 기존 정보를 복구할 수
            있습니다.
          </li>
          <li>30일이 지나 파기된 정보는 복구할 수 없습니다.</li>
        </ul>
      </section>
      <section className={SECTION}>
        <h3 className={SECTION_TITLE}>반려동물과 공동양육</h3>
        <p className="mb-2 font-semibold text-ink">
          {isPetsError
            ? MSG.petsError
            : `주양육 반려동물 ${count.primary}마리 · 공동양육 ${count.coParent}마리`}
        </p>
        <ul className={LIST}>
          <li>다른 주양육자의 반려동물·건강기록은 삭제하지 않습니다.</li>
          <li>공동양육은 읽기 전용이며 권한을 자동 이전하지 않습니다.</li>
        </ul>
      </section>
      <div
        className={`relative rounded-box border px-5 py-4 ${
          noticeError ? 'border-danger' : 'border-line'
        }`}
      >
        <AuthCheckBox checked={isChecked} onChange={onToggle}>
          <span className="font-semibold text-ink">{MSG.noticeCheck}</span>
        </AuthCheckBox>
        {noticeError && (
          <>
            <p role="alert" className="mt-2 text-sm leading-5 text-danger">
              {noticeError}
            </p>
            <AiErrorGuide message={noticeError} />
          </>
        )}
      </div>
      <div className="mt-2 flex gap-2 max-md:flex-col-reverse">
        <button type="button" onClick={onCancel} className={OUTLINE_BTN}>
          취소
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!isChecked}
          className={PRIMARY_BTN}
        >
          탈퇴 확인으로 계속
        </button>
      </div>
    </div>
  );
}
