import { useSearchParams } from 'react-router-dom';
import PageSkeleton from '@/components/PageSkeleton';
import Skeleton from '@/components/Skeleton';
import { FAQ_CATEGORIES } from '@/features/faq/api';
import FaqList from '@/features/faq/FaqList';
import { useFaqs } from '@/features/faq/queries';

const PAGE_SIZE = 10;

export default function FaqListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  /** 모르는 코드는 서버가 400을 주므로 전체로 본다 */
  const requestedCategory = searchParams.get('category') ?? '';
  const category = FAQ_CATEGORIES.some(
    ({ faqClsfCd }) => faqClsfCd === requestedCategory,
  )
    ? requestedCategory
    : '';
  const keyword = searchParams.get('keyword') ?? '';
  const {
    data: faqs,
    isPending,
    isError,
  } = useFaqs({ page, size: PAGE_SIZE, faqClsfCd: category, keyword });

  /** 분류·검색어가 바뀌면 첫 쪽부터 */
  const handleFilterChange = (nextKeyword, nextCategory) =>
    setSearchParams({
      ...(nextCategory && { category: nextCategory }),
      ...(nextKeyword && { keyword: nextKeyword }),
    });

  const handlePageChange = (nextPage) =>
    setSearchParams({
      ...(category && { category }),
      ...(keyword && { keyword }),
      page: nextPage,
    });

  if (isPending) {
    return (
      <PageSkeleton>
        <div
          aria-hidden="true"
          className="flex min-h-[72px] items-center justify-between gap-3 max-[760px]:flex-col max-[760px]:items-stretch"
        >
          <div className="flex gap-6">
            {[0, 1, 2, 3, 4].map((index) => (
              <Skeleton key={index} className="h-6 w-16" />
            ))}
          </div>
          <Skeleton className="h-12 w-[300px] max-[760px]:w-full" />
        </div>
        <div aria-hidden="true" className="flex flex-col gap-3">
          {Array.from({ length: 10 }, (_, index) => (
            <div
              key={index}
              className="flex h-[74px] items-center rounded-[14px] border border-[#e2e7e7] bg-white px-6"
            >
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
        <Skeleton className="mx-auto mt-7 h-9 w-64" />
      </PageSkeleton>
    );
  }
  if (isError) {
    return (
      <p role="alert" className="text-[#566465]">
        질문을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요
      </p>
    );
  }

  return (
    <FaqList
      key={`${category}|${keyword}`}
      faqs={faqs}
      category={category}
      keyword={keyword}
      onCategoryChange={(nextCategory) =>
        handleFilterChange(keyword, nextCategory)
      }
      onSearch={handleFilterChange}
      onPageChange={handlePageChange}
    />
  );
}
