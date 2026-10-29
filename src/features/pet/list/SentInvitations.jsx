import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import { INVT_STTS } from '../api';
import { useSentInvitations } from '../queries';

/**
 * [보낸 초대]
 * - 계정 전체 기준, 슬라이드와 무관한 조회 전용 목록
 * - 재발송 없음: 같은 이메일로 새로 초대
 * - 한 초대에 동물이 여러 마리면 동물마다 한 줄로 나누고 상태도 동물별로 표시(일부만 수락하면 수락/거절)
 */

const STATUS_BADGES = {
  [INVT_STTS.WAIT]: {
    label: '대기중',
    tone: 'bg-tone-amber-bg text-tone-amber-fg',
  },
  [INVT_STTS.ACPT]: {
    label: '수락',
    tone: 'bg-tone-green-bg text-tone-green-fg',
  },
  [INVT_STTS.RJCT]: {
    label: '거절',
    tone: 'bg-tone-rose-bg text-tone-rose-fg',
  },
  [INVT_STTS.EXPR]: {
    label: '만료됨',
    tone: 'bg-tone-gray-bg text-tone-gray-fg',
  },
};

function Badge({ tone, children }) {
  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center rounded-full px-2.5 pt-[1.5px] text-badge leading-none font-semibold whitespace-nowrap ${tone}`}
    >
      {children}
    </span>
  );
}

/** 'YYYY-MM-DD' → 'MM-DD' */
const formatMonthDay = (ymd) => ymd.slice(5);

export default function SentInvitations() {
  const { data: invitations = [], isPending } = useSentInvitations();
  /** 초대 1건을 동물마다 한 줄로 펼침 */
  const rows = invitations.flatMap((invitation) =>
    invitation.pets.map((pet) => ({ invitation, pet })),
  );

  if (isPending) {
    return (
      <div aria-busy="true" className="mt-12 flex flex-col gap-5">
        <Skeleton className="h-7 w-32" />
        <SkeletonCard className="h-[427px]" />
      </div>
    );
  }

  return (
    <section aria-labelledby="sent-title" className="mt-12 flex flex-col gap-5">
      <h2
        id="sent-title"
        className="flex items-baseline gap-2 text-[22px] leading-[1.35] font-bold tracking-[-0.02em]"
      >
        보낸 초대
        <small className="text-base font-medium tracking-normal text-subtle">
          — 계정 전체
        </small>
      </h2>
      {rows.length === 0 ? (
        <p className="rounded-card border border-line bg-white px-[22px] py-6 text-center text-muted shadow-depth-sm">
          아직 보낸 초대가 없어요
        </p>
      ) : (
        <ul className="min-w-0 rounded-card border border-line bg-white shadow-depth-sm">
          {rows.map(({ invitation, pet }) => {
            const status = STATUS_BADGES[pet.invtSttsCd];
            const meta = [
              `${formatMonthDay(invitation.invtDt)} 발송`,
              invitation.mbrYn === 'Y'
                ? '가입 회원(인앱 알림)'
                : '미가입 이메일',
            ];
            return (
              <li
                key={`${invitation.invtSn}-${pet.petSn}`}
                className="border-b border-line-soft px-[22px] py-6 last:border-b-0"
              >
                <p className="flex items-start gap-4 font-semibold">
                  <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                    {invitation.invtEml}
                  </span>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </p>
                <p className="mt-1 text-sm leading-[1.6] text-subtle">
                  <b className="font-semibold text-ink">{pet.petNm}</b> ·{' '}
                  {meta.join(' · ')}
                  {pet.invtSttsCd === INVT_STTS.WAIT && (
                    <>
                      <br />
                      {formatMonthDay(invitation.expryDt)}에 만료돼요
                    </>
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
