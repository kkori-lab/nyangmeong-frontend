/** 필수 입력 라벨 뒤 * 표시 (반려동물 등록 모달과 같은 모양) */
export function Required() {
  return (
    <>
      <span aria-hidden="true" className="ml-0.5 font-bold text-danger">
        *
      </span>
      <span className="sr-only">필수</span>
    </>
  );
}

/**
 * [저장]이 막혀 있을 때 빠진 항목 안내
 * missing: 화면 순서대로 모은 항목 이름, isFutureYmd: 오늘 이후 날짜
 */
export function MissingNotice({ missing, isFutureYmd }) {
  if (missing.length === 0 && !isFutureYmd) return null;
  return (
    <div role="status" className="flex flex-col gap-1 text-sm text-muted">
      {missing.length > 0 && <p>{missing.join('·')} 입력이 필요해요</p>}
      {isFutureYmd && <p>오늘 이후 날짜는 저장할 수 없어요</p>}
    </div>
  );
}
