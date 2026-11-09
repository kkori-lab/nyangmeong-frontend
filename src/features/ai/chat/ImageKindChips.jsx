import { IMAGE_KIND } from '../api';

const KINDS = [
  [IMAGE_KIND.CHARACTER, '캐릭터'],
  [IMAGE_KIND.MEDICAL_RECEIPT, '진료 영수증'],
  [IMAGE_KIND.EXPENSE_RECEIPT, '가계부'],
];

/**
 * [사진 종류 칩]
 * - 첨부 사진의 의도를 모를 때 되묻기
 * - 누르면 메시지를 보내지 않고 그 종류의 흐름으로 간다
 */
export default function ImageKindChips({ isDisabled, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 pl-12">
      {KINDS.map(([kind, label]) => (
        <button
          key={kind}
          type="button"
          disabled={isDisabled}
          className="h-9 rounded-full border border-[#e2e7e7] bg-white px-4 text-base text-[#3d4a4b] enabled:hover:bg-[#f4f6f6] disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => onSelect(kind)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
