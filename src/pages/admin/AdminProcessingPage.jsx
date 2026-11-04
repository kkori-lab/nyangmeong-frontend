import { useSearchParams } from 'react-router-dom';
import CharacterJobPanel from '@/features/adminProcessing/CharacterJobPanel';
import OcrStatusPanel from '@/features/adminProcessing/OcrStatusPanel';
import PdfAnalysisPanel from '@/features/adminProcessing/PdfAnalysisPanel';
import {
  DEFAULT_TAB_KEY,
  findProcessingTab,
  PROCESSING_TABS,
} from '@/features/adminProcessing/processingLabels';
import AdminForbidden from './AdminForbidden';

/** 탭 키별 본문 */
const PANELS = {
  ocr: OcrStatusPanel,
  character: CharacterJobPanel,
  pdf: PdfAnalysisPanel,
};

/** 403 안내 */
const renderForbidden = (error) => <AdminForbidden message={error.message} />;

/**
 * [처리 현황]
 * - 탭은 ?tab=ocr|character|pdf, 없거나 모르면 영수증 OCR
 * - 탭을 바꾸면 그 탭의 필터·쪽 번호 초기화
 */
export default function AdminProcessingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = findProcessingTab(searchParams.get('tab'));
  const params = Object.fromEntries(searchParams);
  const Panel = PANELS[tab.key];

  /** 탭 키를 붙인 쿼리 */
  const withTab = (key, next = {}) =>
    key === DEFAULT_TAB_KEY ? next : { tab: key, ...next };

  const handleTabSelect = (nextKey) => setSearchParams(withTab(nextKey));
  const handleParamsChange = (next) => setSearchParams(withTab(tab.key, next));

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">처리 현황</h1>
      <div
        role="tablist"
        aria-label="처리 종류"
        className="mb-4 flex gap-1 overflow-x-auto shadow-[inset_0_-1px_0_var(--color-line)] [scrollbar-width:none]"
      >
        {PROCESSING_TABS.map(({ key, label }) => {
          const isSelected = key === tab.key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`relative h-12 shrink-0 px-4 text-base whitespace-nowrap ${
                isSelected
                  ? 'font-bold text-brand-900 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-brand-900'
                  : 'font-semibold text-subtle hover:text-ink'
              }`}
              onClick={() => handleTabSelect(key)}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">
        <Panel
          key={tab.key}
          params={params}
          onParamsChange={handleParamsChange}
          renderForbidden={renderForbidden}
        />
      </div>
    </div>
  );
}
