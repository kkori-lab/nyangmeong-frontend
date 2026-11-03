import {
  Link,
  generatePath,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import PageSkeleton from '@/components/PageSkeleton';
import SkeletonCard from '@/components/SkeletonCard';
import LabInput from '@/features/health/labInput/LabInput';
import { useCheckupDetail } from '@/features/health/queries';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';

const TITLE = '검사 수치 입력';
const DESCRIPTION = '혈액검사 결과지의 수치를 확인하고 저장해요';

/** 없는 검진기록·반려동물, 양육하지 않는 반려동물은 모두 "찾을 수 없어요" */
const NOT_FOUND_CODES = [
  'CHECKUP_NOT_FOUND',
  'PET_NOT_FOUND',
  'PET_ACCESS_DENIED',
];

export default function LabInputPage() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { state } = useLocation();
  const petSn = Number(params.petSn);
  const sn = Number(params.ckupRcdSn);
  const {
    data: detail,
    isPending,
    isError,
    error,
  } = useCheckupDetail({
    petSn,
    ckupRcdSn: sn,
  });

  const requestedMode = searchParams.get('mode');
  const itemSn = Number(searchParams.get('item'));
  const atchSn = Number(searchParams.get('atch')) || null;
  const analyzedItems = state?.analyzedItems;

  const layoutProps = {
    section: 'health',
    menu: PATHS.HEALTH_DIARY,
    title: TITLE,
    description: DESCRIPTION,
  };

  if (isPending) {
    return (
      <SubPageLayout {...layoutProps}>
        <PageSkeleton>
          <SkeletonCard className="h-[573px]" />
        </PageSkeleton>
      </SubPageLayout>
    );
  }
  if (isError) {
    return (
      <SubPageLayout {...layoutProps}>
        <p role="alert" className="text-muted">
          {NOT_FOUND_CODES.includes(error?.code)
            ? '검진기록을 찾을 수 없어요'
            : '검진기록을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요'}
        </p>
      </SubPageLayout>
    );
  }

  const editItem =
    requestedMode === 'edit'
      ? detail.bloodInspections.find((item) => item.inspNvlSn === itemSn)
      : null;
  if (requestedMode === 'edit' && !editItem) {
    return (
      <SubPageLayout {...layoutProps}>
        <p role="alert" className="text-muted">
          수정할 검사 항목을 찾을 수 없어요
        </p>
        <Link
          to={generatePath(PATHS.HEALTH_CHECKUP_DETAIL, {
            petSn,
            ckupRcdSn: sn,
          })}
          className="mt-3 font-semibold text-brand-600 hover:underline hover:underline-offset-3"
        >
          검진상세로 돌아가기
        </Link>
      </SubPageLayout>
    );
  }

  /** PDF 분석 결과를 들고 왔거나 분석할 첨부가 있을 때만 분석 화면, 아니면 직접 입력 */
  const mode = editItem
    ? 'edit'
    : requestedMode !== 'manual' && (analyzedItems || atchSn)
      ? 'pdf'
      : 'manual';

  return (
    <SubPageLayout {...layoutProps}>
      <LabInput
        key={`${petSn}-${sn}-${mode}-${itemSn}`}
        petSn={petSn}
        ckupRcdSn={sn}
        mode={mode}
        detail={detail}
        editItem={editItem}
        analyzedItems={analyzedItems}
        atchSn={atchSn}
      />
    </SubPageLayout>
  );
}
