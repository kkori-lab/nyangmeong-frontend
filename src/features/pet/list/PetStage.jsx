import defaultCatCharacter from '@/assets/pets/default-character-cat-full.png';
import defaultDogCharacter from '@/assets/pets/default-character-dog-full.png';
import FileImage from '@/components/FileImage';
import { characterImageOptions } from '@/hooks/useCharacterImage';
import { useFileImage } from '@/hooks/useFileImage';
import { useFootBox } from '@/hooks/useFootBox';
import useMediaQuery from '@/hooks/useMediaQuery';
import { PET_SE } from '@/utils/petCodes';
import { useCharState } from '../queries';
import { CHRC_STTS } from '../shared/petCodes';
import { STAGE_TONES } from '../shared/stageTones';

/** 캐릭터 이미지 박스 폭 / 무대 폭(원본 PNG 여백 때문에 박스보다 실제 캐릭터가 작아 크게 잡는다) */
const CHARACTER_WIDTH = 0.8;
/** 모바일(970px 미만) 무대: 측정한 캐릭터 높이 / 무대 높이, 발 중심에서 가장 먼 끝까지 / 무대 폭(잘리지 않게 여유) */
const MOBILE_QUERY = '(max-width: 969.98px)';
const MOBILE_CHARACTER_HEIGHT = 0.7;
const MOBILE_MAX_REACH = 0.46;

/**
 * 그림자 크기·발 밑 겹침: 무대 폭 대비 비율. 캐릭터를 키워도 그림자는 그대로
 * (이미지 박스 52% 때 폭 105%, 높이 11.3%, 올림 2%)
 */
const SHADOW_WIDTH = 0.52 * 1.05;
const SHADOW_HEIGHT = 0.52 * 0.113;
const SHADOW_LIFT = 0.52 * 0.02;

/**
 * [슬라이드 캐릭터 무대]
 * - 반려동물 슬라이드 왼쪽 열의 둥근 사각형 안 전신 캐릭터 (캐릭터 목록 카드와 같은 이미지·배경색·그림자)
 * - 데스크톱: 오른쪽 정보 열 높이에 맞춰 늘어나는 칸. 안쪽은 absolute라 슬라이드 높이를 키우지 않는다
 * - 모바일(970px 미만): 84px 정사각형, 이름 블록 세로 가운데. 캐릭터는 실제 높이가 무대의 70%가 되게 키운다
 * - 그림자 중심(=발 중심)을 무대 가로 가운데에 두고 캐릭터를 그만큼 옮긴다. 캐릭터+그림자 묶음은 세로 가운데
 * - toneIndex: 캐릭터 목록에서의 순번(getStageToneIndex)
 */
export default function PetStage({
  petSn,
  petSeCd,
  isError,
  toneIndex,
  alt = '',
}) {
  const { src, isPending } = useFileImage(characterImageOptions(petSn, 'full'));
  /** 캐릭터 미생성·생성 중(완료 전)이면 목록 카드처럼 회색 바탕. 상태를 받기 전에는 순번 색 */
  const charState = useCharState(petSn);
  const isNotDone = charState != null && charState.status !== CHRC_STTS.DONE;
  const defaultImage =
    petSeCd === PET_SE.CAT ? defaultCatCharacter : defaultDogCharacter;
  const foot = useFootBox(isPending ? null : (src ?? defaultImage));

  /**
   * 모바일은 무대가 정사각형이라, 측정한 캐릭터 높이가 무대의 70%가 되게 박스를 키운다.
   * 발 중심에서 먼 쪽 끝이 무대 밖으로 잘리지 않게 폭 기준으로 제한. 측정 전·실패는 PC와 같은 폭
   */
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const boxWidth =
    isMobile && foot.measured
      ? Math.min(
          MOBILE_CHARACTER_HEIGHT / (foot.bottom - foot.top),
          MOBILE_MAX_REACH / Math.max(foot.x - foot.left, foot.right - foot.x),
        )
      : CHARACTER_WIDTH;

  /** 아래 값은 모두 이미지 박스(폭 boxWidth) 기준 비율 */
  const shadowWidth = SHADOW_WIDTH / boxWidth;
  const shadowHeight = SHADOW_HEIGHT / boxWidth;
  const shadowCenterY = foot.bottom - SHADOW_LIFT / boxWidth;
  const bundleBottom = shadowCenterY + shadowHeight / 2;
  const bundleCenterY = (foot.top + bundleBottom) / 2;
  const imageClass = `size-full object-contain [image-rendering:pixelated]${
    isError ? ' opacity-55 grayscale' : ''
  }`;

  return (
    <div
      className={`relative overflow-hidden rounded-card ${isNotDone ? 'bg-surface-2' : STAGE_TONES[toneIndex % STAGE_TONES.length]} max-[970px]:size-[84px] max-[970px]:self-center`}
    >
      <div
        className="absolute top-1/2 left-1/2 aspect-square"
        style={{
          width: `${boxWidth * 100}%`,
          transform: `translate(${-foot.x * 100}%, ${-bundleCenterY * 100}%)`,
        }}
      >
        <span
          aria-hidden="true"
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink opacity-[0.08]"
          style={{
            left: `${foot.x * 100}%`,
            top: `${shadowCenterY * 100}%`,
            width: `${shadowWidth * 100}%`,
            height: `${shadowHeight * 100}%`,
          }}
        />
        <FileImage
          src={src}
          alt={alt}
          pending={isPending}
          className={`relative ${imageClass}`}
          fallback={
            <img
              src={defaultImage}
              alt={alt}
              className={`relative ${imageClass}`}
            />
          }
        />
      </div>
    </div>
  );
}
