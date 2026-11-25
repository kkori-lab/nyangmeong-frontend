import { ChevronDown, SearchX } from 'lucide-react';
import { useState } from 'react';
import BoardPagination from '@/components/BoardPagination';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import EmptyResult from '@/components/EmptyResult';
import SearchInput from '@/components/SearchInput';
import UnderlineTabs from '@/components/UnderlineTabs';
import { FAQ_CATEGORIES } from './api';

/** 탭 id `faq-category-<코드|all>`. 탭 패널은 고른 탭의 id, 탭 버튼은 `${id}-tab`(UnderlineTabs) */
const tabId = (faqClsfCd) => `faq-category-${faqClsfCd || 'all'}`;

const TABS = [{ faqClsfCd: '', label: '전체' }, ...FAQ_CATEGORIES].map(
  ({ faqClsfCd, label }) => ({ id: tabId(faqClsfCd), faqClsfCd, label }),
);

const MARK_CLASS =
  'flex size-8 shrink-0 items-center justify-center rounded-full text-base leading-none font-bold text-brand-600 max-[760px]:size-7 max-[760px]:text-sm';

/** 펼침 상태는 항목별로 따로 보관. 쪽·분류·검색이 바뀌면 부모가 key로 새로 그려 모두 접힘 */
function FaqItems({ faqs }) {
  const [openSet, setOpenSet] = useState(() => new Set());

  const toggle = (faqSn) =>
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (!next.delete(faqSn)) next.add(faqSn);
      return next;
    });

  return (
    <ul className="flex flex-col gap-3 max-[760px]:gap-3">
      {faqs.map((faq) => {
        const isOpen = openSet.has(faq.faqSn);
        return (
          <li
            key={faq.faqSn}
            className={`overflow-hidden rounded-[10px] border bg-white ${isOpen ? 'border-brand-100' : 'border-line'}`}
          >
            <h3>
              <button
                type="button"
                id={`faq-q-${faq.faqSn}`}
                aria-expanded={isOpen}
                aria-controls={`faq-a-${faq.faqSn}`}
                onClick={() => toggle(faq.faqSn)}
                className="group grid min-h-[72px] w-full cursor-pointer grid-cols-[32px_minmax(0,1fr)_24px] items-center gap-x-4 gap-y-2 px-10 py-5 text-left hover:bg-surface-2 max-[760px]:min-h-16 max-[760px]:grid-cols-[28px_minmax(0,1fr)_24px] max-[760px]:items-start max-[760px]:gap-x-3 max-[760px]:p-4"
              >
                <span
                  aria-hidden="true"
                  className={`${MARK_CLASS} bg-brand-50`}
                >
                  Q
                </span>
                <span
                  className={`text-base leading-[1.3] font-semibold max-[760px]:pt-1 ${isOpen ? 'text-ok' : 'text-ink group-hover:text-brand-600'}`}
                >
                  {faq.qstnTtl}
                </span>
                <ChevronDown
                  size={24}
                  aria-hidden="true"
                  className={`transition-transform max-[760px]:mt-1 ${isOpen ? 'rotate-180 text-ok' : 'text-subtle'}`}
                />
              </button>
            </h3>
            {isOpen && (
              <div
                id={`faq-a-${faq.faqSn}`}
                role="region"
                aria-labelledby={`faq-q-${faq.faqSn}`}
                className="grid grid-cols-[32px_minmax(0,1fr)] items-start gap-4 pt-1 pr-20 pb-7 pl-10 max-[760px]:grid-cols-[28px_minmax(0,1fr)] max-[760px]:gap-3 max-[760px]:px-4 max-[760px]:pb-5"
              >
                <span
                  aria-hidden="true"
                  className={`${MARK_CLASS} bg-accent-300`}
                >
                  A
                </span>
                <p className="pt-1 text-base leading-[1.7] whitespace-pre-line text-ink">
                  {faq.ansCn}
                </p>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function FaqList({
  faqs,
  category,
  keyword,
  onCategoryChange,
  onSearch,
  onPageChange,
}) {
  const [input, setInput] = useState(keyword);
  const { content, page, totalPages } = faqs;

  const handleReset = () => {
    setInput('');
    onSearch('', '');
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b border-line max-[760px]:mb-5 max-[760px]:flex-col-reverse max-[760px]:flex-nowrap max-[760px]:items-stretch max-[760px]:gap-4 max-[760px]:border-b-0">
        <UnderlineTabs
          items={TABS}
          activeId={tabId(category)}
          onSelect={(id) =>
            onCategoryChange(TABS.find((tab) => tab.id === id).faqClsfCd)
          }
          label="질문 카테고리"
          isLineHidden
          isScrollable
          className="max-[760px]:border-b max-[760px]:border-line"
        />
        <SearchInput
          value={input}
          onChange={setInput}
          onSubmit={() => onSearch(input.trim(), category)}
          placeholder="궁금한 내용을 검색해보세요"
          className="mb-1 w-[300px] max-[1100px]:w-60 max-[760px]:mb-0 max-[760px]:w-full"
        />
      </div>

      <div
        id={tabId(category)}
        role="tabpanel"
        aria-labelledby={`${tabId(category)}-tab`}
      >
        {content.length === 0 ? (
          <EmptyResult
            icon={<SearchX size={32} aria-hidden="true" />}
            title="검색 결과가 없어요"
            description="검색어나 필터를 바꿔 다시 찾아보세요"
          >
            <button
              type="button"
              onClick={handleReset}
              className={BTN_SECONDARY}
            >
              전체 질문 보기
            </button>
          </EmptyResult>
        ) : (
          <FaqItems key={`${category}|${keyword}|${page}`} faqs={content} />
        )}
      </div>

      <div className="mt-12 max-[760px]:mt-8">
        <BoardPagination
          page={page}
          totalPages={totalPages}
          onChange={onPageChange}
        />
      </div>
    </div>
  );
}
