import { ChevronDown, Plus, User, X } from 'lucide-react';
import { useState } from 'react';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import Skeleton from '@/components/Skeleton';
import { showToast } from '@/components/toastStore';
import { useCaregivers, useDeleteCaregiver } from '../queries';
import { BRUP_ROLE, MAX_CAREGIVERS } from '@/utils/petCodes';

/** 모바일에서 3명 이하면 전부, 그보다 많으면 앞 2명만 보이고 나머지는 더보기 */
const MOBILE_VISIBLE_THRESHOLD = 3;
const MOBILE_COLLAPSED_COUNT = 2;

/** 'YYYY-MM-DD' → 'MM-DD' */
const formatLinkDate = (linkYmd) => linkYmd.slice(5);

function CaregiverDeleteDialog({ pet, caregiver, onClose }) {
  const deleteCaregiver = useDeleteCaregiver();

  const handleDelete = () =>
    deleteCaregiver.mutate(
      { petSn: pet.petSn, brupRelSn: caregiver.brupRelSn },
      {
        onSuccess: () => {
          onClose();
          showToast('연동을 해제했어요');
        },
        onError: (error) => {
          /** 이미 해제된 연동이면 목록은 다시 읽히므로 창을 닫는다 */
          if (error.code === 'CAREGIVER_NOT_FOUND') onClose();
          showToast(error.message);
        },
      },
    );

  return (
    <Modal
      isConfirm
      isSpacious
      isPending={deleteCaregiver.isPending}
      title={`${caregiver.mbrNcnm}님과의 연동을 해제할까요?`}
      description={`해제하면 ${caregiver.mbrNcnm}님은 ${pet.petNm}의 기록을 더 이상 볼 수 없어요.`}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-11 min-w-0 flex-1 rounded-md border border-line bg-white font-semibold hover:border-line-strong hover:bg-surface-2"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteCaregiver.isPending}
            className="h-11 min-w-0 flex-1 rounded-md bg-danger font-semibold text-white hover:bg-[#983a2f] disabled:bg-surface-3 disabled:text-line-strong"
          >
            해제
          </button>
        </>
      }
    />
  );
}

const MEMBER_CARD =
  'relative flex min-w-0 items-center gap-2.5 rounded-card border border-line bg-white px-3.5 py-3 text-left';

/** 모바일 한 줄 카드: 이름 자리를 넓히려 여백을 줄인다 */
const MOBILE_CARD =
  'relative flex min-w-0 items-center gap-1.5 rounded-card border border-line bg-white py-2.5 pr-2 pl-3 text-left';

const CO_PARENT_BADGE = (
  <Badge className="bg-tone-gray-bg text-tone-gray-fg">공동양육</Badge>
);

function Avatar({ className = 'size-9' }) {
  return (
    <span
      className={`grid ${className} shrink-0 place-items-center rounded-full bg-surface-3 text-muted`}
    >
      <User className="size-[18px]" aria-hidden="true" />
    </span>
  );
}

const REMOVE_BUTTON =
  'grid size-7 place-items-center rounded-full text-subtle hover:bg-surface-2 hover:text-ink';

