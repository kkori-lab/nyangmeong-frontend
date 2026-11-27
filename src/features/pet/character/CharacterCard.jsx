import defaultCatCharacter from '@/assets/pets/default-character-cat-full.png';
import defaultDogCharacter from '@/assets/pets/default-character-dog-full.png';
import Badge from '@/components/Badge';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import FileImage from '@/components/FileImage';
import { characterImageOptions } from '@/hooks/useCharacterImage';
import { useFileImage } from '@/hooks/useFileImage';
import { CHRC_STTS, PET_SE } from '../shared/petCodes';
import { STAGE_TONES } from '../shared/stageTones';

/**
 * [캐릭터 카드]
 * - mode: 'own'(내 캐릭터, 꾸미기·대표 지정·만들기) / 'shared'(공동양육, 조회 전용)
 * - pet: GET /pets 한 행 + { pixelCharSn, charStatus, isCharError }(CharacterPage가 GET /pixel-characters로 합침)
 * - 이미지는 GET /pets/{petSn}/character-image (오류 확인 중이면 서버가 종별 기본 캐릭터를 줘서 흑백으로 보임)
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
  const isDone = pet.charStatus === CHRC_STTS.DONE;
  const isNone = pet.charStatus === CHRC_STTS.NONE;
  const isGenerating = pet.charStatus === CHRC_STTS.GENERATING;
  const isError = pet.isCharError;
  const isRep = isOwn && pet.rprsPetYn;
  /** 오류 확인 중에는 꾸미기 진입을 막는다 (FN-MYP-010-23) */
  const canDecorate = isOwn && isDone && !isError;
  const { src, isPending } = useFileImage({
    ...characterImageOptions(pet.petSn, 'full'),
    enabled: isDone,
  });
  const defaultImage =
    pet.petSeCd === PET_SE.CAT ? defaultCatCharacter : defaultDogCharacter;
  const defaultCharacter = (
    <img
      src={defaultImage}
      alt=""
      className="size-full object-contain [image-rendering:pixelated]"
    />
  );

  const stage = (
    <span
      className={`@container relative grid aspect-square place-items-end justify-items-center pb-[16%] after:absolute after:inset-x-0 after:bottom-0 after:h-[22%] after:bg-white after:opacity-55 ${
        isDone ? STAGE_TONES[toneIndex % STAGE_TONES.length] : 'bg-surface-2'
      } ${canDecorate ? 'group-hover:shadow-[inset_0_0_0_2px_var(--color-brand-100)]' : ''}`}
    >
      <span
        aria-hidden="true"
        className="absolute bottom-[17%] left-1/2 z-[1] h-[7%] w-[46%] -translate-x-1/2 rounded-full bg-ink opacity-[0.08]"
      />
      {/* 실루엣 영역: 효과는 안쪽 span에만 걸어 "?"가 물려받지 않게 하고, cqw는 이 영역 폭 기준 */}
      <span
        aria-hidden="true"
        className="relative z-[2] aspect-square w-[62%] @container"
      >
        <span
          className={`grid size-full place-items-center ${
            isError ? 'opacity-55 grayscale' : ''
          } ${isNone || isGenerating ? 'opacity-[0.12] brightness-0' : ''}`}
        >
          {isDone ? (
            <FileImage
              src={src}
              pending={isPending}
              className="size-full object-contain [image-rendering:pixelated]"
              fallback={defaultCharacter}
            />
          ) : (
            defaultCharacter
          )}
        </span>
        {isNone && (
          <span className="absolute top-[41%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[46cqw] leading-none font-bold text-muted">
            ?
          </span>
        )}
      </span>
      {(isRep || isError || isGenerating) && (
        <span className="absolute top-3 left-3 z-[4] flex flex-col items-start gap-1">
          {isRep && <Badge tone="solid">대표</Badge>}
          {isError && <Badge tone="amber">오류 확인 중</Badge>}
          {isGenerating && <Badge tone="amber">만드는 중</Badge>}
        </span>
      )}
      {isOwn && isNone && (
        <span className="absolute inset-x-2 bottom-3 z-[5] @[180px]:inset-x-4">
          {/* 카드(무대) 폭이 좁으면 안쪽 여백·글자를 줄여 한 줄로 유지 */}
          <button
            type="button"
            onClick={() => onCreate(pet)}
            className={`${BTN_PRIMARY} h-9 w-full px-2! text-xs whitespace-nowrap @[180px]:px-3! @[180px]:text-sm @[240px]:px-4! @[240px]:text-base`}
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
