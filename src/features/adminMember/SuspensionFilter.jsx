import { useState } from 'react';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import Select from '@/components/Select';
import { SUSPENSION_TYPE_OPTIONS } from './memberLabels';

const INPUT_CLASS =
  'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)]';

const TYPE_OPTIONS = [{ value: '', label: '전체' }, ...SUSPENSION_TYPE_OPTIONS];

/**
 * [정지 회원 검색·필터]
 * - 닉네임·정지 종류, [검색]을 눌러야 적용
 */
export default function SuspensionFilter({ filter, onSearch }) {
  const [draft, setDraft] = useState(filter);

  /** 칸 하나 변경 */
  const setField = (name, value) =>
    setDraft((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch({ ...draft, q: draft.q.trim() });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-w-0 flex-1 flex-wrap items-center gap-2 max-[760px]:basis-full"
    >
      <div className="min-w-[200px] flex-1 max-[760px]:w-full max-[760px]:flex-none">
        <input
          type="search"
          aria-label="닉네임"
          placeholder="닉네임"
          value={draft.q}
          className={INPUT_CLASS}
          onChange={(event) => setField('q', event.target.value)}
        />
      </div>
      <Select
        label="정지 종류"
        placeholder="정지 종류: 전체"
        value={draft.type}
        options={TYPE_OPTIONS}
        className="w-44 max-[760px]:w-full"
        onChange={(value) => setField('type', value)}
      />
      <button type="submit" className={`${BTN_PRIMARY} max-[760px]:w-full`}>
        검색
      </button>
    </form>
  );
}
