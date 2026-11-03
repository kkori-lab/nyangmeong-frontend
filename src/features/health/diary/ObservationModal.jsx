import { useEffect, useRef, useState } from 'react';
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
import FieldError from './FieldError';
import FormModal from './FormModal';
import {
  INPUT_CLASS,
  LABEL_CLASS,
  SELECT_ARROW_STYLE,
  SELECT_CLASS,
  TEXTAREA_CLASS,
} from './formStyles';
import ObservationPhoto from './ObservationPhoto';
import { formatPart } from './observationUtils';

const MAX_ITEM_NAME_LENGTH = 40;
const MAX_PART_DETAIL_LENGTH = 40;
const MAX_MEMO_LENGTH = 200;

const REQUIRED = <span className="ml-0.5 font-bold text-[#b4473a]">*</span>;
const OPTIONAL = (
  <span className="ml-1 text-[13px] font-medium text-[#667374]">선택</span>
);

const getModalTitle = (mode, item, cycles, cycle) => {
  if (mode === 'A') return '관찰 항목 등록';
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
  const [size, setSize] = useState(cycle?.obsrvSz ?? '');
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
      icon="photo_camera"
      title={getModalTitle(mode, item, cycles, cycle)}
      isPending={isPending}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <label className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>관찰 항목{REQUIRED}</span>
        <input
          value={name}
          readOnly={!isCreateItem}
          maxLength={MAX_ITEM_NAME_LENGTH}
          aria-invalid={isInvalid('name')}
          className={INPUT_CLASS}
          onChange={(event) => setName(event.target.value)}
        />
        {isInvalid('name') && (
          <FieldError>관찰 항목을 입력해 주세요</FieldError>
        )}
      </label>

      <div className="flex flex-col gap-1.5">
        <span id="obsv-part-label" className={LABEL_CLASS}>
          관찰 부위{REQUIRED}
        </span>
        {isCreateItem ? (
          <div className="grid grid-cols-2 gap-x-4">
            <select
              aria-labelledby="obsv-part-label"
              value={partCd}
              aria-invalid={isInvalid('part')}
              className={SELECT_CLASS}
              style={SELECT_ARROW_STYLE}
              onChange={(event) => setPartCd(event.target.value)}
            >
              <option value="">대분류 선택</option>
              {OBSERVATION_PARTS.map((part) => (
                <option key={part.cd} value={part.cd}>
                  {part.nm}
                </option>
              ))}
            </select>
            <input
              value={partDetail}
              maxLength={MAX_PART_DETAIL_LENGTH}
              placeholder="세부 위치 (선택)"
              aria-label="세부 위치 (선택)"
              className={INPUT_CLASS}
              onChange={(event) => setPartDetail(event.target.value)}
            />
          </div>
        ) : (
          <input
            readOnly
            aria-labelledby="obsv-part-label"
            value={formatPart(item)}
            className={INPUT_CLASS}
          />
        )}
        {isInvalid('part') && (
          <FieldError>관찰 부위를 선택해 주세요</FieldError>
        )}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>관찰일{REQUIRED}</span>
        <input
          type="date"
          value={obsrvYmd}
          max={today}
          aria-invalid={isInvalid('date')}
          className={`${INPUT_CLASS} tabular-nums`}
          onChange={(event) => setObsrvYmd(event.target.value)}
        />
        {isInvalid('date') && (
          <FieldError>오늘 이후 날짜는 고를 수 없어요</FieldError>
        )}
      </label>

      <div className="rounded-xl bg-[#f4f6f6] p-4">
        <span className={LABEL_CLASS}>사진{REQUIRED}</span>
        <div className="mt-2 grid h-40 place-items-center overflow-hidden rounded-[10px] border border-dashed border-line-strong bg-white text-subtle">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="선택한 사진"
              className="size-full object-contain"
            />
          ) : isEdit ? (
            <ObservationPhoto
              petSn={petSn}
              obsrvCyclSn={cycle.obsrvCyclSn}
              className="size-full object-contain"
            />
          ) : (
            <span className="flex flex-col items-center gap-1">
              <Icon name="image" className="text-[28px]" />
              사진 미리보기
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className={`${BTN_SECONDARY} h-8! px-3!`}
            onClick={() => cameraRef.current.click()}
          >
            <Icon name="photo_camera" />
            촬영하기
          </button>
          <button
            type="button"
            className={`${BTN_SECONDARY} h-8! px-3!`}
            onClick={() => albumRef.current.click()}
          >
            <Icon name="photo_library" />
            앨범에서 선택
          </button>
        </div>
        {isEdit && (
          <p className="mt-2 text-[13px] font-medium text-[#667374]">
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
          <span className={LABEL_CLASS}>크기{OPTIONAL}</span>
          <span className="relative block">
            <input
              type="number"
              min="0"
              step="0.1"
              inputMode="decimal"
              value={size}
              placeholder="선택 입력"
              className={`${INPUT_CLASS} pr-12 tabular-nums`}
              onChange={(event) => setSize(event.target.value)}
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted">
              mm
            </span>
          </span>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={LABEL_CLASS}>변화{OPTIONAL}</span>
          {isFirstCycle ? (
            <input
              disabled
              value="1회차는 비교 없음"
              aria-label="변화 (1회차는 비교 없음)"
              className={INPUT_CLASS}
            />
          ) : (
            <select
              value={chgCd}
              className={SELECT_CLASS}
              style={SELECT_ARROW_STYLE}
              onChange={(event) => setChgCd(event.target.value)}
            >
              <option value="">선택 안 함</option>
              {OBSERVATION_CHANGES.map((change) => (
                <option key={change.cd} value={change.cd}>
                  {change.nm}
                </option>
              ))}
            </select>
          )}
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>메모{OPTIONAL}</span>
        <textarea
          value={memo}
          maxLength={MAX_MEMO_LENGTH}
          placeholder="선택 입력"
          className={TEXTAREA_CLASS}
          onChange={(event) => setMemo(event.target.value)}
        />
      </label>
    </FormModal>
  );
}
