import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { formatWon } from '../shared/expenseFormat';
import {
  CARD,
  CARD_BODY,
  CARD_HEAD,
  CARD_TITLE,
} from '../shared/expenseStyles';

/** 초기 노출 마릿수 */
const VISIBLE_PET_COUNT = 4;

export default function ExpensePetChart({ stats }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hiddenCount = stats.pets.length - VISIBLE_PET_COUNT;
  const visiblePets = isExpanded
    ? stats.pets
    : stats.pets.slice(0, VISIBLE_PET_COUNT);

  return (
    <section aria-labelledby="expense-pet-title" className={CARD}>
      <div className={CARD_HEAD}>
        <h2 id="expense-pet-title" className={CARD_TITLE}>
          반려동물별 지출
        </h2>
      </div>
      <div className={`${CARD_BODY} flex flex-col gap-4`}>
        <ul className="flex flex-col gap-4">
          {visiblePets.map((pet) => (
            <PetBar
              key={pet.petSn}
              label={pet.label}
              totalAmt={pet.totalAmt}
              ratio={pet.ratio}
            />
          ))}
        </ul>
        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            className="flex h-10 items-center justify-center gap-1 rounded-md border border-dashed border-line-strong bg-white font-semibold text-muted hover:border-brand-500 hover:text-brand-600"
          >
            {isExpanded ? '접기' : `더보기 (${hiddenCount}마리)`}
            <ChevronDown
              className={`size-4 ${isExpanded ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
        )}
        {stats.shared && (
          <ul>
            <PetBar
              label="공용"
              totalAmt={stats.shared.totalAmt}
              ratio={stats.shared.ratio}
            />
          </ul>
        )}
      </div>
    </section>
  );
}

function PetBar({ label, totalAmt, ratio }) {
  return (
    <li>
      <p className="mb-1 flex justify-between gap-2 text-sm">
        <span>{label}</span>
        <span className="text-subtle tabular-nums">
          {formatWon(totalAmt)} · {ratio}%
        </span>
      </p>
      <div
        role="img"
        aria-label={`${label} ${formatWon(totalAmt)} · ${ratio}%`}
        className="h-2.5 overflow-hidden rounded-full bg-surface-3"
      >
        <div className="h-full bg-brand-500" style={{ width: `${ratio}%` }} />
      </div>
    </li>
  );
}
