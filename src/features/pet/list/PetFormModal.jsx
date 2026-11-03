import { Check, ChevronDown, CircleAlert, Lock, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { showToast } from '@/components/toastStore';
import {
  COLR_DRCT_INPT,
  COLR_OPTIONS,
  PET_GNDR_OPTIONS,
  PET_SE,
  PET_SE_OPTIONS,
} from '@/utils/petCodes';
import { useCreatePet, usePet, useUpdatePet, useVarieties } from '../queries';

/** 품종 [직접 입력] 선택 상태 */
const VRTY_DRCT_INPT = 'DRCT_INPT';
const VRTY_DRCT_LABEL = '직접 입력';

/** 종류·성별 초기 선택값 */
const EMPTY_FORM = {
  petNm: '',
  petSeCd: PET_SE.DOG,
  vrtySn: '',
  vrtyDrctInptNm: '',
  petBrdt: '',
  chipNo: '',
  petGndrCd: PET_GNDR_OPTIONS[0].code,
  nutrYn: 'N',
  petBdwg: '',
  goalBdwg: '',
  minBdwg: '',
  maxBdwg: '',
  colrCd: '',
  colrDrctInptNm: '',
  chrcCn: '',
  algyCn: '',
  dssCn: '',
};

const toText = (value) => (value == null ? '' : String(value));

const toForm = (pet) => ({
  ...Object.fromEntries(
    Object.keys(EMPTY_FORM).map((key) => [key, toText(pet[key])]),
  ),
  vrtySn: pet.vrtySn == null ? VRTY_DRCT_INPT : String(pet.vrtySn),
  nutrYn: pet.nutrYn ? 'Y' : 'N',
});

/** 체중 입력 형식 (DB decimal(8,3) 기준) */
const DECIMAL_INPUT = /^\d{0,5}(\.\d{0,3})?$/;
const isPositive = (value) => value !== '' && Number(value) > 0;

/** 쉼표 목록 정리 */
const normalizeList = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .join(',') || null;

const toNumberOrNull = (value) => (value === '' ? null : Number(value));
const toTextOrNull = (value) => value.trim() || null;

const formatRecordDate = (rcdDt) => rcdDt.slice(5, 10);

/** 서버 필드명 -> 화면 오류 자리 매핑 */
const ERROR_KEY = {
  vrtySn: 'vrty',
  vrtyDrctInptNm: 'vrty',
  minBdwg: 'range',
  maxBdwg: 'range',
  colrCd: 'colr',
  colrDrctInptNm: 'colr',
};
const errorKeyOf = (field) => ERROR_KEY[field] ?? field;

/** 오류 목록 (화면 순서) */
const validate = ({ form, breedText, isWeightLocked }) => {
  const errors = [];
  const isVrtyDrctInpt = form.vrtySn === VRTY_DRCT_INPT;
  const isColrDrctInpt = form.colrCd === COLR_DRCT_INPT;

  if (!form.petNm.trim()) {
    errors.push(['petNm', '이름을 입력해 주세요', 'pet-nm']);
  }
  if (form.vrtySn === '') {
    errors.push([
      'vrty',
      breedText.trim()
        ? '목록에서 품종을 골라 주세요. 없으면 [직접 입력]을 골라 주세요'
        : '품종을 골라 주세요',
      'pet-vrty',
    ]);
  } else if (isVrtyDrctInpt && !form.vrtyDrctInptNm.trim()) {
    errors.push(['vrty', '품종을 직접 입력해 주세요', 'pet-vrty-self']);
  }
  if (!form.petBrdt) {
    errors.push(['petBrdt', '생년월일을 골라 주세요', 'pet-brdt']);
  }
  if (!isWeightLocked) {
    if (form.petBdwg === '') {
      errors.push(['petBdwg', '체중을 입력해 주세요', 'pet-bdwg']);
    } else if (!isPositive(form.petBdwg)) {
      errors.push(['petBdwg', '0보다 큰 숫자로 입력해 주세요', 'pet-bdwg']);
    }
  }
  if (form.goalBdwg !== '' && !isPositive(form.goalBdwg)) {
    errors.push(['goalBdwg', '0보다 큰 숫자로 입력해 주세요', 'pet-goal']);
  }
  if (form.minBdwg === '' || form.maxBdwg === '') {
    errors.push([
      'range',
      '최소·최대 체중을 모두 입력해 주세요',
      form.minBdwg === '' ? 'pet-min' : 'pet-max',
    ]);
  } else if (!isPositive(form.minBdwg) || !isPositive(form.maxBdwg)) {
    errors.push([
      'range',
      '0보다 큰 숫자로 입력해 주세요',
      isPositive(form.minBdwg) ? 'pet-max' : 'pet-min',
    ]);
  } else if (Number(form.minBdwg) >= Number(form.maxBdwg)) {
    errors.push(['range', '최소 체중은 최대 체중보다 작아야 해요', 'pet-min']);
  }
  if (form.colrCd === '') {
    errors.push(['colr', '털색을 골라 주세요', 'pet-colr']);
  } else if (isColrDrctInpt && !form.colrDrctInptNm.trim()) {
    errors.push(['colr', '털색을 직접 입력해 주세요', 'pet-colr-self']);
  }
  return errors;
};

export default function PetFormModal({ petSn = null, onClose }) {
  const { data: pet, isPending } = usePet(petSn);
  const isEdit = petSn != null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto px-4 py-8">
      <div className="fixed inset-0 bg-[rgba(15,23,35,0.45)]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pet-form-title"
        className="relative m-auto flex w-full max-w-[720px] shrink-0 flex-col rounded-modal bg-white shadow-depth-lg"
      >
        <header className="flex items-start gap-3.5 border-b border-line-strong px-7 pt-4 pb-2">
          <h2 id="pet-form-title" className="text-xl leading-[1.35] font-bold">
            {isEdit ? '반려동물 수정' : '반려동물 등록'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="-mt-1 -mr-2 ml-auto grid size-9 shrink-0 place-items-center rounded-box text-muted hover:bg-surface-3 hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </header>
        {isEdit && isPending ? null : (
          <PetForm pet={isEdit ? pet : null} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

function PetForm({ pet, onClose }) {
  const [form, setForm] = useState(() => (pet ? toForm(pet) : EMPTY_FORM));
  /** 품종 칸 표시 글자 */
  const [breedText, setBreedText] = useState(() => {
    if (!pet) return '';
    return pet.vrtySn == null ? VRTY_DRCT_LABEL : (pet.vrtyNm ?? '');
  });
  const [errors, setErrors] = useState({});
  /** 추가 정보: 등록은 접힘, 수정은 펼침으로 시작. 접어도 입력값은 form에 유지 */
  const [isOptOpen, setIsOptOpen] = useState(pet != null);
  const optRef = useRef(null);
  const { data: varieties = [] } = useVarieties(form.petSeCd);
  const createPet = useCreatePet();
  const updatePet = useUpdatePet();

  const isEdit = pet != null;
  const lastBdwgRcd = pet?.lastBdwgRcd ?? null;
  const isVrtyDrctInpt = form.vrtySn === VRTY_DRCT_INPT;
  const isColrDrctInpt = form.colrCd === COLR_DRCT_INPT;
  const colrOptions = COLR_OPTIONS[form.petSeCd] ?? [];
  const isPending = createPet.isPending || updatePet.isPending;

  const clearError = (...fields) =>
    setErrors((prev) => {
      const keys = fields.map(errorKeyOf);
      if (!keys.some((key) => key in prev)) return prev;
      return Object.fromEntries(
        Object.entries(prev).filter(([key]) => !keys.includes(key)),
      );
    });

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleChange = (e) => setField(e.target.name, e.target.value);

  const handleDecimalChange = (e) => {
    if (DECIMAL_INPUT.test(e.target.value)) handleChange(e);
  };

  const handleChipNoChange = (e) => {
    if (/^\d*$/.test(e.target.value)) handleChange(e);
  };

  /** 종류별 품종·털색 목록 초기화 */
  const handlePetSeChange = (code) => {
    if (form.petSeCd === code) return;
    setForm((prev) => ({
      ...prev,
      petSeCd: code,
      vrtySn: '',
      vrtyDrctInptNm: '',
      colrCd: '',
      colrDrctInptNm: '',
    }));
    setBreedText('');
    clearError('vrtySn', 'colrCd');
  };

  const handleBreedType = (text) => {
    setBreedText(text);
    setForm((prev) =>
      prev.vrtySn === '' ? prev : { ...prev, vrtySn: '', vrtyDrctInptNm: '' },
    );
    clearError('vrtySn');
  };

  const handleBreedSelect = (vrtySn, text) => {
    setBreedText(text);
    setForm((prev) => ({ ...prev, vrtySn }));
    clearError('vrtySn');
    if (vrtySn === VRTY_DRCT_INPT) {
      requestAnimationFrame(() =>
        document.getElementById('pet-vrty-self')?.focus(),
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate({
      form,
      breedText,
      isWeightLocked: lastBdwgRcd != null,
    });
    if (found.length > 0) {
      setErrors(
        Object.fromEntries(found.map(([key, message]) => [key, message])),
      );
      const targets = found.map(([, , id]) => document.getElementById(id));
      /** 접힌 추가 정보 안에 오류가 있으면 펼친 뒤 포커스 */
      if (targets.some((el) => el && optRef.current?.contains(el))) {
        setIsOptOpen(true);
      }
      requestAnimationFrame(() => {
        targets[0]?.focus();
        targets[0]?.scrollIntoView({ block: 'center' });
      });
      return;
    }
    /** 수정(PATCH)은 null이면 안 바꾸고 ""이면 비우므로 빈 값을 ""로 보냄 */
    const blank = isEdit ? '' : null;
    const body = {
      petNm: form.petNm.trim(),
      petSeCd: form.petSeCd,
      vrtySn: isVrtyDrctInpt ? null : Number(form.vrtySn),
      vrtyDrctInptNm: isVrtyDrctInpt ? form.vrtyDrctInptNm.trim() : blank,
      petBrdt: form.petBrdt,
      chipNo: form.chipNo || blank,
      petGndrCd: form.petGndrCd,
      nutrYn: form.nutrYn === 'Y',
      minBdwg: Number(form.minBdwg),
      maxBdwg: Number(form.maxBdwg),
      colrCd: form.colrCd,
      colrDrctInptNm: isColrDrctInpt ? form.colrDrctInptNm.trim() : blank,
      chrcCn: toTextOrNull(form.chrcCn) ?? blank,
      algyCn: normalizeList(form.algyCn) ?? blank,
      dssCn: normalizeList(form.dssCn) ?? blank,
    };
    /** 목표체중: 수정에서 있던 값을 비우면 goalBdwgReset만 보냄(둘을 같이 보내면 서버가 400) */
    const goalBdwg = toNumberOrNull(form.goalBdwg);
    if (goalBdwg != null || !isEdit) body.goalBdwg = goalBdwg;
    else if (pet.goalBdwg != null) body.goalBdwgReset = true;
    /** 수정은 체중이 바뀐 경우에만 보냄 */
    if (!isEdit || Number(form.petBdwg) !== Number(pet.petBdwg)) {
      body.petBdwg = Number(form.petBdwg);
    }
    const options = {
      onSuccess: () => {
        showToast(
          isEdit ? '반려동물 정보를 수정했어요.' : '반려동물을 등록했어요.',
        );
        onClose();
      },
      onError: (error) => {
        if (error.fields) {
          setErrors(
            Object.fromEntries(
              error.fields.map((f) => [errorKeyOf(f.field), f.message]),
            ),
          );
        } else {
          showToast(error.message);
        }
      },
    };
    if (isEdit) updatePet.mutate({ petSn: pet.petSn, ...body }, options);
    else createPet.mutate(body, options);
  };

  /** UTC 변환 시 날짜 어긋남 방지 */
  const today = new Date().toLocaleDateString('sv-SE');

  return (
    <>
      <div className="px-7 pt-6 pb-7">
        <form
          id="pet-form"
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-6 max-[760px]:grid max-[760px]:grid-cols-2 max-[760px]:gap-x-3 max-[760px]:gap-y-5"
        >
          <Field
            m="name"
            id="pet-nm"
            label="이름"
            required
            count={{ length: form.petNm.length, max: 20 }}
            error={errors.petNm}
          >
            <input
              id="pet-nm"
              name="petNm"
              value={form.petNm}
              onChange={handleChange}
              maxLength={20}
              placeholder="이름 입력 (최대 20자)"
              aria-invalid={errors.petNm ? 'true' : undefined}
              aria-describedby="pet-nm-e"
              className={INPUT}
            />
          </Field>

          <Group m="species" label="종류" required>
            <RadioGroup
              name="petSeCd"
              options={PET_SE_OPTIONS}
              value={form.petSeCd}
              onChange={handlePetSeChange}
            />
          </Group>

          <Row>
            <Field
              m="vrty"
              id="pet-vrty"
              label="품종"
              required
              help={
                <ResponsiveHelp
                  pc="공공데이터 품종코드 기준 목록이에요. 목록에 없으면 맨 아래 [직접 입력]을 골라 주세요"
                  m="목록에 없으면 맨 아래 [직접 입력]"
                />
              }
              helpId="pet-vrty-h"
              error={errors.vrty}
            >
              <BreedCombo
                varieties={varieties}
                selected={form.vrtySn}
                text={breedText}
                invalid={!!errors.vrty}
                onType={handleBreedType}
                onSelect={handleBreedSelect}
              />
              {isVrtyDrctInpt && (
                <div className="mt-2 flex flex-col gap-1.5">
                  <label
                    htmlFor="pet-vrty-self"
                    className="flex items-center gap-0.5 leading-[1.4] font-semibold"
                  >
                    품종 직접 입력
                    <span
                      aria-hidden="true"
                      className="ml-0.5 font-bold text-danger"
                    >
                      *
                    </span>
                  </label>
                  <input
                    id="pet-vrty-self"
                    name="vrtyDrctInptNm"
                    value={form.vrtyDrctInptNm}
                    onChange={handleChange}
                    maxLength={40}
                    placeholder="예: 말티푸, 믹스"
                    aria-invalid={errors.vrty ? 'true' : undefined}
                    aria-describedby="pet-vrty-e"
                    className={INPUT}
                  />
                </div>
              )}
            </Field>
            <Field
              m="brdt"
              id="pet-brdt"
              label="생년월일"
              required
              error={errors.petBrdt}
            >
              <input
                id="pet-brdt"
                type="date"
                name="petBrdt"
                value={form.petBrdt}
                onChange={handleChange}
                max={today}
                aria-invalid={errors.petBrdt ? 'true' : undefined}
                aria-describedby="pet-brdt-e"
                className={INPUT}
              />
            </Field>
          </Row>

          <Row>
            <Group m="gndr" label="성별" required>
              <RadioGroup
                name="petGndrCd"
                options={PET_GNDR_OPTIONS}
                value={form.petGndrCd}
                onChange={(code) => setField('petGndrCd', code)}
              />
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.nutrYn === 'Y'}
                  onChange={(e) =>
                    setField('nutrYn', e.target.checked ? 'Y' : 'N')
                  }
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className="grid size-5 shrink-0 place-items-center rounded-sm border-[1.5px] border-line-strong bg-white transition-colors after:h-[5px] after:w-2.5 after:-translate-y-px after:-rotate-45 after:border-b-2 after:border-l-2 after:border-white after:opacity-0 peer-checked:border-brand-500 peer-checked:bg-brand-500 peer-checked:after:opacity-100 peer-focus-visible:ring-focus"
                />
                중성화 완료
              </label>
            </Group>
            <Field
              m="colr"
              id="pet-colr"
              label="털색"
              required
              error={errors.colr}
            >
              <div className="relative">
                <select
                  id="pet-colr"
                  name="colrCd"
                  value={form.colrCd}
                  onChange={handleChange}
                  aria-invalid={errors.colr ? 'true' : undefined}
                  aria-describedby="pet-colr-e"
                  className={`${INPUT} cursor-pointer appearance-none pr-9 invalid:text-placeholder`}
                  required
                >
                  <option value="" disabled>
                    털색 선택
                  </option>
                  {colrOptions.map((colr) => (
                    <option key={colr.code} value={colr.code}>
                      {colr.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-5 -translate-y-1/2 text-muted" />
              </div>
              {isColrDrctInpt && (
                <div className="mt-2 flex flex-col gap-1.5">
                  <label
                    htmlFor="pet-colr-self"
                    className="flex items-center gap-0.5 leading-[1.4] font-semibold"
                  >
                    털색 직접 입력
                    <span
                      aria-hidden="true"
                      className="ml-0.5 font-bold text-danger"
                    >
                      *
                    </span>
                  </label>
                  <input
                    id="pet-colr-self"
                    name="colrDrctInptNm"
                    value={form.colrDrctInptNm}
                    onChange={handleChange}
                    maxLength={20}
                    placeholder="예: 갈색 바탕에 흰 반점"
                    aria-invalid={errors.colr ? 'true' : undefined}
                    aria-describedby="pet-colr-e"
                    className={INPUT}
                  />
                </div>
              )}
            </Field>
          </Row>
          <Row>
            {lastBdwgRcd ? (
              <div className={`flex min-w-0 flex-col gap-1.5 ${MOBILE.bdwg}`}>
                <span
                  id="pet-bdwg-l"
                  className="flex items-center gap-0.5 leading-[1.4] font-semibold"
                >
                  체중
                  <span
                    aria-hidden="true"
                    className="ml-0.5 font-bold text-danger"
                  >
                    *
                  </span>
                </span>
                <div
                  role="textbox"
                  aria-readonly="true"
                  aria-labelledby="pet-bdwg-l"
                  className="flex h-10 items-center gap-2 rounded-md border border-input-line bg-white px-3"
                >
                  <Lock className="size-4 shrink-0 text-subtle" />
                  <span className="tabular-nums">{lastBdwgRcd.rcdNvl}</span>
                  <span className="text-subtle">kg</span>
                </div>
                <p className={HELP}>
                  건강 일지에 기록된 체중이에요 (
                  {formatRecordDate(lastBdwgRcd.rcdDt)} 기록)
                </p>
                {/** 건강 일지(SCR-HLT-002) 경로 연결 예정 */}
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center self-start rounded-md border border-line bg-white px-4 font-semibold hover:border-line-strong hover:bg-surface-2"
                >
                  건강 일지에서 기록하기
                </button>
              </div>
            ) : (
              <Field
                m="bdwg"
                id="pet-bdwg"
                label="체중"
                required
                help={
                  isEdit ? (
                    '잘못 입력한 체중만 고칠 수 있어요. 체중이 바뀌었다면 건강 일지에 기록해 주세요'
                  ) : (
                    <ResponsiveHelp
                      pc="대략적인 체중이어도 괜찮아요. 건강기록에서 정확히 기록하면 자동으로 바뀌어요"
                      m="대략적인 값도 괜찮아요"
                    />
                  )
                }
                helpId="pet-bdwg-h"
                error={errors.petBdwg}
              >
                <KgInput
                  id="pet-bdwg"
                  name="petBdwg"
                  value={form.petBdwg}
                  onChange={handleDecimalChange}
                  placeholder="예: 4.2"
                  invalid={!!errors.petBdwg}
                  describedBy="pet-bdwg-h pet-bdwg-e"
                />
              </Field>
            )}
            <Group
              m="range"
              label="체중 정상범위"
              required
              help={
                <ResponsiveHelp
                  pc="동물병원에서 확인한 범위를 입력해 주세요. 언제든 수정할 수 있어요"
                  m="동물병원에서 확인한 범위"
                />
              }
              helpId="pet-range-h"
              error={errors.range}
              errorId="pet-range-e"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                <KgInput
                  id="pet-min"
                  name="minBdwg"
                  value={form.minBdwg}
                  onChange={handleDecimalChange}
                  placeholder="최소"
                  label="정상범위 최소"
                  invalid={!!errors.range}
                  describedBy="pet-range-h pet-range-e"
                />
                <span aria-hidden="true" className="text-subtle">
                  ~
                </span>
                <KgInput
                  id="pet-max"
                  name="maxBdwg"
                  value={form.maxBdwg}
                  onChange={handleDecimalChange}
                  placeholder="최대"
                  label="정상범위 최대"
                  invalid={!!errors.range}
                  describedBy="pet-range-h pet-range-e"
                />
              </div>
            </Group>
          </Row>
          <details
            ref={optRef}
            open={isOptOpen}
            onToggle={(e) => setIsOptOpen(e.currentTarget.open)}
            className="group rounded-box border border-line bg-white max-[760px]:order-9 max-[760px]:col-span-2"
          >
            <summary className="flex cursor-pointer list-none items-center gap-3 rounded-box px-4 py-3 group-open:rounded-b-none hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 flex-1">
                <span className="font-semibold">
                  추가 정보{' '}
                  <span className="ml-1 text-badge font-medium text-subtle">
                    선택
                  </span>
                </span>
                <span className="mt-0.5 block text-sm text-subtle">
                  인식칩 번호 · 목표체중 · 특징 · 알레르기 · 기저질환
                </span>
              </span>
              <ChevronDown className="size-5 shrink-0 text-subtle transition-transform group-open:rotate-180" />
            </summary>
            <div className="flex flex-col gap-6 border-t border-line-soft p-4">
              <Row>
                <Field id="pet-chip" label="인식칩 번호" optional>
                  <input
                    id="pet-chip"
                    name="chipNo"
                    value={form.chipNo}
                    onChange={handleChipNoChange}
                    inputMode="numeric"
                    maxLength={20}
                    placeholder="숫자만 입력 (최대 20자리)"
                    className={INPUT}
                  />
                </Field>
                <Field
                  id="pet-goal"
                  label="목표체중"
                  optional
                  error={errors.goalBdwg}
                >
                  <KgInput
                    id="pet-goal"
                    name="goalBdwg"
                    value={form.goalBdwg}
                    onChange={handleDecimalChange}
                    placeholder="예: 4.0"
                    invalid={!!errors.goalBdwg}
                    describedBy="pet-goal-e"
                  />
                </Field>
              </Row>
              <Field
                id="pet-chrc"
                label="특징"
                optional
                count={{ length: form.chrcCn.length, max: 1000 }}
                error={errors.chrcCn}
              >
                <input
                  id="pet-chrc"
                  name="chrcCn"
                  value={form.chrcCn}
                  onChange={handleChange}
                  maxLength={1000}
                  placeholder="예) 오른쪽 귀 한쪽만 접힘, 배에 흰 털"
                  className={INPUT}
                />
              </Field>
              <Row>
                <Field
                  id="pet-algy"
                  label="알레르기"
                  optional
                  count={{ length: form.algyCn.length, max: 1000 }}
                  help="여러 건이면 쉼표(,)로 구분해 입력"
                  helpId="pet-algy-h"
                  error={errors.algyCn}
                >
                  <input
                    id="pet-algy"
                    name="algyCn"
                    value={form.algyCn}
                    onChange={handleChange}
                    maxLength={1000}
                    placeholder="예) 새우, 닭고기"
                    aria-describedby="pet-algy-h"
                    className={INPUT}
                  />
                </Field>
                <Field
                  id="pet-dss"
                  label="기저질환"
                  optional
                  count={{ length: form.dssCn.length, max: 1000 }}
                  help="여러 건이면 쉼표(,)로 구분해 입력"
                  helpId="pet-dss-h"
                  error={errors.dssCn}
                >
                  <input
                    id="pet-dss"
                    name="dssCn"
                    value={form.dssCn}
                    onChange={handleChange}
                    maxLength={1000}
                    placeholder="예) 슬개골 탈구, 만성 신부전"
                    aria-describedby="pet-dss-h"
                    className={INPUT}
                  />
                </Field>
              </Row>
            </div>
          </details>
        </form>
      </div>
      <footer className="z-[2] flex items-center justify-end gap-2 rounded-b-modal border-t border-line bg-[#fbfcfd] px-7 py-4 max-[760px]:sticky max-[760px]:bottom-0">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 min-w-24 items-center justify-center rounded-md border border-line bg-white px-4 font-semibold hover:border-line-strong hover:bg-surface-2"
        >
          취소
        </button>
        <button
          type="submit"
          form="pet-form"
          disabled={isPending}
          className="inline-flex h-10 min-w-24 items-center justify-center rounded-md bg-brand-500 px-4 font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-line-strong"
        >
          {isEdit ? '저장' : '등록하기'}
        </button>
      </footer>
    </>
  );
}

const INPUT =
  'block h-10 w-full rounded-md border border-input-line bg-white px-3 placeholder:text-placeholder hover:border-line-strong focus:border-brand-500 focus:ring-focus focus:outline-none aria-invalid:border-danger aria-invalid:focus:ring-error';
const HELP = 'text-sm leading-normal text-muted';
const LABEL = 'flex items-center gap-0.5 leading-[1.4] font-semibold';

function Required() {
  return (
    <span aria-hidden="true" className="ml-0.5 font-bold text-danger">
      *
    </span>
  );
}

function Optional() {
  return <span className="ml-1 text-badge font-medium text-subtle">선택</span>;
}

function ErrorText({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} className="flex items-center gap-1 text-sm text-danger">
      <CircleAlert className="size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/** 앱: 항목 순서(order)와 한 줄/반 줄(col-span)을 항목마다 정한다. 정하지 않은 항목은 뒤에 한 줄씩 */
const MOBILE = {
  name: 'max-[760px]:order-1 max-[760px]:col-span-2',
  species: 'max-[760px]:order-2',
  brdt: 'max-[760px]:order-3',
  vrty: 'max-[760px]:order-4 max-[760px]:col-span-2',
  gndr: 'max-[760px]:order-5',
  colr: 'max-[760px]:order-6',
  bdwg: 'max-[760px]:order-7 max-[760px]:col-span-2',
  range: 'max-[760px]:order-8 max-[760px]:col-span-2',
  rest: 'max-[760px]:order-9 max-[760px]:col-span-2',
};

/** 도움말: 앱에서는 짧은 문구 */
function ResponsiveHelp({ pc, m }) {
  return (
    <>
      <span className="max-[760px]:hidden">{pc}</span>
      <span className="hidden max-[760px]:inline">{m}</span>
    </>
  );
}

function Row({ children }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 max-[760px]:contents">
      {children}
    </div>
  );
}

/** 입력칸 하나 */
function Field({
  m = 'rest',
  id,
  label,
  required,
  optional,
  count,
  help,
  helpId,
  error,
  children,
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${MOBILE[m]}`}>
      <div className="flex items-end justify-between gap-2">
        <label htmlFor={id} className={LABEL}>
          {label}
          {required && <Required />}
          {optional && <Optional />}
        </label>
        {count && (
          <span className="text-sm text-subtle">
            {count.length} / {count.max.toLocaleString()}
          </span>
        )}
      </div>
      {children}
      {help && (
        <p id={helpId} className={HELP}>
          {help}
        </p>
      )}
      <ErrorText id={`${id}-e`}>{error}</ErrorText>
    </div>
  );
}

/** 라벨로 이을 칸 없는 입력 묶음 */
function Group({
  m = 'rest',
  label,
  required,
  help,
  helpId,
  error,
  errorId,
  children,
}) {
  return (
    <fieldset
      className={`m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0 ${MOBILE[m]}`}
    >
      <legend className={`${LABEL} p-0`}>
        {label}
        {required && <Required />}
      </legend>
      {children}
      {help && (
        <p id={helpId} className={HELP}>
          {help}
        </p>
      )}
      <ErrorText id={errorId}>{error}</ErrorText>
    </fieldset>
  );
}

function RadioGroup({ name, options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-x-7 max-[760px]:h-10 max-[760px]:flex-nowrap max-[760px]:gap-0 max-[760px]:rounded-md max-[760px]:border max-[760px]:border-[#e6eaeb] max-[760px]:bg-[#f1f3f4] max-[760px]:p-[3px]">
      {options.map((option) => (
        <label
          key={option.code}
          className="inline-flex min-h-10 cursor-pointer items-center gap-2 font-medium max-[760px]:min-h-0 max-[760px]:flex-1 max-[760px]:justify-center max-[760px]:rounded-sm max-[760px]:text-muted max-[760px]:has-[:checked]:bg-white max-[760px]:has-[:checked]:font-semibold max-[760px]:has-[:checked]:text-brand-600 max-[760px]:has-[:checked]:shadow-[0_1px_2px_rgba(26,50,52,.08),0_0_0_1px_rgba(40,90,92,.18)] max-[760px]:has-[:focus-visible]:outline-2 max-[760px]:has-[:focus-visible]:outline-offset-1 max-[760px]:has-[:focus-visible]:outline-brand-500"
        >
          <input
            type="radio"
            name={name}
            checked={value === option.code}
            onChange={() => onChange(option.code)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="grid size-5 shrink-0 place-items-center rounded-full border-[1.5px] border-line-strong bg-white max-[760px]:hidden after:size-2.5 after:scale-0 after:rounded-full after:bg-brand-500 after:transition-transform peer-checked:border-brand-500 peer-checked:after:scale-100 peer-focus-visible:ring-focus"
          />
          {option.name}
        </label>
      ))}
    </div>
  );
}

function KgInput({
  id,
  name,
  value,
  onChange,
  placeholder,
  label,
  invalid,
  describedBy,
}) {
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        inputMode="decimal"
        placeholder={placeholder}
        aria-label={label}
        aria-invalid={invalid ? 'true' : undefined}
        aria-describedby={describedBy}
        className={`${INPUT} pr-11 tabular-nums`}
      />
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-subtle">
        kg
      </span>
    </div>
  );
}

const normalize = (text) => text.replace(/\s/g, '').toLowerCase();

function Highlight({ text, query }) {
  const index = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-transparent font-bold text-brand-600">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}

/** 품종 검색·선택 목록 */
function BreedCombo({ varieties, selected, text, invalid, onType, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  /** 목록 필터 글자 (전체 목록은 null) */
  const [query, setQuery] = useState(null);
  const [active, setActive] = useState(-1);

  const shown =
    query == null || normalize(query) === ''
      ? varieties
      : varieties.filter((vrty) =>
          normalize(vrty.vrtyNm).includes(normalize(query)),
        );
  /** 방향키 이동 항목 */
  const optionCount = shown.length + 1;

  const open = () => {
    setIsOpen(true);
    setActive(-1);
  };

  const close = () => {
    setIsOpen(false);
    setQuery(null);
    setActive(-1);
  };

  const pick = (index) => {
    if (index < shown.length) {
      const vrty = shown[index];
      onSelect(String(vrty.vrtySn), vrty.vrtyNm);
    } else {
      onSelect(VRTY_DRCT_INPT, VRTY_DRCT_LABEL);
    }
    close();
  };

  const handleChange = (e) => {
    onType(e.target.value);
    setQuery(e.target.value);
    setIsOpen(true);
    setActive(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) open();
      else setActive((prev) => (prev + 1) % optionCount);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) setActive((prev) => (prev <= 0 ? optionCount - 1 : prev - 1));
    } else if (e.key === 'Enter' && isOpen && active >= 0) {
      e.preventDefault();
      pick(active);
    } else if (e.key === 'Escape' && isOpen) {
      e.stopPropagation();
      close();
    }
  };

  return (
    <div
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) close();
      }}
    >
      <div className="relative">
        <input
          id="pet-vrty"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="pet-vrty-list"
          aria-activedescendant={
            active >= 0 ? `pet-vrty-opt-${active}` : undefined
          }
          aria-invalid={invalid ? 'true' : undefined}
          aria-describedby="pet-vrty-h pet-vrty-e"
          autoComplete="off"
          value={text}
          onChange={handleChange}
          onFocus={open}
          onKeyDown={handleKeyDown}
          placeholder="품종 이름 검색 또는 목록에서 선택"
          className={`${INPUT} pr-10`}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label="품종 목록 열기"
          onMouseDown={(e) => {
            e.preventDefault();
            if (isOpen) close();
            else {
              setQuery(null);
              open();
              document.getElementById('pet-vrty')?.focus();
            }
          }}
          className="absolute top-1/2 right-1 grid size-8 -translate-y-1/2 place-items-center rounded-sm text-subtle"
        >
          <ChevronDown
            className={`size-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
      {isOpen && (
        <ul
          id="pet-vrty-list"
          role="listbox"
          aria-label="품종 목록"
          className="absolute top-[calc(100%+6px)] right-0 left-0 z-30 max-h-64 overflow-y-auto rounded-md border border-line bg-white p-1 shadow-depth-md"
        >
          {shown.length === 0 && (
            <li className="flex h-9 items-center px-2.5 text-muted">
              검색 결과가 없어요
            </li>
          )}
          {shown.map((vrty, index) => {
            const isSelected = selected === String(vrty.vrtySn);
            return (
              <li
                key={vrty.vrtySn}
                id={`pet-vrty-opt-${index}`}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(index);
                }}
                className={`flex h-9 cursor-pointer items-center justify-between gap-2 rounded-sm px-2.5 ${
                  isSelected
                    ? 'bg-brand-50 font-semibold text-brand-600'
                    : active === index
                      ? 'bg-surface-2'
                      : 'hover:bg-surface-2'
                }`}
              >
                <span>
                  <Highlight text={vrty.vrtyNm} query={query ?? ''} />
                </span>
                {isSelected && <Check className="size-[18px] text-brand-500" />}
              </li>
            );
          })}
          <li
            id={`pet-vrty-opt-${shown.length}`}
            role="option"
            aria-selected={selected === VRTY_DRCT_INPT}
            onMouseDown={(e) => {
              e.preventDefault();
              pick(shown.length);
            }}
            className={`mt-1 flex h-9 cursor-pointer items-center gap-2 rounded-sm border-t border-line px-2.5 text-ink-2 ${
              active === shown.length ? 'bg-surface-2' : 'hover:bg-surface-2'
            }`}
          >
            {VRTY_DRCT_LABEL}
          </li>
        </ul>
      )}
    </div>
  );
}
