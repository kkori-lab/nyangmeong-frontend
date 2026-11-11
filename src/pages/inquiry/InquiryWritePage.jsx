import {
  generatePath,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import PageSkeleton from '@/components/PageSkeleton';
import SkeletonCard from '@/components/SkeletonCard';
import { INQUIRY_TYPE_PIXEL_CHARACTER } from '@/features/inquiry/api';
import InquiryForm from '@/features/inquiry/InquiryForm';
import { useCreateInquiry, useInquiryTypes } from '@/features/inquiry/queries';
import { useCharacterImage } from '@/hooks/useCharacterImage';
import { PATHS } from '@/routes/paths';

/**
 * 문의 유형 미리 선택
 * - 픽셀 캐릭터 화면의 문의 링크(state.inquiryType === 'PIXEL_CHARACTER')
 * - ?type=에 유형 코드나 이름이 오면 그 유형
 */
const findPresetType = (types, state, typeParam) => {
  const code =
    state?.inquiryType === 'PIXEL_CHARACTER'
      ? INQUIRY_TYPE_PIXEL_CHARACTER
      : typeParam;
  return (
    types.find((type) => type.comCd === code || type.comCdNm === code)?.comCd ??
    ''
  );
};

export default function InquiryWritePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const types = useInquiryTypes();
  const { mutate, isPending, error } = useCreateInquiry();
  /** 캐릭터 화면에서 넘어왔으면 자동 첨부될 캐릭터 이미지(미리보기). 새로고침해도 보이게 번호로 다시 받는다 */
  const characterImage = useCharacterImage(
    state?.pixelCharSn != null ? state.petSn : null,
    'full',
  );

  if (types.isPending) {
    return (
      <PageSkeleton>
        <SkeletonCard className="h-[986px]" />
      </PageSkeleton>
    );
  }
  if (types.isError) {
    return (
      <p role="alert" className="text-[#566465]">
        {types.error.message}
      </p>
    );
  }

  /** 캐릭터 화면에서 넘겨받은 pixelCharSn은 유형이 픽셀 캐릭터 그대로일 때만 보낸다 */
  const handleSubmit = (values) =>
    mutate(
      values.inqryTypeCd === INQUIRY_TYPE_PIXEL_CHARACTER
        ? { ...values, pixelCharSn: state?.pixelCharSn }
        : values,
      {
        onSuccess: ({ otoInqrySn }) =>
          navigate(generatePath(PATHS.INQUIRY_DETAIL, { otoInqrySn })),
      },
    );

  return (
    <InquiryForm
      mode="write"
      types={types.data}
      initial={{
        inqryTypeCd: findPresetType(
          types.data,
          state,
          searchParams.get('type'),
        ),
        inqryTtl: '',
        inqryCn: '',
        imgs: [],
      }}
      cancelTo={PATHS.INQUIRIES}
      isPending={isPending}
      errorMessage={error?.message}
      fieldErrors={error?.fields}
      characterLinked={state?.pixelCharSn != null}
      characterImage={characterImage}
      onSubmit={handleSubmit}
    />
  );
}
