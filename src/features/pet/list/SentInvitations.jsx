import { useState } from 'react';
import Badge from '@/components/Badge';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import { diffDays, getTodayYmd, getYmdOf } from '@/utils/formatDate';
import { INVTN_STTS } from '../shared/petCodes';
import { useSentInvitations } from '../queries';
import MoreMenu from './MoreMenu';
import SentInvitationDialog from './SentInvitationDialog';

/**
 * [보낸 초대]
 * - 계정 전체 기준, 슬라이드와 무관한 조회 전용 목록
 * - 재발송 없음: 같은 이메일로 새로 초대
 * - ⋮ 메뉴: 대기중이면 "초대 취소", 취소됨이면 "삭제"(확인 모달). 할 게 없는 행은 ⋮ 자리만 비운다
 * - 한 초대는 한 행: 동물은 "연탄·루루"처럼 묶어 둘째 줄에 적는다
 * - 동물별 결과가 갈리면(일부만 수락) 배지는 "일부 수락" 하나, 둘째 줄에 "탄이 수락 · 까미 거절"
 */

const STATUS_BADGES = {
  [INVTN_STTS.WAIT]: {
    label: '대기중',
    tone: 'amber',
  },
  [INVTN_STTS.ACPT]: {
    label: '수락',
    tone: 'green',
  },
  [INVTN_STTS.RJCT]: {
    label: '거절',
    tone: 'rose',
  },
  [INVTN_STTS.EXPR]: {
    label: '만료됨',
    tone: 'gray',
  },
  [INVTN_STTS.CNCL]: {
    label: '취소됨',
    tone: 'gray',
  },
};

const PARTIAL_BADGE = {
  label: '일부 수락',
  tone: 'green',
};

/** 둘째 줄의 동물별 결과 글자색 */
const PET_RESULT_TEXT = {
  [INVTN_STTS.ACPT]: 'text-tone-green-fg',
  [INVTN_STTS.RJCT]: 'text-danger',
};

/** 초대의 동물 상태가 하나로 같으면 그 상태, 갈리면 null */
const getSharedStatus = (pets) => {
  const first = pets[0].invtnSttsCd;
  return pets.every((pet) => pet.invtnSttsCd === first) ? first : null;
};

/** 이메일은 "@" 뒤에서만 줄을 바꾼다(넘칠 때만 글자 단위로 끊김: 부모의 overflow-wrap). 모바일은 한 줄 말줄임이라 <wbr>를 숨긴다 */
function EmailText({ email }) {
  const at = email.indexOf('@');
  if (at < 0) return email;
  return (
    <>
      {email.slice(0, at + 1)}
      <span className="max-[760px]:hidden">
        <wbr />
      </span>
      {email.slice(at + 1)}
    </>
  );
}

/** 'YYYY-MM-DDTHH:mm:ss' → 'MM-DD' */
const formatMonthDay = (dateTime) => getYmdOf(dateTime).slice(5);

/**
 * 둘째 줄의 날짜 문구
 * - 대기중: "N일 후 만료"(만료일 기준, 당일은 "오늘 만료"), 미가입 이메일이면 앞에 "메일로 보냄 · "
 * - 그 밖: "MM-DD 보냄"
 */
const getDateText = (invitation, sharedStatus) => {
  if (sharedStatus !== INVTN_STTS.WAIT) {
    return `${formatMonthDay(invitation.regDt)} 보냄`;
  }
  const days = diffDays(getTodayYmd(), getYmdOf(invitation.invtnExpryDt));
  const expiry = days <= 0 ? '오늘 만료' : `${days}일 후 만료`;
  return invitation.rcvrJoined ? expiry : `메일로 보냄 · ${expiry}`;
};

