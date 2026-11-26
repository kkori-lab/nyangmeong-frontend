import useProfanityErrors from '@/hooks/useProfanityErrors';
import { Info, MapPin, Navigation } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import DatePicker from '@/components/DatePicker';
import TimeSelect from '@/components/TimeSelect';
import AutoTextarea from '@/components/AutoTextarea';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Checkbox from '@/components/Checkbox';
import FieldError, { Required } from '@/components/FieldError';
import { INPUT, LABEL } from '@/components/formStyles';
import ImageAttach from '@/components/ImageAttach';
import { PATHS } from '@/routes/paths';
import { getTodayYmd } from '@/utils/formatDate';
import { PET_SE, PET_SE_OPTIONS } from '@/utils/petCodes';
import { LIST_RAIL_COLS } from '@/constants/listLayout';
import { useBreeds } from '../missingQueries';
import BreedCombobox from './BreedCombobox';
import MissingMap from './MissingMap';
import MissingWriteGuide from './MissingWriteGuide';
import PlaceSearchModal from './PlaceSearchModal';

const NAME_MAX = 20;
const COLOR_MAX = 20;
const FEATURE_MAX = 40;
const TITLE_MAX = 50;
const BODY_MAX = 2000;
const TEL_PATTERN = /^01\d-\d{3,4}-\d{4}$/;

function Counter({ value, max }) {
  return (
    <span className="text-xs text-muted">
      {value.length.toLocaleString()} / {max.toLocaleString()}
    </span>
  );
}

