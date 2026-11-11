/**
 * [공용 셀렉트·날짜 피커 확인용 DEV 화면]
 * - DropdownSelect·DatePicker의 경우별 모양과 고른 값 확인 (SCR-COM-002 공용화)
 * - 브라우저 기본 select·날짜 입력을 두 컴포넌트로 바꾸는 작업이 끝나면 라우트와 함께 지움
 */
import { useState } from 'react';
import DatePicker from '@/components/DatePicker';
import DropdownSelect from '@/components/DropdownSelect';

const SPECIES_OPTIONS = [
  { value: 'DOG', label: '강아지' },
  { value: 'CAT', label: '고양이' },
];

const REGION_OPTIONS = [
  '서울특별시',
  '부산광역시',
  '대구광역시',
  '인천광역시',
  '광주광역시',
  '대전광역시',
  '울산광역시',
  '세종특별자치시',
  '경기도',
  '강원특별자치도',
  '충청북도',
  '충청남도',
  '전북특별자치도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주특별자치도',
].map((name) => ({ value: name, label: name }));

/** 한 경우: 이름 + 컨트롤 + 고른 값 */
function Case({ title, value, children }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm leading-tight font-semibold tracking-[-0.03em] text-[#3d4a4b]">
        {title}
      </span>
      {children}
      <span className="text-xs leading-tight tracking-[-0.01em] text-[#8c9899]">
        값: {value === '' ? '(빈 문자열)' : value}
      </span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg leading-tight font-bold tracking-[-0.03em] text-[#1a3234]">
        {title}
      </h2>
      <div className="grid gap-6 min-[761px]:grid-cols-2">{children}</div>
    </section>
  );
}

export default function FormControlsDevPage() {
  const [species, setSpecies] = useState('DOG');
  const [emptySpecies, setEmptySpecies] = useState('');
  const [region, setRegion] = useState('');
  const [date, setDate] = useState('2026-11-11');
  const [emptyDate, setEmptyDate] = useState('');
  const [rangeDate, setRangeDate] = useState('2026-11-10');

  return (
    <div className="flex flex-col gap-10 pb-20">
      <h1 className="text-xl leading-tight font-bold tracking-[-0.03em] text-[#1a3234]">
        셀렉트·날짜 피커 확인
      </h1>

      <Section title="셀렉트 (DropdownSelect)">
        <Case title="기본" value={species}>
          <DropdownSelect
            label="종"
            value={species}
            onChange={setSpecies}
            options={SPECIES_OPTIONS}
          />
        </Case>
        <Case title="placeholder (고르기 전)" value={emptySpecies}>
          <DropdownSelect
            label="종 선택"
            value={emptySpecies}
            onChange={setEmptySpecies}
            options={SPECIES_OPTIONS}
            placeholder="종을 선택해 주세요"
          />
        </Case>
        <Case title="disabled" value="DOG">
          <DropdownSelect
            label="종 (선택 불가)"
            value="DOG"
            onChange={() => {}}
            options={SPECIES_OPTIONS}
            disabled
          />
        </Case>
        <Case title="긴 목록 (17개)" value={region}>
          <DropdownSelect
            label="시·도"
            value={region}
            onChange={setRegion}
            options={REGION_OPTIONS}
            placeholder="시·도 선택"
          />
        </Case>
      </Section>

      <Section title="날짜 피커 (DatePicker)">
        <Case title="기본" value={date}>
          <DatePicker label="기본 날짜" value={date} onChange={setDate} />
        </Case>
        <Case title="빈 값" value={emptyDate}>
          <DatePicker
            label="빈 날짜"
            value={emptyDate}
            onChange={setEmptyDate}
          />
        </Case>
        <Case title="min 2026-11-01 · max 2026-11-20" value={rangeDate}>
          <DatePicker
            label="범위 날짜"
            value={rangeDate}
            onChange={setRangeDate}
            min="2026-11-01"
            max="2026-11-20"
          />
        </Case>
        <Case title="disabled" value="2026-11-11">
          <DatePicker
            label="날짜 (선택 불가)"
            value="2026-11-11"
            onChange={() => {}}
            disabled
          />
        </Case>
      </Section>
    </div>
  );
}
