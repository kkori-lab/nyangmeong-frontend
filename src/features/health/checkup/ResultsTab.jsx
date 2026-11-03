import { useState } from 'react';
import { ATTACHMENT_IMAGE, INSPECTION_KINDS } from './checkupTypes';
import BloodResultList from './BloodResultList';
import EtcResultList from './EtcResultList';
import ImagingResultList from './ImagingResultList';

/**
 * [검사 결과 탭]
 * - 혈액검사 · 영상검사 · 기타검사 칩과 종류별 건수, 처음 열면 혈액검사 선택 (FN-HLT-005-02)
 * - 영상검사 건수는 첨부 자료의 "영상 사진" 건수와 같음
 */
export default function ResultsTab({ detail, onGoAttachments }) {
  const [kind, setKind] = useState('blood');
  const { checkup, bloodInspections, etcInspections } = detail;
  const imagingAttachments = detail.attachments.filter(
    (attachment) => attachment.atchTypeCd === ATTACHMENT_IMAGE,
  );
  const counts = {
    blood: bloodInspections.length,
    img: imagingAttachments.length,
    etc: etcInspections.length,
  };

  return (
    <div className="px-[18px] pt-4 pb-[18px] sm:px-[22px] sm:pt-5 sm:pb-[22px]">
      <div
        role="group"
        aria-label="검사 종류"
        className="mb-5 flex flex-wrap gap-2"
      >
        {INSPECTION_KINDS.map((item) => {
          const isSelected = item.key === kind;
          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={isSelected}
              className={`inline-flex h-9 items-center rounded-full border px-3.5 ${
                isSelected
                  ? 'border-brand-100 bg-brand-50 font-semibold text-brand-600'
                  : 'border-line bg-white text-ink hover:bg-surface-2'
              }`}
              onClick={() => setKind(item.key)}
            >
              {item.nm} {counts[item.key]}
            </button>
          );
        })}
      </div>

      {kind === 'blood' && (
        <BloodResultList checkup={checkup} items={bloodInspections} />
      )}
      {kind === 'img' && (
        <ImagingResultList
          petSn={checkup.petSn}
          attachments={imagingAttachments}
          onGoAttachments={onGoAttachments}
        />
      )}
      {kind === 'etc' && (
        <EtcResultList
          petSn={checkup.petSn}
          ckupRcdSn={checkup.ckupRcdSn}
          etcInspections={etcInspections}
        />
      )}
    </div>
  );
}