function Section({ number, title, children }) {
  return (
    <div className="flex flex-col gap-9 border-t border-line py-7 first:border-t-0 first:pt-5">
      <h3 className="flex items-center gap-2 text-lg font-bold text-ink">
        <span
          aria-hidden="true"
          className="grid size-[26px] place-items-center rounded-full bg-brand-500 text-sm text-white"
        >
          {number}
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

/** 숫자만 받아 010-0000-0000 모양으로 */
const formatTel = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, digits.length - 4)}-${digits.slice(-4)}`;
};

const snapshot = (values) =>
  JSON.stringify({
    ...values,
    images: values.images.map((image) => image.id),
  });

/**
 * 실종 글쓰기·글수정 공용 폼
 * - 고친 것이 있으면(처음 값과 다르면) onDirtyChange(true). 나갈 때 확인은 부모(페이지)가 한다: onLeave(to)
 * - 실종 지역은 입력받지 않는다: 서버가 목격 좌표로 계산(전북 밖이면 서버가 등록 거절)
 */
const PROFANITY_FIELDS = {
  pstTtl: { key: 'title', id: 'missing-title-input' },
  pstCn: { key: 'body', id: 'missing-body' },
  chrcCn: { key: 'chrcCn', id: 'missing-feature' },
};

export default function MissingForm({
  initial,
  mode,
  cancelTo,
  isPending,
  errorMessage,
  profanityFields,
  onSubmit,
  onLeave,
  onDirtyChange,
}) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  useProfanityErrors(profanityFields, PROFANITY_FIELDS, setErrors);
  const [isPlaceOpen, setIsPlaceOpen] = useState(false);
  const [initialSnap] = useState(() => snapshot(initial));
  const formRef = useRef(null);
  const { data: breeds = [] } = useBreeds(values.petSeCd);

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

  const handleSpeciesChange = (petSeCd) =>
    set(
      {
        petSeCd,
        breed: { vrtyNm: null, vrtyDrctInptNm: null, typed: '' },
      },
      ['breed'],
    );

  const validate = () => {
    const next = {};
    const { breed } = values;
    if (!values.petNm.trim()) next.petNm = '반려동물 이름을 입력해 주세요';
    if (!values.colrNm.trim()) next.colrNm = '털 색상을 입력해 주세요';
    /** 품종은 선택: 비워 둘 수 있고, 쓰다 만 값(목록에 없는 글자·빈 직접 입력)만 막는다 */
    if (breed.typed) {
      next.breed =
        '목록에서 품종을 골라 주세요. 없으면 [직접 입력]을 골라 주세요';
    } else if (breed.vrtyDrctInptNm !== null && !breed.vrtyDrctInptNm.trim()) {
      next.breed = '품종을 직접 입력해 주세요';
    }
    if (!values.seenDate || !values.seenTime) {
      next.seen = '실종 날짜와 시간을 골라 주세요';
    } else if (new Date(`${values.seenDate}T${values.seenTime}`) > new Date()) {
      next.seen = '아직 오지 않은 날짜 · 시간이에요. 다시 확인해 주세요';
    }
    if (!values.place) next.place = '실종 장소를 골라 주세요';
    if (!values.title.trim()) next.title = '제목을 입력해 주세요';
    if (!values.body.trim()) next.body = '상세 설명을 입력해 주세요';
    if (!values.cnpl) next.cnpl = '연락 가능한 전화번호를 입력해 주세요';
    else if (!TEL_PATTERN.test(values.cnpl)) {
      next.cnpl = '전화번호 형식을 확인해 주세요 (예: 010-1234-5678)';
    }
    if (!values.agree) next.agree = '공개 동의에 체크해 주세요';
    return next;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate();
    /** 오류 표시(aria-invalid)가 화면에 반영된 뒤에 첫 빠진 항목을 찾도록 바로 반영한다 */
    flushSync(() => setErrors(nextErrors));
    if (Object.keys(nextErrors).length > 0) {
      /** 빠진 항목 중 첫 번째로 이동 */
      formRef.current
        ?.querySelector('[aria-invalid="true"], [data-invalid="true"]')
        ?.focus();
      return;
    }
    if (isPending) return;
    const { breed, place, images } = values;
    onSubmit({
      petSeCd: values.petSeCd,
      petNm: values.petNm.trim(),
      vrtySn: breeds.find((row) => row.vrtyNm === breed.vrtyNm)?.vrtySn ?? null,
      vrtyDrctInptNm: breed.vrtyDrctInptNm?.trim() ?? null,
      colrNm: values.colrNm.trim(),
      chrcCn: values.chrcCn.trim(),
      lastWtnsDt: `${values.seenDate}T${values.seenTime}:00`,
      wtnsPlcNm: place.wtnsPlcNm,
      wtnsPlcLat: place.wtnsPlcLat,
      wtnsPlcLot: place.wtnsPlcLot,
      pstTtl: values.title.trim(),
      pstCn: values.body.trim(),
      cnpl: values.cnpl,
      images: images.filter((image) => image.file).map((image) => image.file),
      keepAtchFileSns: images
        .filter((image) => !image.file)
        .map((image) => image.atchFileSn),
    });
  };

  const placeText = values.place
    ? values.place.wtnsPlcAddr
    : '아직 고르지 않았어요';

  return (
    <div
      className={`grid ${LIST_RAIL_COLS} items-start gap-8 max-[1100px]:grid-cols-1 max-[1100px]:gap-6`}
    >
      <section
        aria-labelledby="missing-form-title"
        className="rounded-[14px] border border-line bg-white px-9 pt-8 pb-7 max-[760px]:px-5 max-[760px]:pt-6 max-[760px]:pb-5"
      >
        <h2 id="missing-form-title" className="sr-only">
          {isEdit ? '실종 게시글 수정' : '실종 게시글 작성'}
        </h2>
        <p className="mb-5 flex items-start gap-2 rounded-lg bg-brand-50 px-4 py-3 text-sm leading-normal text-brand-600">
          <Info size={18} aria-hidden="true" className="mt-1 shrink-0" />
          <span>
            {isEdit
              ? '등록한 정보가 채워져 있어요. 바꿀 항목만 고친 뒤 저장해 주세요. 실종 장소를 바꾸면 실종 지역도 함께 바뀌어요.'
              : '정확한 정보와 특징이 잘 보이는 선명한 사진을 올리면 찾는 데 큰 도움이 돼요.'}
          </span>
        </p>

        <form
          id="missing-form"
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
        >
          <Section number={1} title="반려동물">
            <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
              <legend className={`${LABEL} mb-2`}>
                종류
                <Required />
              </legend>
              <div className="flex gap-7">
                {PET_SE_OPTIONS.map((option) => (
                  <label
                    key={option.code}
                    className="flex min-h-8 cursor-pointer items-center gap-2 font-medium text-ink"
                  >
                    <input
                      type="radio"
                      name="petSeCd"
                      value={option.code}
                      checked={values.petSeCd === option.code}
                      onChange={() => handleSpeciesChange(option.code)}
                      className="size-4 accent-brand-500"
                    />
                    {option.name}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid grid-cols-2 gap-8 max-[760px]:grid-cols-1">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="missing-name" className={LABEL}>
                    이름
                    <Required />
                  </label>
                  <Counter value={values.petNm} max={NAME_MAX} />
                </div>
                <input
                  id="missing-name"
                  type="text"
                  maxLength={NAME_MAX}
                  value={values.petNm}
                  placeholder="예: 보리"
                  aria-invalid={Boolean(errors.petNm)}
                  onChange={(event) =>
                    set({ petNm: event.target.value.slice(0, NAME_MAX) }, [
                      'petNm',
                    ])
                  }
                  className={INPUT}
                />
                <FieldError>{errors.petNm}</FieldError>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="missing-color" className={LABEL}>
                  털 색상
                  <Required />
                </label>
                <input
                  id="missing-color"
                  type="text"
                  maxLength={COLOR_MAX}
                  value={values.colrNm}
                  placeholder="예: 흰색, 갈색과 흰색"
                  aria-invalid={Boolean(errors.colrNm)}
                  onChange={(event) =>
                    set({ colrNm: event.target.value.slice(0, COLOR_MAX) }, [
                      'colrNm',
                    ])
                  }
                  className={INPUT}
                />
                <FieldError>{errors.colrNm}</FieldError>
              </div>
            </div>

            <BreedCombobox
              key={values.petSeCd}
              label={`${values.petSeCd === PET_SE.CAT ? '고양이' : '강아지'} 품종`}
              breeds={breeds.map((row) => row.vrtyNm)}
              value={values.breed}
              error={errors.breed}
              required={false}
              onChange={(breed) => set({ breed }, ['breed'])}
            />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="missing-feature" className={LABEL}>
                  특징{' '}
                  <span className="text-sm font-medium text-muted">선택</span>
                </label>
                <Counter value={values.chrcCn} max={FEATURE_MAX} />
              </div>
              <input
                id="missing-feature"
                type="text"
                maxLength={FEATURE_MAX}
                value={values.chrcCn}
                placeholder="예: 빨간 목줄, 왼쪽 눈가 갈색 점"
                aria-invalid={Boolean(errors.chrcCn)}
                onChange={(event) =>
                  set({ chrcCn: event.target.value.slice(0, FEATURE_MAX) }, [
                    'chrcCn',
                  ])
                }
                className={INPUT}
              />
              <FieldError>{errors.chrcCn}</FieldError>
              <p className="text-sm text-muted">
                목록 카드에 한 줄로 보여요. 눈에 띄는 특징을 짧게 적어 주세요
              </p>
            </div>
          </Section>

          <Section number={2} title="실종 정보">
            <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
              <legend className={`${LABEL} mb-2`}>
                실종 날짜 · 시간
                <Required />
              </legend>
              <div className="grid grid-cols-2 gap-8 max-[760px]:grid-cols-1">
                <DatePicker
                  label="실종 날짜"
                  max={getTodayYmd()}
                  value={values.seenDate}
                  invalid={Boolean(errors.seen)}
                  onChange={(value) => set({ seenDate: value }, ['seen'])}
                />
                <TimeSelect
                  aria-label="실종 시간"
                  value={values.seenTime}
                  invalid={Boolean(errors.seen)}
                  onChange={(value) => set({ seenTime: value }, ['seen'])}
                />
              </div>
              <FieldError>{errors.seen}</FieldError>
            </fieldset>

            <div className="flex flex-col gap-2">
              <span id="missing-place-label" className={LABEL}>
                실종 장소
                <Required />
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {/* 표시 칸을 눌러도 장소 찾기가 열린다. 키보드는 옆 [장소 찾기] 버튼으로 가므로 탭 순서에서 뺀다 */}
                <button
                  type="button"
                  tabIndex={-1}
                  aria-labelledby="missing-place-label"
                  onClick={() => setIsPlaceOpen(true)}
                  className={`flex min-h-10 min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md border bg-surface-2 px-3 text-left hover:border-line-strong ${errors.place ? 'border-danger' : 'border-input-line'} ${values.place ? 'text-ink' : 'text-muted'}`}
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
                  장소 찾기
                </button>
              </div>
              {values.place && (
                <>
                  <MissingMap
                    place={values.place}
                    isPreview
                    onMove={(coords) =>
                      set({ place: { ...values.place, ...coords } })
                    }
                  />
                  <p className="flex items-center gap-2 text-sm text-ink-2">
                    <Navigation
                      size={16}
                      aria-hidden="true"
                      className="text-tone-green-fg"
                    />
                    실종 지역{' '}
                    <b className="font-bold text-ink">
                      {values.place.rgnNm ?? `전북 ${values.place.sggNm}`}
                    </b>
                    <span className="text-subtle">· 목록 필터에 쓰여요</span>
                  </p>
                </>
              )}
              <FieldError>{errors.place}</FieldError>
            </div>
          </Section>

          <Section number={3} title="게시글 · 연락처">
            <div className="flex flex-col gap-2">
              <label htmlFor="missing-title-input" className={LABEL}>
                제목
                <Required />
              </label>
              <div className="relative">
                <input
                  id="missing-title-input"
                  type="text"
                  maxLength={TITLE_MAX}
                  value={values.title}
                  placeholder="예: 보리 (몰티즈)를 찾습니다"
                  aria-invalid={Boolean(errors.title)}
                  onChange={(event) =>
                    set({ title: event.target.value.slice(0, TITLE_MAX) }, [
                      'title',
                    ])
                  }
                  className={INPUT}
                />
                <span className="absolute top-full right-0 mt-1">
                  <Counter value={values.title} max={TITLE_MAX} />
                </span>
              </div>
              <FieldError>{errors.title}</FieldError>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="missing-body" className={LABEL}>
                상세 설명
                <Required />
              </label>
              <div className="relative">
                <AutoTextarea
                  id="missing-body"
                  value={values.body}
                  maxLength={BODY_MAX}
                  placeholder="잃어버린 상황, 성격, 다가갈 때 주의할 점 등을 적어 주세요"
                  aria-required="true"
                  aria-invalid={Boolean(errors.body)}
                  onChange={(event) =>
                    set({ body: event.target.value.slice(0, BODY_MAX) }, [
                      'body',
                    ])
                  }
                  className={`${INPUT} max-h-[600px] min-h-[200px] resize-y py-3 leading-[1.7]`}
                />
                <span className="absolute top-full right-0 mt-1">
                  <Counter value={values.body} max={BODY_MAX} />
                </span>
              </div>
              <FieldError>{errors.body}</FieldError>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="missing-tel" className={LABEL}>
                연락처
                <Required />
              </label>
              <input
                id="missing-tel"
                type="tel"
                inputMode="numeric"
                maxLength={13}
                autoComplete="tel"
                value={values.cnpl}
                placeholder="010-0000-0000"
                aria-invalid={Boolean(errors.cnpl)}
                onChange={(event) =>
                  set({ cnpl: formatTel(event.target.value) }, ['cnpl'])
                }
                className={`${INPUT} max-w-[240px]`}
              />
              <p className="text-sm text-muted">
                게시글에 공개돼요. &apos;찾았어요&apos;를 누르면 더 이상 보이지
                않아요
              </p>
              <FieldError>{errors.cnpl}</FieldError>
            </div>

            <ImageAttach
              images={values.images}
              onChange={(images) => set({ images })}
            />

            <div className="flex flex-col gap-2">
              {/* 빠진 항목으로 이동할 때 이 줄을 찾도록 data-invalid를 바깥 칸에 둔다(공용 Checkbox는 aria-invalid를 받지 않는다) */}
              <div tabIndex={-1} data-invalid={Boolean(errors.agree)}>
                <Checkbox
                  checked={values.agree}
                  onChange={(event) =>
                    set({ agree: event.target.checked }, ['agree'])
                  }
                  className="min-h-8"
                >
                  <span>
                    <b>(필수)</b> 반려동물 정보, 실종 장소, 연락처를 수집 ·
                    이용하고 게시글에 공개하는 것에 동의해요
                  </span>
                </Checkbox>
              </div>
              <FieldError>{errors.agree}</FieldError>
            </div>
          </Section>
        </form>

        {errorMessage && profanityFields.length === 0 && (
          <p role="alert" className="mt-4 text-sm text-danger">
            {errorMessage}
          </p>
        )}

        <div className="mt-2 flex items-center justify-end gap-2 border-t border-line pt-6 max-[760px]:flex-wrap max-[760px]:pt-5">
          <button
            type="button"
            onClick={() => onLeave(cancelTo)}
            className={`${BTN_SECONDARY} min-w-[120px] max-[760px]:h-12 max-[760px]:min-w-0 max-[760px]:flex-1`}
          >
            취소
          </button>
          <button
            type="submit"
            form="missing-form"
            disabled={isPending}
            className={`${BTN_PRIMARY} min-w-[120px] max-[760px]:h-12 max-[760px]:min-w-0 max-[760px]:flex-1`}
          >
            {isEdit ? '저장하기' : '등록하기'}
          </button>
        </div>
      </section>

      <MissingWriteGuide />

      {isPlaceOpen && (
        <PlaceSearchModal
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