export default function SentInvitations() {
  const { data: invitations = [], isPending } = useSentInvitations();
  /** { mode: 'cancel' | 'delete', invitation } */
  const [dialog, setDialog] = useState(null);

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
        className="flex items-baseline gap-2 text-lg font-bold tracking-[-0.02em]"
      >
        보낸 초대
        <small className="text-base font-medium tracking-normal text-subtle">
          — 계정 전체
        </small>
      </h2>
      {invitations.length === 0 ? (
        <p className="rounded-card border border-line bg-white px-6 py-6 text-center text-base font-normal text-muted shadow-depth-sm">
          아직 보낸 초대가 없어요
        </p>
      ) : (
        <ul className="min-w-0 rounded-card border border-line bg-white shadow-depth-sm">
          {invitations.map((invitation) => {
            const sharedStatus = getSharedStatus(invitation.pets);
            const isMixed = sharedStatus === null;
            const status = isMixed
              ? PARTIAL_BADGE
              : STATUS_BADGES[sharedStatus];
            const menuItems =
              sharedStatus === INVTN_STTS.WAIT
                ? [
                    {
                      label: '초대 취소',
                      onSelect: () => setDialog({ mode: 'cancel', invitation }),
                      isDanger: true,
                    },
                  ]
                : sharedStatus === INVTN_STTS.CNCL
                  ? [
                      {
                        label: '삭제',
                        onSelect: () =>
                          setDialog({ mode: 'delete', invitation }),
                        isDanger: true,
                      },
                    ]
                  : [];
            const dateText = getDateText(invitation, sharedStatus);
            return (
              <li
                key={invitation.jntBrupInvtnSn}
                className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-start gap-x-3 border-b border-line-soft px-6 py-6 last:border-b-0 max-[760px]:grid-cols-[auto_minmax(0,1fr)_auto] max-[760px]:gap-y-1.5 max-[760px]:px-4 max-[760px]:py-4"
              >
                <p
                  className={`col-start-1 row-start-1 min-w-0 font-semibold [overflow-wrap:anywhere] max-[760px]:overflow-hidden max-[760px]:text-ellipsis max-[760px]:whitespace-nowrap ${menuItems.length > 0 ? 'max-[760px]:col-span-2' : 'max-[760px]:col-span-3'}`}
                >
                  <EmailText email={invitation.invtnTrgtEml} />
                </p>
                <p className="col-start-1 row-start-2 mt-1 min-w-0 text-sm leading-[1.6] break-keep text-subtle max-[760px]:col-span-2 max-[760px]:col-start-2 max-[760px]:mt-0 max-[760px]:flex max-[760px]:items-baseline">
                  <span className="max-[760px]:min-w-0 max-[760px]:flex-1 max-[760px]:truncate">
                    {isMixed ? (
                      invitation.pets.map((pet, index) => (
                        <span key={pet.petSn}>
                          {index > 0 && ' · '}
                          <span className="text-ink">{pet.petNm}</span>{' '}
                          <span
                            className={PET_RESULT_TEXT[pet.invtnSttsCd] ?? ''}
                          >
                            {STATUS_BADGES[pet.invtnSttsCd].label}
                          </span>
                        </span>
                      ))
                    ) : (
                      <span className="text-ink">
                        {invitation.pets.map((pet) => pet.petNm).join('·')}
                      </span>
                    )}
                  </span>
                  <span className="max-[760px]:ml-2 max-[760px]:shrink-0 max-[760px]:text-xs max-[760px]:whitespace-nowrap max-[760px]:opacity-70">
                    <span className="max-[760px]:hidden"> · </span>
                    {dateText}
                  </span>
                </p>
                <div className="col-start-2 row-span-2 row-start-1 self-start max-[760px]:col-start-1 max-[760px]:row-span-1 max-[760px]:row-start-2 max-[760px]:self-center">
                  <Badge tone={status.tone} className="shrink-0">
                    {status.label}
                  </Badge>
                </div>
                {menuItems.length > 0 ? (
                  <MoreMenu
                    label="보낸 초대 메뉴"
                    items={menuItems}
                    isPlainOnMobile
                    className="col-start-3 row-span-2 row-start-1 self-start max-[760px]:row-span-1 max-[760px]:-mt-1"
                  />
                ) : (
                  <span
                    className="col-start-3 row-span-2 row-start-1 size-10 max-[760px]:hidden"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
      {dialog && (
        <SentInvitationDialog
          mode={dialog.mode}
          invitation={dialog.invitation}
          petNames={dialog.invitation.pets.map((pet) => pet.petNm)}
          onClose={() => setDialog(null)}
        />
      )}
    </section>
  );
}
