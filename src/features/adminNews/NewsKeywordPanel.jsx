import { X } from 'lucide-react';
import { useId, useState } from 'react';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import { showToast } from '@/components/toastStore';
import { NEWS_CATEGORIES } from './newsLabels';
import {
  useCreateAdminNewsKeyword,
  useDeleteAdminNewsKeyword,
} from './queries';

const INPUT_CLASS =
  'block h-10 min-w-0 flex-1 rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)] aria-invalid:border-danger';

/** 키워드 최대 글자 수 */
const MAX_KWRD_LENGTH = 50;

/** 카테고리 한 장: 키워드 칩 + 입력 줄 */
function KeywordCategoryCard({ category, keywords }) {
  const inputId = useId();
  const [kwrdCn, setKwrdCn] = useState('');
  const [inputError, setInputError] = useState('');

  const create = useCreateAdminNewsKeyword();
  const remove = useDeleteAdminNewsKeyword();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (create.isPending) return;
    const trimmed = kwrdCn.trim();
    if (!trimmed) {
      setInputError('키워드를 입력해 주세요');
      return;
    }
    const isDuplicate = keywords.some(
      (keyword) => keyword.kwrdCn.toLowerCase() === trimmed.toLowerCase(),
    );
    if (isDuplicate) {
      setInputError('이미 있는 키워드예요');
      return;
    }
    setInputError('');
    create.mutate(
      { mpngCd: category.code, kwrdCn: trimmed },
      {
        onSuccess: () => {
          setKwrdCn('');
          showToast('키워드를 추가했어요');
        },
        onError: (error) => setInputError(error.message),
      },
    );
  };

  const handleDelete = (keyword) =>
    remove.mutate(keyword.kwrdDictSn, {
      onSuccess: () => showToast('키워드를 삭제했어요'),
    });

  const deletingSn = remove.isPending ? remove.variables : null;

  return (
    <section className="rounded-[14px] border border-line bg-white p-5">
      <h2 className="mb-3 text-lg font-bold text-ink">
        {category.name}
        <span className="ml-1.5 text-sm font-semibold text-subtle tabular-nums">
          {keywords.length}
        </span>
      </h2>
      {keywords.length === 0 ? (
        <p className="mb-4 text-sm text-subtle">등록된 키워드가 없어요</p>
      ) : (
        <ul className="mb-4 flex flex-wrap gap-2">
          {keywords.map((keyword) => (
            <li
              key={keyword.kwrdDictSn}
              className="inline-flex h-8 items-center gap-1 rounded-full border border-line bg-surface-2 pr-1 pl-3 text-sm leading-[1.2] text-ink-2"
            >
              {keyword.kwrdCn}
              <button
                type="button"
                aria-label={`${keyword.kwrdCn} 삭제`}
                disabled={deletingSn === keyword.kwrdDictSn}
                className="inline-flex size-6 items-center justify-center rounded-full text-subtle hover:bg-line hover:text-ink disabled:opacity-40"
                onClick={() => handleDelete(keyword)}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {remove.isError && (
        <p role="alert" className="mb-3 text-sm text-danger">
          {remove.error.message}
        </p>
      )}
      <form noValidate onSubmit={handleSubmit}>
        <label htmlFor={inputId} className="sr-only">
          {category.name} 키워드
        </label>
        <div className="flex gap-2">
          <input
            id={inputId}
            type="text"
            value={kwrdCn}
            maxLength={MAX_KWRD_LENGTH}
            placeholder="키워드 입력"
            aria-invalid={Boolean(inputError)}
            aria-describedby={`${inputId}-error`}
            className={INPUT_CLASS}
            onChange={(event) => {
              setKwrdCn(event.target.value);
              setInputError('');
            }}
          />
          <button
            type="submit"
            className={`${BTN_PRIMARY} shrink-0`}
            disabled={create.isPending}
          >
            추가
          </button>
        </div>
        {inputError && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-danger">
            {inputError}
          </p>
        )}
      </form>
    </section>
  );
}

/**
 * [분류 키워드]
 * - 카테고리(건강·생활·정책·여행)마다 키워드 등록·삭제: 삭제는 확인 없이 바로
 * - 같은 카테고리 안 중복(대소문자 무시)·빈 값은 화면에서 막음
 */
export default function NewsKeywordPanel({ keywords }) {
  return (
    <>
      <p className="mb-4 text-sm text-subtle">
        수집한 기사 제목에 키워드가 있으면 그 카테고리로 분류해요. 여러 개면
        정렬 순서가 앞선 키워드를, 없으면 생활을 따라요.
      </p>
      <div className="grid gap-4 min-[761px]:grid-cols-2">
        {NEWS_CATEGORIES.map((category) => (
          <KeywordCategoryCard
            key={category.code}
            category={category}
            keywords={keywords.filter(
              (keyword) => keyword.mpngCd === category.code,
            )}
          />
        ))}
      </div>
    </>
  );
}
