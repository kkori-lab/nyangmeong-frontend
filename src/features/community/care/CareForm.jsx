import { ChevronLeft, Info, MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AmountInput from '@/components/AmountInput';
import AutoTextarea from '@/components/AutoTextarea';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import ImageAttach from '@/components/ImageAttach';
import Select from '@/components/Select';
import { PATHS } from '@/routes/paths';
import { PET_SE } from '@/utils/petCodes';
import {
  CST_UNIT,
  CST_UNIT_OPTIONS,
  MIN_HOURLY_WAGE,
  MIN_WAGE_MESSAGE,
  MIN_WAGE_YEAR,
  PET_SIZE_OPTIONS,
  PRTC_SHP_OPTIONS,
} from '../careCodes';
import { useBreeds } from '../missingQueries';
import BreedCombobox from '../missing/BreedCombobox';
import PlaceSearchModal from '../missing/PlaceSearchModal';
import CareAreaMap from './CareAreaMap';
import { Counter, FieldError, Required, Section } from './CareFormParts';
import {
  borderOf,
  INPUT_CLASS,
  LABEL_CLASS,
  TEXTAREA_BASE,
} from './careFormStyles';
import CareWriteGuide from './CareWriteGuide';
import { CARE_TIMES } from './careUtils';

const TITLE_MAX = 50;
const BODY_MAX = 2000;
const BREED_MESSAGE =
  '목록에서 품종을 골라 주세요. 없으면 [직접 입력]을 골라 주세요';
const TIME_OPTIONS = (placeholder) => [
  { value: '', label: placeholder },
  ...CARE_TIMES.map((time) => ({ value: time, label: time })),
];

const snapshot = (values) =>
  JSON.stringify({
    ...values,
    images: values.images.map((image) => image.id),
  });

/** 품종 입력 검사: 목록 선택 또는 [직접 입력] */
const breedError = (breed) => {
  if (breed.typed) return BREED_MESSAGE;
  if (breed.vrtyNm === null && breed.vrtyDrctInptNm === null) {
    return '품종을 골라 주세요. 없으면 [직접 입력]을 골라 주세요';
  }
  if (breed.vrtyDrctInptNm !== null && !breed.vrtyDrctInptNm.trim()) {
    return '품종을 직접 입력해 주세요';
  }
  return '';
};

/** 돌봄 기간·시간 검사: 비우려면 「일정은 채팅으로 협의할게요」, 일부만 채우기 불가 */
const whenError = ({ fromDate, fromTime, toDate, toTime, nego }) => {
  const filled = [fromDate, fromTime, toDate, toTime].filter(Boolean).length;
  if (filled === 0) {
    return nego
      ? ''
      : '돌봄 기간과 시간을 골라 주세요. 정해지지 않았다면 「일정은 채팅으로 협의할게요」를 체크해 주세요';
  }
  if (filled < 4) return '시작과 종료의 날짜 · 시간을 모두 골라 주세요';
  if (new Date(`${toDate}T${toTime}`) <= new Date(`${fromDate}T${fromTime}`)) {
    return '종료 일시는 시작 일시보다 뒤여야 해요';
  }
  return '';
};

function BreedField({ petSeCd, label, value, error, onChange }) {
  const { data: breeds = [] } = useBreeds(petSeCd);
  return (
    <BreedCombobox
      label={label}
      breeds={breeds}
      value={value}
      error={error}
      onChange={onChange}
    />
  );
}

function CheckOption({ checked, onChange, children, name }) {
  return (
    <label className="flex min-h-8 cursor-pointer items-center gap-2 font-medium text-ink">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-brand-500"
      />
      {children}
    </label>
  );
}

function RadioOption({ checked, onChange, children, name, value }) {
  return (
    <label className="flex min-h-8 cursor-pointer items-center gap-2 font-medium text-ink">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="size-4 accent-brand-500"
      />
      {children}
    </label>
  );
}

/**
 * 펫돌봄 글쓰기·글수정 공용 폼
 * - 고친 것이 있으면(처음 값과 다르면) onDirtyChange(true). 나갈 때 확인은 부모(페이지)가 한다: onLeave(to)
 * - 돌봄 지역은 입력 없음: 고른 장소의 시·군·구와 동에서 결정(서버는 좌표를 역지오코딩). 공개 화면에는 동네까지만 표시
 * - 수정에서는 정확한 좌표가 없어 장소를 다시 고르지 않으면 장소 값 미전송(서버는 유지)
 */
export default function CareForm({
  initial,
  mode,
  cancelTo,
  isPending,
  errorMessage,
  onSubmit,
  onLeave,
  onDirtyChange,
}) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [isPlaceOpen, setIsPlaceOpen] = useState(false);
  const [initialSnap] = useState(() => snapshot(initial));
  const formRef = useRef(null);

  const isEdit = mode === 'edit';
  const isDirty = snapshot(values) !== initialSnap;

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (!isDirty) return undefined;
    const warn = (event) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  const set = (patch, clear = []) => {
    setValues((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      clear.forEach((key) => delete next[key]);
      return next;
    });
  };

  const toggleShape = (code, checked) =>
    set(
      {
        shapes: checked
          ? [...values.shapes, code]
          : values.shapes.filter((item) => item !== code),
      },
      ['shapes'],
    );

  const validate = () => {
    const next = {};
    const { dog, cat } = values;
    if (!dog && !cat) next.species = '반려동물 종류를 하나 이상 골라 주세요';
    if (dog) {
      const message = breedError(values.dogBreed);
      if (message) next.dogBreed = message;
      if (!values.dogSizeCd) next.dogSize = '강아지 몸무게를 골라 주세요';
    }
    if (cat) {
      const message = breedError(values.catBreed);
      if (message) next.catBreed = message;
    }
    if (values.shapes.length === 0) {
      next.shapes = '돌봄 형태를 하나 이상 골라 주세요';
    }
    const when = whenError(values);
    if (when) next.when = when;
    const amount = Number(values.amount);
    if (!amount) next.amount = '비용을 입력해 주세요';
    else if (values.cstUnitCd === CST_UNIT.HOUR && amount < MIN_HOURLY_WAGE) {
      next.amount = MIN_WAGE_MESSAGE;
    }
    if (!values.title.trim()) next.title = '제목을 입력해 주세요';
    if (!values.body.trim()) next.body = '상세 설명을 입력해 주세요';
    if (!values.place) next.place = '돌봄 장소를 골라 주세요';
    if (!values.agree) next.agree = '공개 동의에 체크해 주세요';
    return next;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      /** 빠진 항목 중 첫 번째로 이동 */
      formRef.current
        ?.querySelector('[aria-invalid="true"], [data-invalid="true"]')
        ?.focus();
      return;
    }
    if (isPending) return;
    const { place } = values;
    const hasWhen = Boolean(values.fromDate);
    const kindOf = (petSeCd, breed, petSizeCd) => ({
      petSeCd,
      petSizeCd,
      vrtyNm: breed.vrtyNm,
      vrtyDrctInptNm: breed.vrtyDrctInptNm?.trim() ?? null,
    });
    onSubmit({
      petKnds: [
        ...(values.dog
          ? [kindOf(PET_SE.DOG, values.dogBreed, values.dogSizeCd)]
          : []),
        ...(values.cat ? [kindOf(PET_SE.CAT, values.catBreed, null)] : []),
      ],
      prtcShpCds: values.shapes,
      cstUnitCd: values.cstUnitCd,
      cstAmt: Number(values.amount),
      prtcBgngDt: hasWhen ? `${values.fromDate} ${values.fromTime}:00` : null,
      prtcEndDt: hasWhen ? `${values.toDate} ${values.toTime}:00` : null,
      schdlCnsltnPsbltyYn: values.nego ? 'Y' : 'N',
      pstTtl: values.title.trim(),
      pstCn: values.body.trim(),
      atchFiles: values.images,
      sggNm: place.sggNm,
      emdNm: place.emdNm,
      rlsRgnNm: `${place.emdNm} 인근`,
      ...(place.wtnsPlcLat == null
        ? {}
        : {
            prtcPlcDaddr: place.wtnsPlcAddr,
            prtcPlcLat: place.wtnsPlcLat,
            prtcPlcLot: place.wtnsPlcLot,
          }),
    });
  };

  const placeText = values.place
    ? `전북 ${values.place.sggNm} ${values.place.emdNm} 인근`
    : '아직 고르지 않았어요';

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-8 max-[1101px]:grid-cols-1 max-[1101px]:gap-6">
      <section
        aria-labelledby="care-form-title"
        className="rounded-[14px] border border-line bg-white px-9 pt-8 pb-7 shadow-sm max-[760px]:px-5 max-[760px]:pt-[22px] max-[760px]:pb-5"
      >
        <h2 id="care-form-title" className="sr-only">
          {isEdit ? '돌봄 요청 수정' : '돌봄 요청 작성'}
        </h2>
        {isEdit && (
          <p className="mt-4 mb-1 flex items-start gap-2 rounded-lg bg-brand-50 px-4 py-3 text-sm leading-[1.6] text-brand-600">
            <Info size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span>
              등록한 정보가 채워져 있어요. 바꿀 항목만 고친 뒤 저장해 주세요.
              이미 나눈 채팅 기록은 글을 고쳐도 바뀌지 않아요.
            </span>
          </p>
        )}

        <form id="care-form" ref={formRef} onSubmit={handleSubmit} noValidate>
          <Section number={1} title="반려동물">
            <fieldset
              tabIndex={-1}
              data-invalid={Boolean(errors.species)}
              className="m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0"
            >
              <legend className={`${LABEL_CLASS} mb-1.5`}>
                종류
                <Required />
              </legend>
              <div className="flex gap-7">
                <CheckOption
                  name="dog"
                  checked={values.dog}
                  onChange={(dog) => set({ dog }, ['species'])}
                >
                  강아지
                </CheckOption>
                <CheckOption
                  name="cat"
                  checked={values.cat}
                  onChange={(cat) => set({ cat }, ['species'])}
                >
                  고양이
                </CheckOption>
              </div>
              <FieldError message={errors.species} />
            </fieldset>

            {values.dog && (
              <>
                <BreedField
                  petSeCd={PET_SE.DOG}
                  label="강아지 품종"
                  value={values.dogBreed}
                  error={errors.dogBreed}
                  onChange={(dogBreed) => set({ dogBreed }, ['dogBreed'])}
                />
                <fieldset
                  tabIndex={-1}
                  data-invalid={Boolean(errors.dogSize)}
                  className="m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0"
                >
                  <legend className={`${LABEL_CLASS} mb-1.5`}>
                    강아지 몸무게
                    <Required />
                  </legend>
                  <div className="flex flex-wrap gap-x-7">
                    {PET_SIZE_OPTIONS.map((option) => (
                      <RadioOption
                        key={option.code}
                        name="dogSizeCd"
                        value={option.code}
                        checked={values.dogSizeCd === option.code}
                        onChange={() =>
                          set({ dogSizeCd: option.code }, ['dogSize'])
                        }
                      >
                        {option.name} ({option.range})
                      </RadioOption>
                    ))}
                  </div>
                  <FieldError message={errors.dogSize} />
                </fieldset>
              </>
            )}
            {values.cat && (
              <BreedField
                petSeCd={PET_SE.CAT}
                label="고양이 품종"
                value={values.catBreed}
                error={errors.catBreed}
                onChange={(catBreed) => set({ catBreed }, ['catBreed'])}
              />
            )}
          </Section>

          <Section number={2} title="돌봄 일정과 비용">
            <fieldset
              tabIndex={-1}
              data-invalid={Boolean(errors.shapes)}
              className="m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0"
            >
              <legend className={`${LABEL_CLASS} mb-1.5`}>
                돌봄 형태
                <Required />
              </legend>
              <div className="flex flex-wrap gap-x-7">
                {PRTC_SHP_OPTIONS.map((option) => (
                  <CheckOption
                    key={option.code}
                    name="prtcShp"
                    checked={values.shapes.includes(option.code)}
                    onChange={(checked) => toggleShape(option.code, checked)}
                  >
                    {option.name}
                  </CheckOption>
                ))}
              </div>
              <FieldError message={errors.shapes} />
            </fieldset>

            <fieldset
              tabIndex={-1}
              data-invalid={Boolean(errors.when)}
              className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0"
            >
              <legend className={`${LABEL_CLASS} mb-1.5`}>
                돌봄 기간 · 시간
                <Required />
              </legend>
              <div className="grid grid-cols-2 gap-8 max-[760px]:grid-cols-1">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-sm font-semibold text-ink-2">기간</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      aria-label="시작일"
                      value={values.fromDate}
                      max={values.toDate || undefined}
                      onChange={(event) =>
                        set({ fromDate: event.target.value }, ['when'])
                      }
                      className={`${INPUT_CLASS} min-w-0 flex-1 ${borderOf(errors.when)}`}
                    />
                    <span aria-hidden="true" className="shrink-0 text-subtle">
                      ~
                    </span>
                    <input
                      type="date"
                      aria-label="종료일"
                      value={values.toDate}
                      min={values.fromDate || undefined}
                      onChange={(event) =>
                        set({ toDate: event.target.value }, ['when'])
                      }
                      className={`${INPUT_CLASS} min-w-0 flex-1 ${borderOf(errors.when)}`}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-ink-2">
                    시간{' '}
                    <span className="font-medium text-muted">30분 단위</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <Select
                      label="시작 시간"
                      value={values.fromTime}
                      options={TIME_OPTIONS('시작')}
                      onChange={(fromTime) => set({ fromTime }, ['when'])}
                      className="min-w-0 flex-1"
                    />
                    <span aria-hidden="true" className="shrink-0 text-subtle">
                      ~
                    </span>
                    <Select
                      label="종료 시간"
                      value={values.toTime}
                      options={TIME_OPTIONS('종료')}
                      onChange={(toTime) => set({ toTime }, ['when'])}
                      className="min-w-0 flex-1"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4">
                <CheckOption
                  name="nego"
                  checked={values.nego}
                  onChange={(nego) => set({ nego }, ['when'])}
                >
                  일정은 채팅으로 협의할게요
                </CheckOption>
                <p className="text-sm text-muted">
                  체크하면 기간 · 시간을 비워 두고 등록할 수 있어요
                </p>
              </div>
              <FieldError message={errors.when} />
            </fieldset>

            <fieldset
              tabIndex={-1}
              data-invalid={Boolean(errors.amount)}
              className="m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0"
            >
              <legend className={`${LABEL_CLASS} mb-1.5`}>
                비용
                <Required />
              </legend>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div
                  role="radiogroup"
                  aria-label="비용 기준"
                  className="flex gap-6"
                >
                  {CST_UNIT_OPTIONS.map((option) => (
                    <RadioOption
                      key={option.code}
                      name="cstUnitCd"
                      value={option.code}
                      checked={values.cstUnitCd === option.code}
                      onChange={() =>
                        set({ cstUnitCd: option.code }, ['amount'])
                      }
                    >
                      {option.name}
                    </RadioOption>
                  ))}
                </div>
                <AmountInput
                  id="care-amount"
                  label="금액"
                  maxDigits={9}
                  value={values.amount}
                  onChange={(amount) => set({ amount }, ['amount'])}
                  className="w-[200px] max-[760px]:w-full"
                />
              </div>
              <p className="text-sm text-muted">
                시급은 {MIN_WAGE_YEAR}년 최저시급{' '}
                {MIN_HOURLY_WAGE.toLocaleString()}원 이상으로 적어 주세요
              </p>
              <FieldError message={errors.amount} />
            </fieldset>
          </Section>

          <Section number={3} title="게시글">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="care-title-input" className={LABEL_CLASS}>
                  제목
                  <Required />
                </label>
                <Counter value={values.title} max={TITLE_MAX} />
              </div>
              <input
                id="care-title-input"
                type="text"
                maxLength={TITLE_MAX}
                value={values.title}
                placeholder="예: 보리(몰티즈) 저녁 산책 도와주실 분 구해요"
                aria-invalid={Boolean(errors.title)}
                onChange={(event) =>
                  set({ title: event.target.value }, ['title'])
                }
                className={`${INPUT_CLASS} ${borderOf(errors.title)}`}
              />
              <FieldError message={errors.title} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="care-body" className={LABEL_CLASS}>
                상세 설명
                <Required />
              </label>
              <AutoTextarea
                id="care-body"
                value={values.body}
                maxLength={BODY_MAX}
                placeholder="반려동물의 성격, 주의사항과 부탁할 돌봄 내용을 적어 주세요"
                aria-required="true"
                aria-invalid={Boolean(errors.body)}
                onChange={(event) =>
                  set({ body: event.target.value }, ['body'])
                }
                className={`${TEXTAREA_BASE} max-h-[600px] min-h-[240px] resize-y py-3 leading-[1.7] ${borderOf(errors.body)}`}
              />
              <div className="flex items-start justify-between gap-3">
                <FieldError message={errors.body} />
                <span className="ml-auto shrink-0">
                  <Counter value={values.body} max={BODY_MAX} />
                </span>
              </div>
            </div>

            <ImageAttach
              images={values.images}
              onChange={(images) => set({ images })}
            />
          </Section>

          <Section number={4} title="장소">
            <div className="flex flex-col gap-2">
              <span id="care-place-label" className={LABEL_CLASS}>
                돌봄 장소
                <Required />
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {/* 표시 칸을 눌러도 돌봄 장소 찾기가 열린다. 키보드는 옆 [돌봄 장소 찾기] 버튼으로 가므로 탭 순서에서 뺀다 */}
                <button
                  type="button"
                  tabIndex={-1}
                  aria-labelledby="care-place-label"
                  onClick={() => setIsPlaceOpen(true)}
                  className={`flex min-h-10 min-w-0 flex-1 cursor-pointer items-center gap-1.5 rounded-md border bg-surface-2 px-3 text-left hover:border-line-strong ${errors.place ? 'border-danger' : 'border-input-line'} ${values.place ? 'text-ink' : 'text-muted'}`}
                >
                  <MapPin
                    size={16}
                    aria-hidden="true"
                    className="shrink-0 text-subtle"
                  />
                  {placeText}
                </button>
                <button
                  type="button"
                  data-invalid={Boolean(errors.place)}
                  onClick={() => setIsPlaceOpen(true)}
                  className={`${BTN_SECONDARY} shrink-0`}
                >
                  돌봄 장소 찾기
                </button>
              </div>
              {values.place && (
                <CareAreaMap
                  place={values.place}
                  onMove={(next) =>
                    set({ place: { ...values.place, ...next } })
                  }
                />
              )}
              <p className="text-sm text-muted">
                개인정보 보호를 위해 게시글에는 동네까지만 보여요. 상세 주소는
                채팅의 주소 공유로 전해 주세요.
              </p>
              <FieldError message={errors.place} />
            </div>

            <div
              className={`flex flex-col gap-1.5 rounded-lg border px-4 py-3.5 ${errors.agree ? 'border-danger' : 'border-line'} bg-surface-2`}
            >
              <label className="flex min-h-8 cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={values.agree}
                  aria-invalid={Boolean(errors.agree)}
                  onChange={(event) =>
                    set({ agree: event.target.checked }, ['agree'])
                  }
                  className="mt-1 size-4 shrink-0 accent-brand-500"
                />
                <span>
                  <b>(필수)</b> 우리동네 펫돌봄 이용수칙에 따라 반려동물 정보,
                  대략적인 장소, 비용이 게시글에 공개되는 것에 동의해요
                </span>
              </label>
              <FieldError message={errors.agree} />
            </div>
          </Section>
        </form>

        {errorMessage && (
          <p role="alert" className="mt-4 text-sm text-danger">
            {errorMessage}
          </p>
        )}

        <div className="mt-2 flex items-center justify-end gap-2 border-t border-line pt-6 max-[760px]:flex-wrap max-[760px]:pt-5">
          <button
            type="button"
            onClick={() => onLeave(PATHS.COMMUNITY_PETCARE)}
            className="mr-auto inline-flex min-h-9 cursor-pointer items-center gap-1.5 text-base leading-normal font-medium text-muted hover:text-ink max-[760px]:order-3 max-[760px]:mr-0 max-[760px]:w-full max-[760px]:justify-center"
          >
            <ChevronLeft size={14} aria-hidden="true" />
            목록으로
          </button>
          <button
            type="button"
            onClick={() => onLeave(cancelTo)}
            className={`${BTN_SECONDARY} min-w-[120px] max-[760px]:h-12 max-[760px]:min-w-0 max-[760px]:flex-1`}
          >
            취소
          </button>
          <button
            type="submit"
            form="care-form"
            disabled={isPending}
            className={`${BTN_PRIMARY} min-w-[120px] max-[760px]:h-12 max-[760px]:min-w-0 max-[760px]:flex-1`}
          >
            {isEdit ? '저장' : '등록'}
          </button>
        </div>
      </section>

      <CareWriteGuide />

      {isPlaceOpen && (
        <PlaceSearchModal
          title="돌봄 장소 찾기"
          confirmLabel="돌봄 장소로 설정"
          guide="돌봄 장소 근처의 장소나 동 이름 검색"
          onSelect={(place) => {
            set({ place }, ['place']);
            setIsPlaceOpen(false);
          }}
          onClose={() => setIsPlaceOpen(false)}
        />
      )}
    </div>
  );
}
