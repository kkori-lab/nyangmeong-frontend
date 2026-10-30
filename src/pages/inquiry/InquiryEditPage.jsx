import {
  generatePath,
  Link,
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom';
import PageSkeleton from '@/components/PageSkeleton';
import SkeletonCard from '@/components/SkeletonCard';
import { isAnswered } from '@/features/inquiry/api';
import InquiryForm from '@/features/inquiry/InquiryForm';
import {
  useInquiry,
  useInquiryTypes,
  useUpdateInquiry,
} from '@/features/inquiry/queries';
import { PATHS } from '@/routes/paths';

export default function InquiryEditPage() {
  const navigate = useNavigate();
  const otoInqrySn = Number(useParams().otoInqrySn);
  const inquiryQuery = useInquiry(otoInqrySn);
  const types = useInquiryTypes();
  const { data: inquiry } = inquiryQuery;
  const update = useUpdateInquiry();
  const loadError = inquiryQuery.error ?? types.error;
  const detailPath = generatePath(PATHS.INQUIRY_DETAIL, { otoInqrySn });

  if (inquiryQuery.isPending || types.isPending) {
    return (
      <PageSkeleton>
        <SkeletonCard className="h-[986px]" />
      </PageSkeleton>
    );
  }
  if (loadError) {
    return (
      <div role="alert" className="text-[#566465]">
        <p>{loadError.message}</p>
        <Link
          to={PATHS.INQUIRIES}
          className="mt-3 inline-block font-medium underline"
        >
          목록으로
        </Link>
      </div>
    );
  }

  /** 답변이 등록된 문의는 수정할 수 없다: 상세로 */
  if (isAnswered(inquiry)) return <Navigate to={detailPath} replace />;

  const handleSubmit = (values) =>
    update.mutate(
      { otoInqrySn, ...values },
      { onSuccess: () => navigate(detailPath) },
    );

  return (
    <InquiryForm
      key={otoInqrySn}
      mode="edit"
      types={types.data}
      initial={inquiry}
      cancelTo={detailPath}
      isPending={update.isPending}
      errorMessage={update.error?.message}
      fieldErrors={update.error?.fields}
      onSubmit={handleSubmit}
    />
  );
}
