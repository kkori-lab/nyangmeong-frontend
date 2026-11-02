import { useState } from 'react';
import { getInspectionName } from '../summaryApi';
import LabResultCard from './LabResultCard';
import LabTrendCard from './LabTrendCard';

/** 최근 검사의 항목 순서 뒤에 그 밖의 등록 항목 */
const getItemNames = (lab, trends) => {
  const latest = lab ? lab.items.map(getInspectionName) : [];
  return [...new Set([...latest, ...Object.keys(trends)])];
};

/**
 * [검사 · 수치 영역]
 * - ⑥ 검사 결과 행을 누르면 ⑦ 검사 수치 추이의 조회 항목이 그 항목으로 바뀜 (화면 이동 없음)
 * - 처음 항목은 ?inspection= 값(검진상세에서 들어옴)이 등록된 항목이면 그 항목,
 *   아니면 기록이 2건 이상이라 그래프가 그려지는 첫 항목, 그런 항목이 없으면 첫 번째 항목 (명세 v1.1)
 * - 반려동물이 바뀌면 key로 다시 만들어 처음 항목으로 돌아옴
 */
export default function LabSection({ lab, trends, initialItemNm }) {
  const itemNames = getItemNames(lab, trends);
  const [selectedNm, setSelectedNm] = useState(() => {
    if (itemNames.includes(initialItemNm)) return initialItemNm;
    const graphNm = itemNames.find((nm) => trends[nm]?.points.length >= 2);
    return graphNm ?? itemNames[0];
  });

  return (
    <div className="grid items-stretch gap-5 min-[1101px]:grid-cols-2">
      <LabResultCard
        lab={lab}
        selectedNm={selectedNm}
        onSelect={setSelectedNm}
      />
      <LabTrendCard
        trends={trends}
        itemNames={itemNames}
        selectedNm={selectedNm}
        onSelect={setSelectedNm}
      />
    </div>
  );
}
