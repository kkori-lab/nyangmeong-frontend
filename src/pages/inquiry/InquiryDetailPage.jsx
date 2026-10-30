import { Link, useParams } from 'react-router-dom';
import PageSkeleton from '@/components/PageSkeleton';
import SkeletonCard from '@/components/SkeletonCard';
import InquiryDetail from '@/features/inquiry/InquiryDetail';
import { useInquiry } from '@/features/inquiry/queries';
import { PATHS } from '@/routes/paths';

export default function InquiryDetailPage() {
  const otoInqrySn = Number(useParams().otoInqrySn);
  const { data: inquiry, isPending, error } = useInquiry(otoInqrySn);

  if (isPending) {
    return (
      <PageSkeleton>
        <SkeletonCard className="h-[806px]" />
      </PageSkeleton>
    );
  }
  if (error) {
    return (
      <div role="alert" className="text-[#566465]">
        <p>{error.message}</p>
        <Link
          to={PATHS.INQUIRIES}
          className="mt-3 inline-block font-medium underline"
        >
          목록으로
        </Link>
      </div>
    );
  }

  return <InquiryDetail inquiry={inquiry} />;
}
