import { useEffect, useState } from 'react';
import { Link, generatePath, useNavigate } from 'react-router-dom';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { showToast } from '@/components/toastStore';
import { PATHS } from '@/routes/paths';
import {
  useAnalyzeLabPdf,
  useCreateInspections,
  useUpdateInspection,
} from '../queries';
import { getInspectionName } from '../checkup/checkupTypes';
import AnalysisReview from './AnalysisReview';
import { findBloodItem } from './bloodItems';
import { DIRECT } from './ItemSelect';
import LabItemForm from './LabItemForm';
import {
  getExcludeReason,
  getSkippedNames,
  toInspectionValue,
} from './labRows';

const EMPTY_FORM = {
  item: '',
  directNm: '',
  val: '',
  unit: '',
  rangeMin: '',
  rangeMax: '',
  memo: '',
};

const toText = (value) => (value == null ? '' : String(value));

const isNumber = (text) => text.trim() !== '' && Number.isFinite(Number(text));

const toRows = (items) =>
  items.map((item, index) => ({
    key: `${item.inspItmNm}-${index}`,
    inspItmNm: item.inspItmNm,
    isBlood: item.bloodYn !== false,
    rsltVal: toText(item.rsltVal),
    unitNm: toText(item.unitNm),
    hasUnitInput: !item.unitNm,
    refMinVal: item.refMinVal ?? null,
    refMaxVal: item.refMaxVal ?? null,
  }));

/** 수정 진입: 저장된 행으로 입력칸을 채운다. 목록에 없는 항목 이름은 직접입력으로 */
const toEditForm = (item) => {
  const name = getInspectionName(item);
  return {
    item: findBloodItem(name) ? name : DIRECT,
    directNm: findBloodItem(name) ? '' : name,
    val: toText(item.rsltNvl),
    unit: toText(item.unitNm),
    rangeMin: toText(item.refLlmtNvl),
    rangeMax: toText(item.refUplmtNvl),
    memo: toText(item.memoCn),
  };
};

const getItemName = (form) =>
  form.item === DIRECT ? form.directNm.trim() : form.item;

/**
 * [검사 수치 입력] (SCR-HLT-007)
 * - mode 'pdf': 분석 결과 확인 + 입력칸(추가로 넣을 항목이 있을 때만 사용), 'manual': 입력칸만, 'edit': 저장된 행 수정
 * - 저장하면 검진상세로 복귀. 취소는 입력값을 버리고 복귀
 * - analyzedItems가 없으면(새로고침 등) atchSn의 첨부 파일을 다시 분석
 */
