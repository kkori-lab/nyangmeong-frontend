import { Link, useLocation, useParams } from 'react-router-dom';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import InquiryAnswerForm from '@/features/adminInquiry/InquiryAnswerForm';
import InquiryCharacterError from '@/features/adminInquiry/InquiryCharacterError';
import InquiryDetailInfo from '@/features/adminInquiry/InquiryDetailInfo';
import InquiryHistory from '@/features/adminInquiry/InquiryHistory';
import InquiryImages from '@/features/adminInquiry/InquiryImages';
import { INQUIRY_TYPE_PIXEL_CHARACTER } from '@/features/adminInquiry/inquiryLabels';
import {
  useAdminInquiry,
  useAdminInquiryImageUrls,
} from '@/features/adminInquiry/queries';
import { PATHS } from '@/routes/paths';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

/** 버튼 줄 + 상세 + 첨부 + 답변 + 이력 자리 */
function InquiryDetailSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-10 w-24" />
      <SkeletonCard className="h-[290px]" />
      <SkeletonCard className="h-[130px]" />
      <SkeletonCard className="h-[260px]" />
      <SkeletonCard className="h-[100px]" />
    </div>
  );
}

/** 섹션 제목 */
function SectionTitle({ children }) {
  return <h2 className="mt-6 mb-3 text-lg font-bold text-ink">{children}</h2>;
}

/** 첨부 이미지가 있는 상세: 주소 묶음을 첨부·캐릭터가 같이 쓴다 */
function InquiryDetailBody({ inquiry }) {
  const urls = useAdminInquiryImageUrls(inquiry.otoInqrySn, inquiry.imgs);
  const isPixelCharacter = inquiry.inqryTypeCd === INQUIRY_TYPE_PIXEL_CHARACTER;

  return (
    <>
      <InquiryDetailInfo inquiry={inquiry} />
      <SectionTitle>첨부 이미지</SectionTitle>
      <InquiryImages imgs={inquiry.imgs} urls={urls} />
      {isPixelCharacter && (
        <>
          <SectionTitle>캐릭터 오류 처리</SectionTitle>
          <InquiryCharacterError
            inquiry={inquiry}
            imageUrl={urls[inquiry.charImgAtchFileSn]}
          />
        </>
      )}
      <SectionTitle>답변</SectionTitle>
      <InquiryAnswerForm key={inquiry.otoInqrySn} inquiry={inquiry} />
      <SectionTitle>상태 이력</SectionTitle>
      <InquiryHistory histories={inquiry.hstrys} />
    </>
  );
}

/**
 * [1:1 문의 상세]
 * - 미답변은 답변 등록, 답변 완료는 수정, 회원이 삭제한 문의는 조회만
 * - 잘못된 번호와 없는 문의는 같은 안내
 * - [목록으로]는 들어올 때의 필터 쿼리로 돌아간다
 */
export default function AdminInquiryDetailPage() {
  const { otoInqrySn: otoInqrySnParam } = useParams();
  const location = useLocation();
  const otoInqrySn = Number(otoInqrySnParam);
  const inquiry = useAdminInquiry(otoInqrySn);

  const listPath = location.state?.listSearch
    ? `${PATHS.ADMIN_INQUIRIES}${location.state.listSearch}`
    : PATHS.ADMIN_INQUIRIES;

  const handleRetry = () => inquiry.refetch();

  const renderBody = () => {
    if (
      !Number.isInteger(otoInqrySn) ||
      inquiry.error?.code === 'INQUIRY_NOT_FOUND'
    ) {
      return (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-[14px] border border-line bg-white py-16"
        >
          <p className="text-base text-subtle">문의를 찾을 수 없어요</p>
          <Link to={listPath} className={BTN_SECONDARY}>
            목록으로
          </Link>
        </div>
      );
    }
    if (inquiry.isPending) return <InquiryDetailSkeleton />;
    if (isForbiddenError(inquiry.error)) {
      return <AdminForbidden message={inquiry.error.message} />;
    }
    if (inquiry.isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-16">
          <p className="text-base text-subtle">문의를 불러오지 못했어요.</p>
          <button type="button" className={BTN_SECONDARY} onClick={handleRetry}>
            다시 시도
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="mb-4">
          <Link to={listPath} className={BTN_SECONDARY}>
            목록으로
          </Link>
        </div>
        <InquiryDetailBody inquiry={inquiry.data} />
      </>
    );
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">1:1 문의 상세</h1>
      {renderBody()}
    </div>
  );
}
