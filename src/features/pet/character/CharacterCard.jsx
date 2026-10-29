import { Cat, Dog } from 'lucide-react';
import Badge from '@/components/Badge';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import { CHRC_STTS, PET_SE } from '../shared/petCodes';

/** 카드마다 돌려 쓰는 무대 배경 */
const STAGE_TONES = [
  'bg-tone-blue-bg',
  'bg-tone-rose-bg',
  'bg-tone-amber-bg',
  'bg-tone-violet-bg',
  'bg-tone-green-bg',
];

/**
 * [캐릭터 카드]
 * - mode: 'own'(내 캐릭터, 꾸미기·대표 지정·만들기) / 'shared'(공동양육, 조회 전용)
 * - 캐릭터가 없거나 오류 확인 중이면 종별 기본 캐릭터 사용
 */
export default function CharacterCard({
  pet,
  mode,
  toneIndex,
  onDecorate,
  onCreate,
  onSetRepresentative,
}) {
  const isOwn = mode === 'own';
  const isDone = pet.chrcSttsCd === CHRC_STTS.DONE;
  const isNone = pet.chrcSttsCd === CHRC_STTS.NONE;
  const isGenerating = pet.chrcSttsCd === CHRC_STTS.GENERATING;
  const isError = pet.chrcSttsCd === CHRC_STTS.ERROR;
  const isRep = isOwn && pet.rprsYn === 'Y';
  const canDecorate = isOwn && isDone;
  const Icon = pet.petSeCd === PET_SE.CAT ? Cat : Dog;

  const stage = (
    <span
      className={`relative grid aspect-square place-items-end justify-items-center pb-[16%] after:absolute after:inset-x-0 after:bottom-0 after:h-[22%] after:bg-white after:opacity-55 ${
        isDone ? STAGE_TONES[toneIndex % STAGE_TONES.length] : 'bg-surface-2'
      } ${canDecorate ? 'group-hover:shadow-[inset_0_0_0_2px_var(--color-brand-100)]' : ''}`}
    >
      <span
        aria-hidden="true"
        className="absolute bottom-[17%] left-1/2 z-[1] h-[7%] w-[46%] -translate-x-1/2 rounded-full bg-ink opacity-[0.08]"
      />
      <span
        aria-hidden="true"
        className={`relative z-[2] grid aspect-square w-[62%] place-items-center text-brand-500 ${
          isError ? 'opacity-55 grayscale' : ''
        } ${isNone || isGenerating ? 'opacity-[0.12] brightness-0' : ''}`}
      >
        {pet.chrcImgUrl && isDone ? (
          <img
            src={pet.chrcImgUrl}
            alt=""
            className="size-full object-contain [image-rendering:pixelated]"
          />
        ) : (
          <Icon className="size-3/5" />
        )}
      </span>
      {isNone && (
        <span
          aria-hidden="true"
          className="absolute top-[34%] left-1/2 z-[3] -translate-x-1/2 text-xl font-bold text-subtle"
        >
          ?
        </span>
      )}
      {isRep && (
        <Badge
          tone="brand"
          className="absolute top-3 left-3 z-[4] bg-brand-500! text-white!"
        >
          대표
        </Badge>
      )}
      {isError && (
        <Badge tone="amber" className="absolute top-3 left-3 z-[4]">
          오류 확인 중
        </Badge>
      )}
      {isGenerating && (
        <Badge tone="amber" className="absolute top-3 left-3 z-[4]">
          만드는 중
        </Badge>
      )}
      {isOwn && isNone && (
        <span className="absolute inset-x-4 bottom-3 z-[5]">
          <button
            type="button"
            onClick={() => onCreate(pet)}
            className={`${BTN_PRIMARY} h-9 w-full`}
          >
            캐릭터 만들기
          </button>
        </span>
      )}
    </span>
  );

  return (
    <article
      className={`group relative overflow-hidden rounded-card border bg-white shadow-sm ${
        isRep
          ? 'border-brand-500 shadow-[inset_0_0_0_1px_var(--color-brand-500)]'
          : 'border-line'
      }`}
    >
      {canDecorate ? (
        <button
          type="button"
          onClick={() => onDecorate(pet)}
          aria-label={`${pet.petNm} 꾸미기`}
          className="block w-full"
        >
          {stage}
        </button>
      ) : (
        <div>{stage}</div>
      )}
      <div className="flex min-h-[52px] items-center justify-between gap-2 px-4 py-3">
        <span className="min-w-0 truncate font-bold">{pet.petNm}</span>
        {isOwn && !isRep && (
          <button
            type="button"
            onClick={() => onSetRepresentative(pet)}
            className="shrink-0 text-sm text-muted underline underline-offset-[3px] hover:text-ink"
          >
            대표 지정
          </button>
        )}
        {!isOwn && (
          <span className="shrink-0 text-sm text-subtle">
            {isNone ? '캐릭터 없음' : isDone ? '조회 전용' : null}
          </span>
        )}
      </div>
    </article>
  );
}
