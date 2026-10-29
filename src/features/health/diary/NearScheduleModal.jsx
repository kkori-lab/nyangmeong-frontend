import { useState } from 'react';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { formatDate, getDay, getMonth, getYmdOf } from '@/utils/formatDate';
import { CHECKUP_TYPES } from '../scheduleTypes';

/** "9/12" */
const formatMonthDaySlash = (ymd) => `${getMonth(ymd)}/${getDay(ymd)}`;

const findCheckupTypeNm = (cd) =>
  CHECKUP_TYPES.find((type) => type.cd === cd)?.nm;

/**
 * [가까운 예정 일정 확인 창] (FN-HLT-002-46)
 * - rows: [{ key, schedule }] 대상 일정이 있는 검진기록. 1건이면 버튼 두 개로 바로 정하고,
 *   여러 건이면 줄마다 [옮겨 연결하기]/[새 일정으로 저장하기]를 고른 뒤 저장
 * - ckupYmd: 검진일. onConfirm(moveByKey): { [key]: 옮겨 연결하면 true }
 * - ✕는 저장 없이 입력 화면으로 복귀
 */
export default function NearScheduleModal({
  rows,
  ckupYmd,
  isPending,
  onConfirm,
  onClose,
}) {
  const isSingle = rows.length === 1;
  const [moveByKey, setMoveByKey] = useState(() =>
    Object.fromEntries(rows.map((row) => [row.key, true])),
  );
  const movedLabel = `${formatMonthDaySlash(ckupYmd)}로 옮겨 연결하기`;

  const renderSchedule = (schedule) => (
    <>
      [병원]{' '}
      {formatDate(getYmdOf(schedule.schdlDt), {
        separator: '-',
        hasYear: false,
      })}{' '}
      · {schedule.petNm} · {findCheckupTypeNm(schedule.ckupTypeCd)} ·{' '}
      {schedule.hsptlNm}
    </>
  );

  const title = isSingle
    ? `${formatMonthDaySlash(getYmdOf(rows[0].schedule.schdlDt))} ${findCheckupTypeNm(rows[0].schedule.ckupTypeCd)} 일정이 있어요`
    : '가까운 예정 일정이 있어요';
  const description = isSingle
    ? `이 검진기록과 연결하고 일정을 ${formatMonthDaySlash(ckupYmd)}로 옮길까요?`
    : `검진기록마다 예정 일정을 ${formatMonthDaySlash(ckupYmd)}로 옮겨 연결할지 정해 주세요`;

  return (
    <Modal
      isConfirm
      title={title}
      description={description}
      isPending={isPending}
      onClose={onClose}
      footer={
        isSingle ? (
          <>
            <button
              type="button"
              className={BTN_SECONDARY}
              disabled={isPending}
              onClick={() => onConfirm({ [rows[0].key]: false })}
            >
              새 일정으로 저장하기
            </button>
            <button
              type="button"
              className={BTN_PRIMARY}
              disabled={isPending}
              onClick={() => onConfirm({ [rows[0].key]: true })}
            >
              {movedLabel}
            </button>
          </>
        ) : (
          <button
            type="button"
            className={BTN_PRIMARY}
            disabled={isPending}
            onClick={() => onConfirm(moveByKey)}
          >
            저장하기
          </button>
        )
      }
    >
      {isSingle ? (
        <p className="mt-4 rounded-[8px] bg-surface-2 px-3 py-2 text-ink-2 tabular-nums">
          {renderSchedule(rows[0].schedule)}
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3 text-left">
          {rows.map((row) => (
            <li
              key={row.key}
              className="rounded-[8px] border border-line px-3 py-3"
            >
              <p className="text-ink-2 tabular-nums">
                {renderSchedule(row.schedule)}
              </p>
              <div
                role="group"
                aria-label={`${row.schedule.petNm} 일정 연결 방법`}
                className="mt-2 grid grid-cols-2 gap-2"
              >
                {[
                  { isMove: true, label: movedLabel },
                  { isMove: false, label: '새 일정으로 저장하기' },
                ].map((option) => (
                  <button
                    key={String(option.isMove)}
                    type="button"
                    aria-pressed={moveByKey[row.key] === option.isMove}
                    disabled={isPending}
                    className={`h-9 rounded-md border px-2 text-sm font-semibold ${
                      moveByKey[row.key] === option.isMove
                        ? 'border-brand-100 bg-brand-50 text-brand-600'
                        : 'border-line bg-white text-ink-2 hover:bg-surface-2'
                    }`}
                    onClick={() =>
                      setMoveByKey((prev) => ({
                        ...prev,
                        [row.key]: option.isMove,
                      }))
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        aria-label="닫기 (저장하지 않음)"
        disabled={isPending}
        className="absolute top-3 right-3 grid size-8 place-items-center rounded-md text-subtle hover:bg-surface-2"
        onClick={onClose}
      >
        <Icon name="close" />
      </button>
    </Modal>
  );
}