/** 761px 이상: 이름·배지·연동일을 세로로 쌓은 카드. 이름은 한 줄 말줄임, [✕]는 오른쪽 위 */
function MemberCard({ caregiver, onRemove }) {
  return (
    <li className={MEMBER_CARD}>
      <Avatar />
      <div className="flex min-w-0 flex-col pr-5">
        <p className="truncate font-semibold" title={caregiver.mbrNcnm}>
          {caregiver.mbrNcnm}
        </p>
        <div className="mt-1 mb-0.5 flex">{CO_PARENT_BADGE}</div>
        <p className="truncate text-xs text-subtle">
          {formatLinkDate(caregiver.linkYmd)} 연동
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${caregiver.mbrNcnm} 가족에서 삭제`}
        className={`${REMOVE_BUTTON} absolute top-1 right-1`}
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </li>
  );
}

/** 모바일: 한 줄에 하나씩, 카드 안은 줄바꿈 없이 한 줄 */
function MobileCaregiverList({ caregivers, onRemove }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isCollapsible = caregivers.length > MOBILE_VISIBLE_THRESHOLD;
  const visible =
    isCollapsible && !isExpanded
      ? caregivers.slice(0, MOBILE_COLLAPSED_COUNT)
      : caregivers;

  return (
    <div className="hidden max-[760px]:block">
      <ul className="flex flex-col gap-2">
        {visible.map((caregiver) => (
          <li key={caregiver.brupRelSn} className={MOBILE_CARD}>
            <Avatar className="size-8" />
            <span
              className="min-w-0 truncate font-semibold"
              title={caregiver.mbrNcnm}
            >
              {caregiver.mbrNcnm}
            </span>
            <span className="shrink-0">{CO_PARENT_BADGE}</span>
            <span className="ml-auto shrink-0 text-xs whitespace-nowrap text-subtle">
              {formatLinkDate(caregiver.linkYmd)} 연동
            </span>
            <button
              type="button"
              onClick={() => onRemove(caregiver)}
              aria-label={`${caregiver.mbrNcnm} 가족에서 삭제`}
              className={`${REMOVE_BUTTON} shrink-0`}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      {isCollapsible && (
        <button
          type="button"
          onClick={() => setIsExpanded((open) => !open)}
          aria-expanded={isExpanded}
          className="mt-2 flex w-full items-center justify-center gap-1 p-1.5 font-semibold text-brand-600"
        >
          {isExpanded
            ? '접기'
            : `${caregivers.length - MOBILE_COLLAPSED_COUNT}명 더보기`}
          <ChevronDown
            className={`size-4 ${isExpanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
}

const GRID =
  'grid grid-cols-2 gap-3 min-[761px]:grid-cols-3 min-[1101px]:grid-cols-5';

/** 공동양육자 시점, 761px 이상: 이름·배지 줄 아래에 주양육자 닉네임 한 줄 (가족 섹션 대신) */
export function OwnerLine({ pet }) {
  const { data: caregivers = [], isPending } = useCaregivers(pet.petSn);
  const owner = caregivers.find(
    (caregiver) => caregiver.brupRoleCd === BRUP_ROLE.PRIMARY,
  );

  /** 불러오는 동안에도 라벨과 같은 줄 높이를 차지해 카드 높이가 바뀌지 않게 한다 */
  if (isPending) {
    return (
      <div
        aria-busy="true"
        className="mt-1.5 flex min-w-0 items-baseline gap-2 max-[760px]:hidden"
      >
        <span className="shrink-0 text-muted">주양육자</span>
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }
  if (!owner) return null;

  return (
    <p className="mt-1.5 flex min-w-0 items-baseline gap-2 max-[760px]:hidden">
      <span className="shrink-0 text-muted">주양육자</span>
      <strong className="min-w-0 truncate font-semibold" title={owner.mbrNcnm}>
        {owner.mbrNcnm}
      </strong>
    </p>
  );
}

/** 슬라이드 카드 안 가족 영역: 주양육자는 공동양육자 전원, 공동양육자는 모바일에서만 주양육자 한 줄 */
export default function FamilySection({ pet, onInvite }) {
  const { data: caregivers = [], isPending } = useCaregivers(pet.petSn);
  const [deletingCaregiver, setDeletingCaregiver] = useState(null);
  const isCoParent = pet.brupRoleCd === BRUP_ROLE.CO_PARENT;

  if (isPending) {
    return (
      <div
        aria-busy="true"
        className={isCoParent ? 'hidden max-[760px]:block' : undefined}
      >
        <Skeleton lines={3} />
      </div>
    );
  }

  /** 공동양육자 시점: 761px 이상은 이름 줄 아래 한 줄(OwnerLine)이라 섹션이 없고, 모바일만 한 줄 항목. 삭제·초대 없음 */
  if (isCoParent) {
    const owner = caregivers.find(
      (caregiver) => caregiver.brupRoleCd === BRUP_ROLE.PRIMARY,
    );
    return (
      <section
        aria-labelledby="family-title"
        className="col-span-full mt-2 hidden border-t border-line-strong pt-6 max-[760px]:block"
      >
        <h3 id="family-title" className="mb-2 text-lg font-bold">
          가족
        </h3>
        <p className="flex min-w-0 items-baseline gap-2.5 px-0.5 py-1.5">
          <span className="shrink-0 text-muted">주양육자</span>
          <span className="shrink-0 text-line-strong" aria-hidden="true">
            |
          </span>
          <strong
            className="min-w-0 truncate font-semibold"
            title={owner?.mbrNcnm}
          >
            {owner?.mbrNcnm ?? ''}
          </strong>
        </p>
      </section>
    );
  }

  /** 주양육자 시점: 연동된 공동양육자 전원, 상한 5명. 761px 이상은 점선 초대 카드, 모바일은 제목 옆 [+ 초대] */
  const coParents = caregivers.filter(
    (caregiver) => caregiver.brupRoleCd === BRUP_ROLE.CO_PARENT,
  );
  const remaining = MAX_CAREGIVERS - coParents.length;
  const isFull = remaining <= 0;

  const handleMobileInvite = () => {
    if (isFull) {
      showToast(`최대 ${MAX_CAREGIVERS}명까지 함께할 수 있어요`);
      return;
    }
    onInvite(pet);
  };

  return (
    <section
      aria-labelledby="family-title"
      className="col-span-full mt-2 border-t border-line-strong pt-6"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3
          id="family-title"
          className="flex items-baseline gap-2 text-lg font-bold"
        >
          가족
          <span className="hidden text-sm font-medium text-subtle max-[760px]:inline">
            {coParents.length}/{MAX_CAREGIVERS}
          </span>
          {isFull && (
            <small className="text-sm font-medium text-subtle max-[760px]:hidden">
              {MAX_CAREGIVERS}명이 모두 연동돼 더 초대할 수 없어요
            </small>
          )}
        </h3>
        <button
          type="button"
          onClick={handleMobileInvite}
          aria-disabled={isFull}
          className={`relative hidden h-8 items-center gap-1 rounded-full px-3 text-[13px] font-semibold before:absolute before:-inset-y-1.5 before:inset-x-0 before:content-[''] max-[760px]:inline-flex ${isFull ? 'bg-surface-3 text-subtle' : 'bg-brand-50 text-brand-600'}`}
        >
          <Plus className="size-3.5" aria-hidden="true" />
          초대
        </button>
      </div>
      <ul className={`${GRID} max-[760px]:hidden`}>
        {coParents.map((caregiver) => (
          <MemberCard
            key={caregiver.brupRelSn}
            caregiver={caregiver}
            onRemove={() => setDeletingCaregiver(caregiver)}
          />
        ))}
        {!isFull && (
          <li className="flex">
            <button
              type="button"
              onClick={() => onInvite(pet)}
              className={`${MEMBER_CARD} w-full cursor-pointer border-dashed text-brand-600 hover:border-brand-500 hover:bg-brand-50`}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-dashed border-line-strong">
                <Plus className="size-[18px]" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="font-semibold whitespace-nowrap">
                  가족 초대
                </span>
                <span className="truncate text-xs text-subtle">
                  {remaining}자리 남음
                </span>
              </span>
            </button>
          </li>
        )}
      </ul>
      <MobileCaregiverList
        caregivers={coParents}
        onRemove={setDeletingCaregiver}
      />
      {deletingCaregiver && (
        <CaregiverDeleteDialog
          pet={pet}
          caregiver={deletingCaregiver}
          onClose={() => setDeletingCaregiver(null)}
        />
      )}
    </section>
  );
}
