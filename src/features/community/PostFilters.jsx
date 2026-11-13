import Select from '@/components/Select';
import SearchInput from '@/components/SearchInput';
import { CheckOption, Chips } from './ListFilterParts';
import { POST_BOARDS } from './postCodes';

const SORT_OPTIONS = [
  { value: 'new', label: '최신순' },
  { value: 'hot', label: '인기순' },
];

/** 게시판 칩: 전체 + 게시판 이름. 값은 URL에 쓰는 게시판 이름('' = 전체) */
const BOARD_OPTIONS = [
  { value: '', label: '전체' },
  ...POST_BOARDS.map((item) => ({ value: item.name, label: item.name })),
];

/**
 * 펫이야기 필터: 첫 줄 왼쪽 게시판 칩(전체·펫정보·펫일상), 오른쪽 정렬 · 검색. 둘째 줄 왼쪽 「내 글만 보기」, 오른쪽 「총 N건」
 * - 초기화 버튼과 구분선은 없다. 760px 이하는 정렬·검색이 칩 아래 줄 전체 너비로 내려감
 * - search: { value, onChange, onSubmit } 검색창 입력값은 부모가 보관. totalElements가 숫자가 아니면 건수는 숨김
 */
export default function PostFilters({
  board,
  sort,
  mine,
  search,
  totalElements,
  onBoardChange,
  onSortChange,
  onMineChange,
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <Chips
          name="post-board"
          label="게시판"
          options={BOARD_OPTIONS}
          value={board}
          onChange={onBoardChange}
        />
        <div className="ml-auto flex items-center gap-2 max-[760px]:ml-0 max-[760px]:w-full">
          <Select
            size="xs"
            label="정렬 기준"
            value={sort}
            options={SORT_OPTIONS}
            onChange={onSortChange}
            className="w-[104px] shrink-0"
          />
          <SearchInput
            value={search.value}
            onChange={search.onChange}
            onSubmit={search.onSubmit}
            placeholder="제목 또는 내용 검색"
            compact
            className="w-[280px] max-[760px]:w-auto max-[760px]:min-w-0 max-[760px]:flex-1"
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <CheckOption checked={mine} onChange={onMineChange}>
          내 글만 보기
        </CheckOption>
        {typeof totalElements === 'number' && (
          <p aria-live="polite" className="text-sm text-muted">
            총 <b className="font-bold text-ink">{totalElements}</b>건
          </p>
        )}
      </div>
    </div>
  );
}
