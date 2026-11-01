import { Plus, User, X } from 'lucide-react';
import { useState } from 'react';
import Badge from '@/components/Badge';
import Skeleton from '@/components/Skeleton';
import { showToast } from '@/components/toastStore';
import { useCaregivers, useDeleteCaregiver } from '../queries';
import { BRUP_ROLE, MAX_CAREGIVERS } from '@/utils/petCodes';

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
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto px-4 py-8">
      <div className="fixed inset-0 bg-[rgba(15,23,35,0.45)]" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="caregiver-delete-title"
        aria-describedby="caregiver-delete-desc"
        className="relative m-auto flex w-full max-w-[440px] shrink-0 flex-col rounded-modal bg-white shadow-depth-lg"
      >
        <div className="px-10 pt-10 pb-8 text-center">
          <h2
            id="caregiver-delete-title"
            className="text-lg leading-[1.35] font-bold break-keep"
          >
            {caregiver.mbrNcnm}님과의 연동을 해제할까요?
          </h2>
          <p
            id="caregiver-delete-desc"
            className="mt-2 leading-[1.6] break-keep text-muted"
          >
            해제하면 {caregiver.mbrNcnm}님은 {pet.petNm}의 기록을 더 이상 볼 수
            없어요.
          </p>
        </div>
        <div className="flex gap-2 px-10 pb-6">
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
        </div>
      </div>
    </div>
  );
}

const MEMBER_CARD =
  'relative flex min-w-0 items-center gap-2.5 rounded-card border border-line bg-white px-3.5 py-3 text-left';

function Avatar({ children }) {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-3 text-muted">
      {children ?? <User className="size-[18px]" aria-hidden="true" />}
    </span>
  );
}

function MemberCard({ name, badge, lines, onRemove, removeLabel }) {
  return (
    <li className={MEMBER_CARD}>
      <Avatar />
      <div className={`flex min-w-0 flex-col ${onRemove ? 'pr-5' : ''}`}>
        <p className="font-semibold break-keep">{name}</p>
        {badge && <div className="mt-1 mb-0.5 flex">{badge}</div>}
        {lines.map((line) => (
          <p key={line} className="truncate text-xs text-subtle">
            {line}
          </p>
        ))}
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="absolute top-1 right-1 grid size-7 place-items-center rounded-full text-subtle hover:bg-surface-2 hover:text-ink"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </li>
  );
}

const GRID =
  'grid grid-cols-2 gap-3 min-[761px]:grid-cols-3 min-[1101px]:grid-cols-5';

/** 슬라이드 카드 안 가족 영역: 주양육자는 공동양육자 전원, 공동양육자는 주양육자와 본인 연동 1건 */
export default function FamilySection({ pet, onInvite }) {
  const { data: caregivers = [], isPending } = useCaregivers(pet.petSn);
  const [deletingCaregiver, setDeletingCaregiver] = useState(null);

  if (isPending) {
    return (
      <div aria-busy="true">
        <Skeleton lines={3} />
      </div>
    );
  }

  const owner = caregivers.find(
    (caregiver) => caregiver.brupRoleCd === BRUP_ROLE.PRIMARY,
  );
  const coParents = caregivers.filter(
    (caregiver) => caregiver.brupRoleCd === BRUP_ROLE.CO_PARENT,
  );

  /** 공동양육자 시점: 주양육자와 나만, 삭제·초대 없음 (서버가 공동양육자에게는 본인 1건만 준다) */
  if (pet.brupRoleCd === BRUP_ROLE.CO_PARENT) {
    const mine = coParents[0];
    return (
      <section
        aria-labelledby="family-title"
        className="col-span-full mt-2 border-t border-line-strong pt-6"
      >
        <h3 id="family-title" className="mb-3 text-lg font-bold">
          가족
        </h3>
        <ul className={GRID}>
          <MemberCard
            name={owner?.mbrNcnm ?? ''}
            badge={
              <Badge className="bg-tone-green-bg text-tone-green-fg">
                주양육
              </Badge>
            }
            lines={['등록한 사람']}
          />
          {mine && (
            <MemberCard
              name={`나 (${mine.mbrNcnm})`}
              badge={
                <Badge className="bg-tone-gray-bg text-tone-gray-fg">
                  공동양육
                </Badge>
              }
              lines={[`${formatLinkDate(mine.linkYmd)} 연동`]}
            />
          )}
        </ul>
      </section>
    );
  }

  /** 주양육자 시점: 연동된 공동양육자 전원 + 남은 자리만큼 점선 초대 카드, 상한 5명 */
  const remaining = MAX_CAREGIVERS - coParents.length;
  return (
    <section
      aria-labelledby="family-title"
      className="col-span-full mt-2 border-t border-line-strong pt-6"
    >
      <h3
        id="family-title"
        className="mb-3 flex items-baseline gap-2 text-lg font-bold"
      >
        가족
        {remaining <= 0 && (
          <small className="text-sm font-medium text-subtle">
            {MAX_CAREGIVERS}명이 모두 연동돼 더 초대할 수 없어요
          </small>
        )}
      </h3>
      <ul className={GRID}>
        {coParents.map((caregiver) => (
          <MemberCard
            key={caregiver.brupRelSn}
            name={caregiver.mbrNcnm}
            lines={[`${formatLinkDate(caregiver.linkYmd)} 연동`]}
            onRemove={() => setDeletingCaregiver(caregiver)}
            removeLabel={`${caregiver.mbrNcnm} 가족에서 삭제`}
          />
        ))}
        {remaining > 0 && (
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
