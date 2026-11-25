import { FileX } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import EmptyResult from '@/components/EmptyResult';
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
  /** 남의 문의·없는 문의: 서버 문구를 결과 없음 박스로 */
  if (error) {
    return (
      <div role="alert">
        <EmptyResult
          isUnified
          icon={<FileX size={32} aria-hidden="true" />}
          title={error.message}
        >
          <Link to={PATHS.INQUIRIES} className={BTN_SECONDARY}>
            1:1 문의 목록으로
          </Link>
        </EmptyResult>
      </div>
    );
  }

  return <InquiryDetail inquiry={inquiry} />;
}
