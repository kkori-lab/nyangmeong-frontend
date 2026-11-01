import FileImage from '@/components/FileImage';
import { useFileImage } from '@/hooks/useFileImage';
import { healthKeys } from '../queries';

/**
 * [관찰 회차 사진]
 * - 비공개 파일이라 GET /pets/{petSn}/observation-cycles/{obsrvCyclSn}/photo를 blob으로 받아 그린다(원본 하나, 썸네일 없음)
 * - 등록·삭제·종료 때는 다시 받지 않고, 사진을 바꾼 회차 수정 때만 다시 받는다(useUpdateObservationCycle)
 */
export default function ObservationPhoto({
  petSn,
  obsrvCyclSn,
  className,
  fallback,
}) {
  const { src, isPending } = useFileImage({
    queryKey: healthKeys.observationPhoto(petSn, obsrvCyclSn),
    url: `/pets/${petSn}/observation-cycles/${obsrvCyclSn}/photo`,
    enabled: petSn != null && obsrvCyclSn != null,
  });

  return (
    <FileImage
      src={src}
      pending={isPending}
      className={className}
      fallback={fallback}
    />
  );
}