export default function LabInput({
  petSn,
  ckupRcdSn,
  mode,
  detail,
  editItem,
  analyzedItems,
  atchSn,
}) {
  const navigate = useNavigate();
  const detailPath = generatePath(PATHS.HEALTH_CHECKUP_DETAIL, {
    petSn,
    ckupRcdSn,
  });
  const analyzeLabPdf = useAnalyzeLabPdf();
  const createInspections = useCreateInspections();
  const updateInspection = useUpdateInspection();

  const [isReviewOpen, setIsReviewOpen] = useState(mode === 'pdf');
  const [rows, setRows] = useState(() => toRows(analyzedItems ?? []));
  const [form, setForm] = useState(() =>
    editItem ? toEditForm(editItem) : EMPTY_FORM,
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isEdit = mode === 'edit';
  const attachment = detail.attachments.find(
    (item) => item.ckupRcdAtchSn === atchSn,
  );
  const isPending = createInspections.isPending || updateInspection.isPending;

  const runAnalysis = () =>
    analyzeLabPdf.mutate(
      { ckupRcdSn, atchSn },
      { onSuccess: (result) => setRows(toRows(result.items)) },
    );

  useEffect(() => {
    if (mode === 'pdf' && !analyzedItems) runAnalysis();
    // 처음 열 때 한 번만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const registeredNames = new Set(
    detail.bloodInspections.map(getInspectionName),
  );
  const savableRows = isReviewOpen
    ? rows.filter(
        (row) =>
          getExcludeReason(row, registeredNames) === null &&
          row.rsltVal.trim() !== '',
      )
    : [];
  const unitErrorNames = isSubmitted
    ? savableRows
        .filter((row) => row.unitNm.trim() === '')
        .map((row) => row.inspItmNm)
    : [];

  /** PDF 분석 중에는 입력칸이 선택 사항: 아무것도 넣지 않았으면 검사 생략 */
  const isFormUsed =
    !isReviewOpen ||
    form.item !== '' ||
    [form.val, form.unit, form.rangeMin, form.rangeMax, form.memo].some(
      (text) => text.trim() !== '',
    );

  const itemName = getItemName(form);
  const hasOneSideRange =
    (form.rangeMin.trim() === '') !== (form.rangeMax.trim() === '');
  /** 서버 수정은 null을 "안 바꿈"으로 받아, 저장된 참고범위는 비워서 지울 수 없다 */
  const hasSavedRange = editItem?.refLlmtNvl != null;
  const takenNames = new Set([
    ...registeredNames,
    ...savableRows.map((row) => row.inspItmNm),
  ]);

  const getFormErrors = () => {
    const errors = {};
    if (itemName === '') errors.item = '검사 항목을 선택해 주세요';
    else if (!isEdit && takenNames.has(itemName)) {
      errors.item = `이미 등록된 항목입니다: ${itemName}`;
    }
    if (form.val.trim() === '') errors.val = '검사 결과값을 입력해 주세요';
    else if (!isNumber(form.val)) errors.val = '숫자로 입력해 주세요';
    if (form.unit.trim() === '') errors.unit = '단위를 입력해 주세요';
    if (hasOneSideRange) {
      errors.range = '참고범위는 최소·최대를 함께 입력하거나 둘 다 비워 주세요';
    } else if (isEdit && hasSavedRange && form.rangeMin.trim() === '') {
      errors.range = '참고범위는 수정에서 지울 수 없어요';
    } else if (
      form.rangeMin.trim() !== '' &&
      !(isNumber(form.rangeMin) && isNumber(form.rangeMax))
    ) {
      errors.range = '참고범위는 숫자로 입력해 주세요';
    }
    return errors;
  };

  const formErrors = isFormUsed ? getFormErrors() : {};
  const shownErrors = isSubmitted ? formErrors : {};

  const changeForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const changeRow = (key, field, value) =>
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, [field]: value } : row)),
    );

  const showManual = () => {
    setIsReviewOpen(false);
    setForm(EMPTY_FORM);
    setIsSubmitted(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isPending) return;
    setIsSubmitted(true);
    const hasFormError = Object.keys(formErrors).length > 0;
    const hasRowError = savableRows.some((row) => row.unitNm.trim() === '');
    const hasRowNumberError = savableRows.some((row) => !isNumber(row.rsltVal));
    if (hasFormError || hasRowError || hasRowNumberError) return;

    const rangeOf = (min, max) => ({
      refLlmtNvl: min.trim() === '' ? null : Number(min),
      refUplmtNvl: max.trim() === '' ? null : Number(max),
    });

    if (isEdit) {
      updateInspection.mutate(
        {
          petSn,
          ckupRcdSn,
          inspNvlSn: editItem.inspNvlSn,
          rsltNvl: Number(form.val),
          unitNm: form.unit.trim(),
          ...rangeOf(form.rangeMin, form.rangeMax),
          memoCn: form.memo.trim(),
        },
        { onSuccess: () => navigate(detailPath) },
      );
      return;
    }

    const names = savableRows.map((row) => row.inspItmNm);
    const values = savableRows.map((row) =>
      toInspectionValue(row.inspItmNm, {
        rsltNvl: Number(row.rsltVal),
        unitNm: row.unitNm.trim(),
        refLlmtNvl: row.refMinVal,
        refUplmtNvl: row.refMaxVal,
        memoCn: '',
      }),
    );
    if (isFormUsed) {
      names.push(itemName);
      values.push(
        toInspectionValue(itemName, {
          rsltNvl: Number(form.val),
          unitNm: form.unit.trim(),
          ...rangeOf(form.rangeMin, form.rangeMax),
          memoCn: form.memo.trim(),
        }),
      );
    }
    if (values.length === 0) {
      showToast('저장할 검사 수치가 없어요');
      return;
    }
    createInspections.mutate(
      { petSn, ckupRcdSn, values },
      {
        onSuccess: (savedValues) => {
          const skippedNames = getSkippedNames(names, values, savedValues);
          if (skippedNames.length > 0) {
            showToast(`이미 등록된 항목입니다: ${skippedNames.join(', ')}`);
          }
          navigate(detailPath);
        },
      },
    );
  };

  return (
    <form noValidate className="flex flex-col gap-7" onSubmit={handleSubmit}>
      {isReviewOpen && (
        <AnalysisReview
          fileName={attachment?.orgnlFileNm}
          rows={rows}
          registeredNames={registeredNames}
          unitErrorNames={unitErrorNames}
          isAnalyzing={analyzeLabPdf.isPending}
          onChangeRow={changeRow}
          onRerun={runAnalysis}
          onManual={showManual}
        />
      )}

      <section
        aria-label="검사 수치 입력"
        className="rounded-[14px] border border-line bg-white px-[18px] pt-4 pb-[18px] shadow-[0_1px_2px_rgba(26,50,52,0.04)] sm:px-[22px] sm:pt-5 sm:pb-[22px]"
      >
        <LabItemForm
          form={form}
          errors={shownErrors}
          isEdit={isEdit}
          onChange={changeForm}
        />
        <div className="mt-6 flex justify-end gap-2">
          <Link
            to={detailPath}
            className={`${BTN_SECONDARY} min-w-24`}
            aria-disabled={isPending}
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className={`${BTN_PRIMARY} min-w-24`}
          >
            저장하기
          </button>
        </div>
      </section>
    </form>
  );
}
