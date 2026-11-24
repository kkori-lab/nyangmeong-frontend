import { canStartSnsLogin, startSnsLogin } from '../login/snsAuth';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import SnsLogoChip from '../shared/SnsLogoChip';
import { SNS_NAME } from '../shared/snsCodes';
import AccountRow from './AccountRow';

/** 표시 순서. 로고는 SnsLogoChip. 네이버(USRC0007)는 사업자 번호가 있어야 검수를 받을 수 있어 뺐다 */
const PROVIDERS = ['USRC0008', 'USRC0009'];

/**
 * 제공자별 연동 상태. 가입할 때 쓴 제공자는 "가입 계정", 이미 연동한 제공자는 "연동됨", 나머지는 [연동하기].
 * [연동하기]는 인가 창으로 가고, 돌아오면 로그인 화면 주소가 결과를 처리한다(useSnsCallback, mode: 'link'). 해제는 없다
 */
export default function SnsLinkCard({ joinPathCd, snsAcntLinks = [] }) {
  const linked = new Set(snsAcntLinks.map(({ snsOffrCd }) => snsOffrCd));

  return (
    <>
      {PROVIDERS.map((snsOffrCd) => {
        const isJoined = snsOffrCd === joinPathCd;
        const isLinked = !isJoined && linked.has(snsOffrCd);
        return (
          <AccountRow
            key={snsOffrCd}
            label={
              <span className="inline-flex items-center gap-2">
                <SnsLogoChip snsOffrCd={snsOffrCd} />
                {SNS_NAME[snsOffrCd]}
              </span>
            }
            value={
              isJoined ? (
                '가입 계정'
              ) : isLinked ? (
                '연동됨'
              ) : (
                <span className="text-subtle">연동 안 됨</span>
              )
            }
            action={
              !isJoined &&
              !isLinked && (
                <button
                  type="button"
                  className={BTN_SECONDARY}
                  disabled={!canStartSnsLogin(snsOffrCd)}
                  onClick={() => startSnsLogin({ snsOffrCd, mode: 'link' })}
                >
                  연동하기
                </button>
              )
            }
          />
        );
      })}
    </>
  );
}
