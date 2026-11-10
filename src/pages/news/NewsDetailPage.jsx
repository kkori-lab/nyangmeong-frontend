import { FileX } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import EmptyResult from '@/components/EmptyResult';
import NewsDetail from '@/features/news/NewsDetail';
import { useNews } from '@/features/news/queries';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';
import SkeletonCard from '@/components/SkeletonCard';

const DESCRIPTION = '반려생활에 도움이 되는 소식을 언론사에서 모아 전해 드려요';

/** 로딩 자리: 기사 카드 + 오른쪽 최신 뉴스 레일(실제 상세와 같은 배치·높이) */
function NewsDetailSkeleton() {
  return (
    <div
      aria-busy="true"
      className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-8 max-[1100px]:grid-cols-1 max-[1100px]:gap-10"
    >
      <SkeletonCard className="h-[970px] max-[760px]:h-[930px]" />
      <SkeletonCard className="h-[399px]" />
    </div>
  );
}

export default function NewsDetailPage() {
  const newsSn = Number(useParams().newsSn);
  const { data: news, isPending, isError } = useNews(newsSn);

  let body;
  if (isPending) {
    body = <NewsDetailSkeleton />;
  } else if (isError) {
    body = (
      <div role="alert">
        <EmptyResult
          icon={<FileX size={32} aria-hidden="true" />}
          title="뉴스를 찾지 못했어요"
          description="삭제되었거나 주소가 잘못되었을 수 있어요"
        >
          <Link
            to={PATHS.COMMUNITY_NEWS}
            className="inline-flex h-9 items-center rounded-md border border-line bg-white px-3 text-sm font-medium text-ink hover:bg-surface-2"
          >
            펫뉴스 목록으로
          </Link>
        </EmptyResult>
      </div>
    );
  } else {
    body = <NewsDetail key={news.newsSn} news={news} />;
  }

  /** 상세 제목은 '상세보기'가 아니라 메뉴 이름이라 title을 넘기지 않는다. 「목록으로」는 본문 하단 */
  return (
    <SubPageLayout
      section="community"
      menu={PATHS.COMMUNITY_NEWS}
      back={false}
      description={DESCRIPTION}
    >
      {body}
    </SubPageLayout>
  );
}
