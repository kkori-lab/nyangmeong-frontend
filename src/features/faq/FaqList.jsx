import { ChevronDown, SearchX } from 'lucide-react';
import { useState } from 'react';
import BoardPagination from '@/components/BoardPagination';
import EmptyResult from '@/components/EmptyResult';
import SearchInput from '@/components/SearchInput';
import { FAQ_CATEGORIES } from './api';

const MARK_CLASS =
  'flex size-8 shrink-0 items-center justify-center rounded-full text-base leading-none font-bold text-[#1e4a4c] max-[760px]:size-7 max-[760px]:text-sm';

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
    <ul className="flex flex-col gap-3 max-[760px]:gap-2.5">
      {faqs.map((faq) => {
        const isOpen = openSet.has(faq.faqSn);
        return (
          <li
            key={faq.faqSn}
            className={`overflow-hidden rounded-[10px] border bg-white ${isOpen ? 'border-[#cde0e0]' : 'border-[#e2e7e7]'}`}
          >
            <h3>
              <button
                type="button"
                id={`faq-q-${faq.faqSn}`}
                aria-expanded={isOpen}
                aria-controls={`faq-a-${faq.faqSn}`}
                onClick={() => toggle(faq.faqSn)}
                className="group grid min-h-[72px] w-full cursor-pointer grid-cols-[32px_minmax(0,1fr)_24px] items-center gap-x-4 gap-y-1.5 px-10 py-[18px] text-left hover:bg-[#f4f6f6] max-[760px]:min-h-16 max-[760px]:grid-cols-[28px_minmax(0,1fr)_24px] max-[760px]:items-start max-[760px]:gap-x-2.5 max-[760px]:p-4"
              >
                <span
                  aria-hidden="true"
                  className={`${MARK_CLASS} bg-[#e9f2f2]`}
                >
                  Q
                </span>
                <span
                  className={`text-base leading-[1.3] font-semibold max-[760px]:pt-[3px] ${isOpen ? 'text-[#2f6f57]' : 'text-[#1a3234] group-hover:text-[#1e4a4c]'}`}
                >
                  {faq.qstnCn}
                </span>
                <ChevronDown
                  size={24}
                  aria-hidden="true"
                  className={`transition-transform max-[760px]:mt-0.5 ${isOpen ? 'rotate-180 text-[#2f6f57]' : 'text-[#667374]'}`}
                />
              </button>
            </h3>
            {isOpen && (
              <div
                id={`faq-a-${faq.faqSn}`}
                role="region"
                aria-labelledby={`faq-q-${faq.faqSn}`}
                className="grid grid-cols-[32px_minmax(0,1fr)] items-start gap-4 pt-1 pr-20 pb-7 pl-10 max-[760px]:grid-cols-[28px_minmax(0,1fr)] max-[760px]:gap-2.5 max-[760px]:px-4 max-[760px]:pt-0.5 max-[760px]:pb-5"
              >
                <span
                  aria-hidden="true"
                  className={`${MARK_CLASS} bg-[#f9eaa6]`}
                >
                  A
                </span>
                <p className="pt-[3px] text-base leading-[1.7] whitespace-pre-line text-[#1a3234] max-[760px]:pt-px">
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
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3 border-b border-[#b9c4c4] max-[760px]:mb-5 max-[760px]:flex-col-reverse max-[760px]:flex-nowrap max-[760px]:items-stretch max-[760px]:gap-4 max-[760px]:border-b-0">
        <div
          role="tablist"
          aria-label="질문 카테고리"
          className="flex max-[760px]:overflow-x-auto max-[760px]:border-b max-[760px]:border-[#b9c4c4] max-[760px]:[scrollbar-width:none]"
        >
          {['', ...FAQ_CATEGORIES].map((name) => {
            const isSelected = name === category;
            return (
              <button
                key={name || 'all'}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onCategoryChange(name)}
                className={`relative inline-flex h-[72px] shrink-0 cursor-pointer items-center px-4 text-lg whitespace-nowrap max-[760px]:h-12 ${isSelected ? 'font-bold text-[#2f6f57] after:absolute after:right-3 after:bottom-0 after:left-3 after:h-0.5 after:rounded-sm after:bg-[#2f6f57]' : 'font-semibold text-[#566465] hover:text-[#1a3234]'}`}
              >
                {name || '전체'}
              </button>
            );
          })}
        </div>
        <SearchInput
          value={input}
          onChange={setInput}
          onSubmit={() => onSearch(input.trim(), category)}
          placeholder="궁금한 내용을 검색해보세요"
          className="mb-4 w-[300px] max-[1280px]:w-60 max-[760px]:mb-0 max-[760px]:w-full"
        />
      </div>

      {content.length === 0 ? (
        <EmptyResult
          icon={<SearchX size={32} aria-hidden="true" />}
          title="찾는 질문이 없어요"
          description="다른 카테고리를 고르거나 검색어를 바꿔 보세요"
        >
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-[#e2e7e7] bg-white px-3 text-base font-semibold text-[#1a3234] hover:border-[#b9c4c4] hover:bg-[#f4f6f6]"
          >
            전체 질문 보기
          </button>
        </EmptyResult>
      ) : (
        <FaqItems key={`${category}|${keyword}|${page}`} faqs={content} />
      )}

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
