import { useEffect, useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';
import DropdownSelect from '@/components/DropdownSelect';
import DatePicker from '@/components/DatePicker';
import Icon from '@/components/Icon';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import { getTodayYmd, getYmdOf } from '@/utils/formatDate';
import {
  OBSERVATION_CHANGES,
  OBSERVATION_PARTS,
  PHOTO_EXTENSIONS,
  PHOTO_MAX_BYTES,
} from '../diaryTypes';
import {
  useCreateObservationCycle,
  useCreateObservationItem,
  useUpdateObservationCycle,
} from '../queries';
import {
  DECIMAL_MESSAGE,
  hasOverTwoDecimals,
  toInputText,
} from '../numberFormat';
import FieldError, { Required } from '@/components/FieldError';
import FormModal from './FormModal';
import { INPUT, LABEL, TEXTAREA } from '@/components/formStyles';
import ObservationPhoto from './ObservationPhoto';
import { formatPart } from './observationUtils';
import FieldFoot from '@/components/FieldFoot';

const MAX_ITEM_NAME_LENGTH = 40;
const MAX_PART_DETAIL_LENGTH = 40;
const MAX_MEMO_LENGTH = 200;
/** 사진 칸 안 사진: 칸 높이에 맞추고 폭은 사진 비율대로 (※신규 정책, 2026-11-23) */
const PHOTO_IMG = 'h-full w-auto max-w-full object-contain';

const REQUIRED = <Required />;
const OPTIONAL = (
  <span className="ml-1 text-[13px] font-medium text-subtle">선택</span>
);

const getModalTitle = (mode, item, cycles, cycle) => {
  if (mode === 'A') return '관찰 항목 추가';
  if (mode === 'B')
    return `${item.obsrvArtclNm} · ${cycles.length + 1}회차 추가`;
  return `${item.obsrvArtclNm} · ${cycle.cyclNo}회차 수정`;
};

/**
 * [관찰 기록 등록 모달]
 * - mode A: 새 관찰 항목 + 1회차 / B: 선택 항목에 회차 추가(항목명·부위 고정) / E: 선택 회차 수정
 * - 사진은 필수(jpg·jpeg·png·webp, 10MB 이하). 수정에서는 새로 고른 때만 바꾼다. 고른 사진은 브라우저 임시 주소로 미리 본다
 */
export default function ObservationModal({
  mode,
  petSn,
  item,
  cycles,
  cycle,
  onSaved,
  onClose,
}) {
  const isCreateItem = mode === 'A';
  const isEdit = mode === 'E';
  const isFirstCycle = isCreateItem || cycle?.cyclNo === 1;

  const [name, setName] = useState(item?.obsrvArtclNm ?? '');
  const [partCd, setPartCd] = useState('');
  const [partDetail, setPartDetail] = useState('');
  const [obsrvYmd, setObsrvYmd] = useState(
    cycle ? getYmdOf(cycle.obsrvDt) : getTodayYmd(),
  );
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [size, setSize] = useState(toInputText(cycle?.obsrvSz));
  const [chgCd, setChgCd] = useState(cycle?.obsrvChgCd ?? '');
  const [memo, setMemo] = useState(cycle?.memoCn ?? '');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const cameraRef = useRef(null);
  const albumRef = useRef(null);
  /** 이 모달에서 만든 임시 주소. 닫을 때 해제 */
  const previewRef = useRef(null);

  const createItem = useCreateObservationItem();
  const createCycle = useCreateObservationCycle();
  const updateCycle = useUpdateObservationCycle();
  const isPending =
    createItem.isPending || createCycle.isPending || updateCycle.isPending;

  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );

  const today = getTodayYmd();
  const errors = {
    name: isCreateItem && name.trim() === '',
    part: isCreateItem && partCd === '',
    date: obsrvYmd === '' || obsrvYmd > today,
    photo: file === null && !isEdit,
    /** 폼이 noValidate라 step이 막지 못해 코드로 검사 */
    size: hasOverTwoDecimals(size),
  };
  const hasError = Object.values(errors).some(Boolean);
  const isInvalid = (field) => isSubmitted && errors[field];

  const handleFile = (event) => {
    const [picked] = event.target.files;
    event.target.value = '';
    if (!picked) return;
    const extension = picked.name.split('.').pop().toLowerCase();
    if (
      !PHOTO_EXTENSIONS.includes(extension) ||
      !picked.type.startsWith('image/')
    ) {
      setPhotoError('jpg·jpeg·png·webp 형식만 올릴 수 있어요');
      return;
    }
    if (picked.size > PHOTO_MAX_BYTES) {
      setPhotoError('사진은 10MB 이하만 올릴 수 있어요');
      return;
    }
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = URL.createObjectURL(picked);
    setFile(picked);
    setPreviewUrl(previewRef.current);
    setPhotoError('');
  };

  const handleSaved = (result) => {
    onSaved(result);
    onClose();
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (hasError) return;
    const options = { onSuccess: handleSaved };
    if (isCreateItem) {
      createItem.mutate(
        {
          petSn,
          obsrvArtclNm: name.trim(),
          obsrvRegnCd: partCd,
          obsrvRegnDtlNm: partDetail.trim(),
          file,
          obsrvYmd,
          obsrvSz: size,
          memoCn: memo.trim(),
        },
        options,
      );
    } else if (isEdit) {
      updateCycle.mutate(
        {
          petSn,
          obsrvCyclSn: cycle.obsrvCyclSn,
          cycle,
          isFirstCycle,
          file,
          obsrvYmd,
          obsrvSz: size,
          obsrvChgCd: chgCd,
          memoCn: memo.trim(),
        },
        options,
      );
    } else {
      createCycle.mutate(
        {
          petSn,
          obsrvArtclSn: item.obsrvArtclSn,
          file,
          obsrvYmd,
          obsrvSz: size,
          obsrvChgCd: chgCd,
          memoCn: memo.trim(),
        },
        options,
      );
    }
  };

  return (
    <FormModal
      title={getModalTitle(mode, item, cycles, cycle)}
      submitLabel={isEdit ? '저장하기' : '등록하기'}
      isPending={isPending}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      {/* 회차 추가·수정의 관찰 항목·부위는 고칠 수 없어 disabled 회색 칸(변화 「1회차는 비교 없음」과 같은 모양). 저장 때 보내지 않음 (※신규 정책, 2026-11-23) */}
      <label className="flex flex-col gap-1.5">
        <span className={LABEL}>관찰 항목{REQUIRED}</span>
        <input
          value={name}
          disabled={!isCreateItem}
          maxLength={MAX_ITEM_NAME_LENGTH}
          aria-invalid={isInvalid('name')}
          className={INPUT}
          onChange={(event) => setName(event.target.value)}
        />
        <FieldFoot
          value={name}
          max={isCreateItem ? MAX_ITEM_NAME_LENGTH : undefined}
          error={isInvalid('name') && '관찰 항목을 입력해 주세요'}
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <span id="obsv-part-label" className={LABEL}>
          관찰 부위{REQUIRED}
        </span>
        {isCreateItem ? (
          <div className="grid grid-cols-2 items-start gap-x-4">
            <DropdownSelect
              label="관찰 부위"
              value={partCd}
              invalid={isInvalid('part')}
              placeholder="대분류 선택"
              options={OBSERVATION_PARTS.map((part) => ({
                value: part.cd,
                label: part.nm,
              }))}
              onChange={setPartCd}
            />
            <div className="flex flex-col gap-1.5">
              <input
                value={partDetail}
                maxLength={MAX_PART_DETAIL_LENGTH}
                placeholder="세부 위치 (선택)"
                aria-label="세부 위치 (선택)"
                className={INPUT}
                onChange={(event) => setPartDetail(event.target.value)}
              />
              <FieldFoot value={partDetail} max={MAX_PART_DETAIL_LENGTH} />
            </div>
          </div>
        ) : (
          <input
            disabled
            aria-labelledby="obsv-part-label"
            value={formatPart(item)}
            className={INPUT}
          />
        )}
        {isInvalid('part') && (
          <FieldError>관찰 부위를 선택해 주세요</FieldError>
        )}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={LABEL}>관찰일{REQUIRED}</span>
        <DatePicker
          value={obsrvYmd}
          max={today}
          invalid={isInvalid('date')}
          onChange={setObsrvYmd}
        />
        {isInvalid('date') && (
          <FieldError>오늘 이후 날짜는 고를 수 없어요</FieldError>
        )}
      </label>

      <div className="rounded-xl bg-surface-2 p-4">
        <span className={LABEL}>사진{REQUIRED}</span>
        {/* 사진 칸 높이 고정(760px 이상 h-40, 미만 h-36)·폭은 사진 비율, 버튼은 사진 오른쪽에 세로로 (※신규 정책, 2026-11-23) */}
        <div className="mt-2 flex flex-wrap items-end gap-3">
          {previewUrl || isEdit ? (
            <div className="inline-flex h-36 max-w-full overflow-hidden min-[760px]:h-40 rounded-[10px] border border-line bg-surface-2">
              {previewUrl ? (
                <img src={previewUrl} alt="선택한 사진" className={PHOTO_IMG} />
              ) : (
                <ObservationPhoto
                  petSn={petSn}
                  obsrvCyclSn={cycle.obsrvCyclSn}
                  className={`${PHOTO_IMG} min-w-10`}
                  fallback={
                    <span className="grid aspect-square h-full place-items-center text-placeholder">
                      <ImageOff className="size-6" aria-hidden="true" />
                    </span>
                  }
                />
              )}
            </div>
          ) : (
            <div className="grid size-36 place-items-center rounded-[10px] border border-dashed border-line-strong bg-white text-subtle min-[760px]:size-40">
              <span className="flex flex-col items-center gap-1">
                <Icon name="image" className="text-[28px]" />
                사진 미리보기
              </span>
            </div>
          )}
          <div className="flex flex-col gap-2">
            {/* [촬영하기]는 1100px 미만(휴대폰·태블릿)에서만 (※신규 정책, 2026-11-23) */}
            <button
              type="button"
              className={`${BTN_SECONDARY} min-[1100px]:hidden`}
              onClick={() => cameraRef.current.click()}
            >
              <Icon name="photo_camera" />
              촬영하기
            </button>
            <button
              type="button"
              className={`${BTN_SECONDARY}`}
              onClick={() => albumRef.current.click()}
            >
              <Icon name="photo_library" />
              앨범에서 선택
            </button>
          </div>
        </div>
        {isEdit && (
          <p className="mt-2 text-[13px] font-medium text-subtle">
            사진은 바꿀 수만 있어요
          </p>
        )}
        <input
          ref={cameraRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          hidden
          onChange={handleFile}
        />
        <input
          ref={albumRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={handleFile}
        />
        {(photoError || isInvalid('photo')) && (
          <FieldError>{photoError || '사진을 등록해 주세요'}</FieldError>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4">
        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>크기{OPTIONAL}</span>
          <span className="relative block">
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={size}
              placeholder="선택 입력"
              className={`${INPUT} pr-12 tabular-nums`}
              onChange={(event) => setSize(event.target.value)}
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted">
              mm
            </span>
          </span>
          {isInvalid('size') && <FieldError>{DECIMAL_MESSAGE}</FieldError>}
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>변화{OPTIONAL}</span>
          {isFirstCycle ? (
            <input
              disabled
              value="1회차는 비교 없음"
              aria-label="변화 (1회차는 비교 없음)"
              className={INPUT}
            />
          ) : (
            <DropdownSelect
              value={chgCd}
              options={[
                { value: '', label: '선택 안 함' },
                ...OBSERVATION_CHANGES.map((change) => ({
                  value: change.cd,
                  label: change.nm,
                })),
              ]}
              onChange={setChgCd}
            />
          )}
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={LABEL}>메모{OPTIONAL}</span>
        <textarea
          value={memo}
          maxLength={MAX_MEMO_LENGTH}
          placeholder="선택 입력"
          className={TEXTAREA}
          onChange={(event) => setMemo(event.target.value)}
        />
        <FieldFoot value={memo} max={MAX_MEMO_LENGTH} />
      </label>
    </FormModal>
  );
}
