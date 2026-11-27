import { Fragment, useEffect, useRef, useState } from 'react';
import { ImagePlus, RefreshCw } from 'lucide-react';
import DatePicker from '@/components/DatePicker';
import DropdownSelect from '@/components/DropdownSelect';
import TimeSelect from '@/components/TimeSelect';
import { BTN_SECONDARY, CHIP, CHIP_ON } from '@/components/buttonStyles';
import { INPUT, TEXTAREA } from '@/components/formStyles';
import { BADGE_COLORS, TONE_CLASSES } from '@/constants/calendarBadge';
import {
  formatDate,
  getHmOf,
  getMonth,
  getDay,
  getTodayYmd,
  getYear,
  getYmdOf,
  makeDateTime,
} from '@/utils/formatDate';
import {
  RECEIPT_ACCEPT,
  RECEIPT_HELP,
  validateReceiptFile,
} from '@/utils/receiptFile';
import {
  useChatBreeds,
  useChatCheckups,
  useChatObservationItems,
  useChatPets,
  useChatPixelCharacter,
  useChatReceivedInvitation,
  useChatSentInvitations,
  useChatShopItems,
} from '../queries';
import { actionFieldName, actionValueName } from '../shared/actionFields';
import {
  ACCEPT_INVITATION_TOOL,
  CANCEL_INVITATION_TOOL,
  CARE_ITEM_TOOL,
  EQUIP_TOOL,
  HOUR_INPUT_FIELD,
  INSPECTION_TOOL,
  INVITE_TOOL,
  MEMBER_PROFILE_TOOL,
  PET_CREATE_TOOL,
  PURCHASE_TOOL,
  cardRows,
  hasBreedRow,
  hasCheckupRow,
  hasInvitationRow,
  hasObservationItemRow,
  hasPlaceRow,
  hasValues,
  isNumberList,
  isValueList,
  isHourInputDerived,
  isProfileReset,
  hasPetChoice,
  missingFields,
  nextDueYmd,
} from './actionForm';

const LABEL_CLASS = 'text-sm leading-[22px] text-subtle';
const VALUE_CLASS = 'min-w-0 break-words text-base leading-6 text-ink';
const MISSING = '입력해 주세요';
/** 사진 칸만 빈 채로 확인 말("등록해 줘")이 왔을 때 */
const PHOTO_FIRST = '사진을 올려야 등록돼요';
/** 프로필 사진 카드는 등록이 아니라 수정이라 사진 안내를 따로 둔다 */
const PROFILE_PHOTO_MISSING = '사진을 올려 주세요';

/** 빈 사진 칸 안내: 프로필 사진 카드는 늘 "사진을 올려 주세요" */
const photoMissingText = (card, isPhotoAsked) => {
  if (card.tool === MEMBER_PROFILE_TOOL) return PROFILE_PHOTO_MISSING;
  return isPhotoAsked ? PHOTO_FIRST : MISSING;
};

/** 직접 입력 검사항목 코드(HLTG12) */
const DIRECT_INPUT_ARTICLE = 'HLTC0035';

const isEmpty = (value) =>
  value === undefined || value === null || value === '';

/** "2026.10.06 (화)" */
const formatYmd = (ymd) => formatDate(ymd, { weekday: true });

/** 숫자 칸: 천 단위 쉼표 */
const formatNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number)
    ? number.toLocaleString('ko-KR', { maximumFractionDigits: 3 })
    : String(value);
};

/** 칸 값 표시: 코드는 이름, 참거짓은 예/아니요, 날짜·일시는 요일까지(시간 입력 아니요면 날짜만) */
const formatValue = (param, value, input) => {
  switch (param.type) {
    case 'code':
      return param.codes?.find((code) => code.cd === value)?.nm ?? value;
    case 'boolean':
      return value ? '예' : '아니요';
    case 'date':
      return formatYmd(value);
    case 'datetime': {
      const ymd = getYmdOf(value);
      const hasTime = input.hrInptYn !== false && value.length >= 16;
      return hasTime ? `${formatYmd(ymd)} ${getHmOf(value)}` : formatYmd(ymd);
    }
    case 'int':
    case 'long':
    case 'decimal':
      return formatNumber(value);
    default:
      return String(value);
  }
};

/** 값 목록 칸 값: 값 이름, 목록은 values 순서대로 " · ", 빈 목록은 "없음" */
const valuesText = (field, param, value) => {
  if (!Array.isArray(value)) return actionValueName(field, value);
  if (value.length === 0) return '없음';
  return param.values
    .filter((item) => value.includes(item))
    .map((item) => actionValueName(field, item))
    .join(' · ');
};

/** 캘린더 뱃지 색: 색 점 + 이름 */
function BadgeColor({ value }) {
  const color = BADGE_COLORS.find((badge) => badge.cd === value);
  if (!color) return value;
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className={`size-3 rounded-full ${TONE_CLASSES[color.tone].bar}`}
      />
      {color.nm}
    </span>
  );
}

/** 검사 수치 표: 항목·수치·단위·참고 범위 */
function InspectionTable({ card, values }) {
  const codes = card.params.values?.items?.inspArtclCd?.codes ?? [];
  const nameOf = (value) =>
    (value.inspArtclCd && value.inspArtclCd !== DIRECT_INPUT_ARTICLE
      ? codes.find((code) => code.cd === value.inspArtclCd)?.nm
      : null) ??
    value.inspArtclDrctInptNm ??
    value.inspArtclCd ??
    '-';
  const rangeOf = ({ refLlmtNvl: low, refUplmtNvl: high }) => {
    if (isEmpty(low) && isEmpty(high)) return '-';
    if (isEmpty(high)) return `${formatNumber(low)} 이상`;
    if (isEmpty(low)) return `${formatNumber(high)} 이하`;
    return `${formatNumber(low)}~${formatNumber(high)}`;
  };
  return (
    <div className="overflow-x-auto overscroll-x-contain">
      <table className="w-full min-w-[320px] text-left text-sm leading-[22px] tabular-nums">
        <thead className="text-subtle">
          <tr className="border-b border-line">
            <th scope="col" className="py-1.5 pr-3 font-normal">
              항목
            </th>
            <th scope="col" className="py-1.5 pr-3 text-right font-normal">
              수치
            </th>
            <th scope="col" className="py-1.5 pr-3 font-normal">
              단위
            </th>
            <th scope="col" className="py-1.5 font-normal">
              참고 범위
            </th>
          </tr>
        </thead>
        <tbody className="text-ink">
          {values.map((value, index) => (
            <tr key={index} className="border-b border-line last:border-b-0">
              <td className="py-1.5 pr-3 font-semibold">{nameOf(value)}</td>
              <td className="py-1.5 pr-3 text-right">
                {isEmpty(value.rsltNvl) ? (
                  <span className="text-danger">{MISSING}</span>
                ) : (
                  formatNumber(value.rsltNvl)
                )}
              </td>
              <td className="py-1.5 pr-3">{value.unitNm ?? '-'}</td>
              <td className="py-1.5">{rangeOf(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 목록 칸(지출 줄 등): 줄마다 칸 이름 값을 잇는다, 번호 칸·서버가 만드는 칸·빈 칸은 뺀다 */
function ArrayItems({ param, values, input }) {
  const itemParams = Object.entries(param.items ?? {}).filter(
    ([field, itemParam]) =>
      !/Sn$/.test(field) && !itemParam?.generated && itemParam?.type !== 'file',
  );
  return (
    <ul className="flex flex-col gap-1">
      {values.map((value, index) => (
        <li key={index}>
          {itemParams
            .filter(([field]) => !isEmpty(value[field]))
            .map(
              ([field, itemParam]) =>
                `${actionFieldName(field)} ${formatValue(itemParam, value[field], input)}`,
            )
            .join(' · ')}
        </li>
      ))}
    </ul>
  );
}

/** 검진기록 이름: "10월 20일 ○○병원", 올해가 아니면 연도부터 */
const checkupName = (checkup) => {
  const ymd = checkup.ckupYmd;
  const date = `${getMonth(ymd)}월 ${getDay(ymd)}일`;
  const withYear =
    getYear(ymd) === getYear(getTodayYmd())
      ? date
      : `${getYear(ymd)}년 ${date}`;
  return [withYear, checkup.hsptlNm].filter(Boolean).join(' ');
};

/** 검사 수치를 넣을 검진기록: 정해졌으면 이름, 비어 있으면 그 반려동물 검진기록에서 고른다 */
function CheckupValue({ input, isDisabled, onChange }) {
  const {
    data: checkups,
    isPending,
    isError,
  } = useChatCheckups(input.petSn ?? null);
  if (input.petSn == null) {
    return <span className="text-subtle">반려동물을 먼저 골라 주세요</span>;
  }
  if (isPending) return <span className="text-subtle">불러오는 중…</span>;
  if (isError) {
    return <span className="text-danger">검진기록을 불러오지 못했어요</span>;
  }
  if (!isEmpty(input.ckupRcdSn)) {
    const checkup = checkups.find(
      (item) => item.ckupRcdSn === Number(input.ckupRcdSn),
    );
    return checkup ? checkupName(checkup) : `검진기록 ${input.ckupRcdSn}`;
  }
  if (checkups.length === 0) {
    return <span className="text-danger">검진기록이 없어요</span>;
  }
  return (
    <div className="flex flex-col gap-1">
      <DropdownSelect
        value={null}
        placeholder="검진기록을 골라 주세요"
        label="검진기록"
        size="sm"
        invalid
        disabled={isDisabled}
        options={checkups.map((checkup) => ({
          value: checkup.ckupRcdSn,
          label: checkupName(checkup),
        }))}
        onChange={(ckupRcdSn) => onChange({ ckupRcdSn })}
      />
      <span className="text-sm leading-[22px] text-danger">
        넣을 검진기록을 골라 주세요
      </span>
    </div>
  );
}

/** 관찰 기록을 추가할 관찰 항목: "항목명 · 부위 · 세부 위치" */
function ObservationItemValue({ petSn, obsrvArtclSn }) {
  const { data: items, isPending, isError } = useChatObservationItems(petSn);
  if (isEmpty(obsrvArtclSn))
    return <span className="text-danger">{MISSING}</span>;
  if (isPending) return <span className="text-subtle">불러오는 중…</span>;
  if (isError) {
    return <span className="text-danger">관찰 항목을 불러오지 못했어요</span>;
  }
  const item = items.find(
    (target) => target.obsrvArtclSn === Number(obsrvArtclSn),
  );
  if (!item) return `관찰 항목 ${obsrvArtclSn}`;
  /** 부위와 세부 위치가 같으면("등 · 등") 한 번만 */
  const names = [item.obsrvArtclNm, item.obsrvRegnCdNm, item.obsrvRegnDtlNm]
    .map((name) => name?.trim())
    .filter(Boolean);
  return names.filter((name, index) => name !== names[index - 1]).join(' · ');
}

const LOADING = '불러오는 중…';
const NOTE_CLASS = 'text-sm leading-[22px] text-subtle';

/** 포인트: "1,200P"(아이템 상점과 같다) */
const formatPoint = (value) => `${Number(value).toLocaleString('ko-KR')}P`;

/**
 * 번호 목록 이름: 모두 찾으면 "까미, 탄이", 조회 중이면 불러오는 중, 못 찾은 번호가 있으면 "N개"
 * - nameOf(번호) → 이름 또는 null
 */
function NumberNames({ sns, query, nameOf }) {
  if (sns.length === 0) return '없음';
  if (query.isPending) return <span className="text-subtle">{LOADING}</span>;
  const names = query.isError ? [] : sns.map((sn) => nameOf(Number(sn)));
  if (names.length === 0 || names.some((name) => !name)) {
    return `${sns.length}개`;
  }
  return names.join(', ');
}

/** 반려동물 이름 목록: [{ petSn, petNm }]에서 */
const petNameOf = (pets) => (petSn) =>
  pets?.find((pet) => pet.petSn === petSn)?.petNm ?? null;

/** 초대 발송: 내 반려동물 이름 */
function InvitePetsValue({ sns }) {
  const query = useChatPets();
  return <NumberNames sns={sns} query={query} nameOf={petNameOf(query.data)} />;
}

/** 초대 수락: 받은 초대의 반려동물 이름, 고르지 않은 아이는 거절(사람 결정 2026-11-27, 고치기는 말로) */
function AcceptPetsValue({ sns, jntBrupInvtnSn }) {
  const query = useChatReceivedInvitation(jntBrupInvtnSn ?? null);
  return (
    <div className="flex flex-col gap-0.5">
      <span>
        <NumberNames
          sns={sns}
          query={query}
          nameOf={petNameOf(query.data?.pets)}
        />
      </span>
      <span className={NOTE_CLASS}>고르지 않은 아이는 거절돼요</span>
    </div>
  );
}

/** 아이템 구매: 이름(필요 포인트), 아래 합계·보유 포인트 */
function PurchaseItemsValue({ sns, pixelCharSn }) {
  const query = useChatShopItems(pixelCharSn ?? null);
  const items = sns.map((sn) =>
    query.data?.items?.find((item) => item.itemSn === Number(sn)),
  );
  const isFound = !query.isPending && items.every(Boolean);
  return (
    <div className="flex flex-col gap-0.5">
      <span>
        <NumberNames
          sns={sns}
          query={query}
          nameOf={(itemSn) => {
            const item = items.find((target) => target?.itemSn === itemSn);
            return item ? `${item.itemNm}(${formatPoint(item.needPnt)})` : null;
          }}
        />
      </span>
      {isFound && sns.length > 0 && (
        <span className={NOTE_CLASS}>
          합계{' '}
          <span className="tabular-nums">
            {formatPoint(items.reduce((sum, item) => sum + item.needPnt, 0))}
          </span>{' '}
          · 보유{' '}
          <span className="tabular-nums">
            {formatPoint(query.data.hldPnt ?? 0)}
          </span>
        </span>
      )}
    </div>
  );
}

/** 착용 저장: 보유 아이템 이름, 빈 목록이면 모두 벗기(목록에 없는 보유 아이템은 해제) */
function EquippedItemsValue({ sns, pixelCharSn }) {
  const query = useChatPixelCharacter(pixelCharSn ?? null);
  if (sns.length === 0) return '모두 벗기';
  return (
    <NumberNames
      sns={sns}
      query={query}
      nameOf={(hldItemSn) =>
        query.data?.heldItems?.find((held) => held.hldItemSn === hldItemSn)
          ?.itemNm ?? null
      }
    />
  );
}

/** 번호 목록 칸 값: 도구마다 이름을 받을 곳이 다르다, 모르는 칸은 "N개" */
function NumberListValue({ card, field, value, input }) {
  if (card.tool === INVITE_TOOL && field === 'petSns') {
    return <InvitePetsValue sns={value} />;
  }
  if (card.tool === ACCEPT_INVITATION_TOOL && field === 'petSns') {
    return (
      <AcceptPetsValue sns={value} jntBrupInvtnSn={input.jntBrupInvtnSn} />
    );
  }
  if (card.tool === PURCHASE_TOOL && field === 'itemSns') {
    return <PurchaseItemsValue sns={value} pixelCharSn={input.pixelCharSn} />;
  }
  if (card.tool === EQUIP_TOOL && field === 'hldItemSns') {
    return <EquippedItemsValue sns={value} pixelCharSn={input.pixelCharSn} />;
  }
  return value.length === 0 ? '없음' : `${value.length}개`;
}

/** 초대에 든 반려동물 이름 "까미, 탄이" */
const invitationPetNames = (invitation) =>
  (invitation?.pets ?? []).map((pet) => pet.petNm).join(', ');

/** 받은 초대(수락·거절): "○○님의 초대", 거절 카드는 반려동물 이름까지 */
function ReceivedInvitationValue({ jntBrupInvtnSn, hasPets }) {
  const { data, isPending, isError } = useChatReceivedInvitation(
    jntBrupInvtnSn ?? null,
  );
  if (isEmpty(jntBrupInvtnSn)) {
    return <span className="text-danger">{MISSING}</span>;
  }
  if (isPending) return <span className="text-subtle">{LOADING}</span>;
  /** 처리한 초대는 보낸 사람이 비어 올 수 있다 */
  if (isError || !data?.sndrMbrNcnm) return `초대 ${jntBrupInvtnSn}`;
  const pets = invitationPetNames(data);
  return [`${data.sndrMbrNcnm}님의 초대`, hasPets && pets]
    .filter(Boolean)
    .join(' · ');
}

/** 보낸 초대(취소): "받는 이메일 · 반려동물 이름" */
function SentInvitationValue({ jntBrupInvtnSn }) {
  const { data, isPending, isError } = useChatSentInvitations();
  if (isEmpty(jntBrupInvtnSn)) {
    return <span className="text-danger">{MISSING}</span>;
  }
  if (isPending) return <span className="text-subtle">{LOADING}</span>;
  const invitation = isError
    ? null
    : data?.find((item) => item.jntBrupInvtnSn === Number(jntBrupInvtnSn));
  if (!invitation) return `초대 ${jntBrupInvtnSn}`;
  return [invitation.invtnTrgtEml, invitationPetNames(invitation)]
    .filter(Boolean)
    .join(' · ');
}

/** 초대 줄 값: 취소는 보낸 초대, 수락·거절은 받은 초대 */
function InvitationValue({ card, input }) {
  if (card.tool === CANCEL_INVITATION_TOOL) {
    return <SentInvitationValue jntBrupInvtnSn={input.jntBrupInvtnSn} />;
  }
  return (
    <ReceivedInvitationValue
      jntBrupInvtnSn={input.jntBrupInvtnSn}
      hasPets={card.tool !== ACCEPT_INVITATION_TOOL}
    />
  );
}

/**
 * 장소 줄 값: 카드 대상 글(장소 이름·주소), 없으면 "장소 번호 N"
 * - 번호는 카드에서 고를 수 없어 비었으면 말로 알려 달라고 한다
 */
function PlaceValue({ card, plcSn }) {
  if (isEmpty(plcSn)) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-danger">{MISSING}</span>
        <span className="text-sm leading-[22px] text-subtle">
          어느 장소인지 말로 알려 주세요
        </span>
      </div>
    );
  }
  return card.targetText || `장소 번호 ${plcSn}`;
}

/** 품종 줄을 보일지: 등록 카드는 늘(비면 입력해 주세요), 수정 카드는 값이 있을 때만 */
const isBreedShown = (card, input) =>
  hasBreedRow(card) &&
  (card.tool === PET_CREATE_TOOL ||
    !isEmpty(input.vrtySn) ||
    !isEmpty(input.vrtyDrctInptNm));

/** 품종 값: 번호면 품종 목록 이름, 아니면 직접 입력한 이름 */
function BreedValue({ input }) {
  const hasSn = !isEmpty(input.vrtySn);
  const { data, isPending, isError } = useChatBreeds(
    hasSn ? input.petSeCd : null,
  );
  if (!hasSn) {
    return isEmpty(input.vrtyDrctInptNm) ? (
      <span className="text-danger">{MISSING}</span>
    ) : (
      `${input.vrtyDrctInptNm}(직접 입력)`
    );
  }
  if (input.petSeCd && isPending) {
    return <span className="text-subtle">{LOADING}</span>;
  }
  const breed = isError
    ? null
    : data?.find((item) => item.vrtySn === Number(input.vrtySn));
  return breed?.vrtyNm ?? `품종 ${input.vrtySn}`;
}

/** 칩으로 고르는 칸이 이보다 많으면 펼침 목록 */
const MAX_CHIP_COUNT = 6;
/** 이보다 긴 글 칸은 여러 줄 */
const TEXTAREA_LENGTH = 100;

/** 일시 입력: 날짜 + 시간(선택), 시간 입력 칸이 있으면 시간을 넣었는지로 정한다 */
function DateTimeInput({
  value,
  hasHourField,
  isMissing,
  isDisabled,
  onChange,
}) {
  const [ymd, setYmd] = useState(value ? getYmdOf(value) : '');
  const [hm, setHm] = useState(
    value && value.length >= 16 ? getHmOf(value) : '',
  );
  const change = (nextYmd, nextHm) => {
    setYmd(nextYmd);
    setHm(nextHm);
    const patch = { value: nextYmd ? makeDateTime(nextYmd, nextHm) : '' };
    if (hasHourField) patch[HOUR_INPUT_FIELD] = nextYmd ? Boolean(nextHm) : '';
    onChange(patch);
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <DatePicker
        value={ymd}
        label="날짜"
        size="sm"
        invalid={isMissing}
        disabled={isDisabled}
        className="w-[168px]"
        onChange={(nextYmd) => change(nextYmd, hm)}
      />
      <TimeSelect
        className="w-full max-w-[280px] min-w-0"
        value={hm}
        disabled={isDisabled}
        onChange={(nextHm) => change(ymd, nextHm)}
      />
      {hasHourField && (
        <span className="w-full text-sm leading-[22px] text-subtle">
          시간을 비우면 날짜만 저장해요
        </span>
      )}
    </div>
  );
}

/** 카드에서 바로 채우는 칸(추가-1): 코드·참거짓은 칩, 날짜·일시는 날짜 입력, 글·숫자는 입력칸 */
function EditableValue({
  card,
  field,
  param,
  value,
  isMissing,
  isDisabled,
  onChangeInput,
}) {
  const set = (next) => onChangeInput({ [field]: next });
  const label = actionFieldName(field);
  if (isValueList(param)) {
    /** 여러 개 고르기: 다시 누르면 뺀다, 값은 values 순서대로 넣는다 */
    const picked = Array.isArray(value) ? value : [];
    const toggle = (item) =>
      set(
        param.values.filter((one) =>
          one === item ? !picked.includes(one) : picked.includes(one),
        ),
      );
    return (
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {param.values.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={picked.includes(item)}
            disabled={isDisabled}
            className={picked.includes(item) ? CHIP_ON : CHIP}
            onClick={() => toggle(item)}
          >
            {actionValueName(field, item)}
          </button>
        ))}
      </div>
    );
  }
  if (param.type === 'code' || param.type === 'boolean' || hasValues(param)) {
    let options;
    if (hasValues(param)) {
      options = param.values.map((item) => ({
        value: item,
        label: actionValueName(field, item),
      }));
    } else if (param.type === 'boolean') {
      options = [
        { value: true, label: '예' },
        { value: false, label: '아니요' },
      ];
    } else {
      options = (param.codes ?? []).map((code) => ({
        value: code.cd,
        label: code.nm,
      }));
    }
    if (options.length > MAX_CHIP_COUNT) {
      return (
        <DropdownSelect
          value={value ?? null}
          label={label}
          placeholder="골라 주세요"
          size="sm"
          invalid={isMissing}
          disabled={isDisabled}
          options={options}
          onChange={set}
        />
      );
    }
    return (
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={value === option.value}
            disabled={isDisabled}
            className={value === option.value ? CHIP_ON : CHIP}
            onClick={() => set(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }
  if (param.type === 'date') {
    return (
      <DatePicker
        value={value ?? ''}
        label={label}
        size="sm"
        invalid={isMissing}
        disabled={isDisabled}
        className="w-[168px]"
        onChange={set}
      />
    );
  }
  if (param.type === 'datetime') {
    const hasHourField = isHourInputDerived(card, card.input);
    return (
      <DateTimeInput
        value={value ?? ''}
        hasHourField={hasHourField}
        isMissing={isMissing}
        isDisabled={isDisabled}
        onChange={({ value: next, ...rest }) =>
          onChangeInput({ [field]: next, ...rest })
        }
      />
    );
  }
  const isNumber = ['int', 'long', 'decimal'].includes(param.type);
  const isLong = !isNumber && (param.maxLength ?? 0) > TEXTAREA_LENGTH;
  const props = {
    value: value ?? '',
    'aria-label': label,
    'aria-invalid': isMissing,
    maxLength: param.maxLength ?? undefined,
    disabled: isDisabled,
    onChange: (event) => set(event.target.value),
  };
  if (isLong) return <textarea {...props} rows={3} className={TEXTAREA} />;
  return (
    <input
      {...props}
      inputMode={isNumber ? 'decimal' : undefined}
      className={INPUT}
    />
  );
}

/**
 * 사진 칸(파일 칸): 비어 있으면 끌어다 놓기 칸 모양의 고르기 버튼, 고르면 미리보기 + [바꾸기]
 * - 영수증 업로드와 같은 검사(jpg·jpeg·png·webp, 10MB, 실제 형식). 통과 못 하면 안내만 하고 붙이지 않는다
 */
function PhotoField({
  label,
  value,
  isMissing,
  missingText = MISSING,
  isDisabled,
  onPick,
}) {
  const fileRef = useRef(null);
  const [fileError, setFileError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!(value instanceof Blob)) return undefined;
    const url = URL.createObjectURL(value);
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- 고른 파일이 바뀔 때 미리보기 주소를 만들고 정리 */
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const handleChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const message = await validateReceiptFile(file);
    setFileError(message);
    if (!message) onPick(file);
  };

  const hasFile = value instanceof Blob && previewUrl;
  return (
    <div className="flex flex-col gap-1">
      {hasFile ? (
        <div className="relative overflow-hidden rounded-box border border-line">
          <img
            src={previewUrl}
            alt={`고른 ${label}`}
            className="block h-40 w-full object-cover"
          />
          <button
            type="button"
            disabled={isDisabled}
            className={`${BTN_SECONDARY} absolute right-2 bottom-2 h-8 px-3 text-sm`}
            onClick={() => fileRef.current.click()}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            바꾸기
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={isDisabled}
          aria-invalid={isMissing || Boolean(fileError)}
          className={`flex min-h-30 w-full flex-col items-center justify-center gap-2 rounded-box border border-dashed bg-surface-2 p-4 text-subtle enabled:hover:border-brand-500 enabled:hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60 ${
            fileError ? 'border-danger' : 'border-line-strong'
          }`}
          onClick={() => fileRef.current.click()}
        >
          <ImagePlus className="size-8" aria-hidden="true" />
          <b className="font-semibold text-ink">{label}을 올려 주세요</b>
          <span className="text-sm">{RECEIPT_HELP}</span>
        </button>
      )}
      {fileError ? (
        <span role="alert" className="text-sm leading-[22px] text-danger">
          {fileError}
        </span>
      ) : (
        isMissing && (
          <span className="text-sm leading-[22px] text-danger">
            {missingText}
          </span>
        )
      )}
      <input
        ref={fileRef}
        type="file"
        accept={RECEIPT_ACCEPT}
        aria-label={`${label} 고르기`}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}

/**
 * 칸 한 줄: 이름 | 값, 서버 칸 오류는 값 아래
 * - isStacked: 카드에서 입력하는 줄은 760 미만에서 이름을 위로 올려 입력이 카드 폭을 다 쓴다(시간 3칸이 넘치지 않게)
 */
function Row({ label, error, isStacked = false, children }) {
  const columns = isStacked
    ? 'max-[760px]:grid-cols-1 max-[760px]:gap-y-1'
    : 'max-[760px]:grid-cols-[88px_minmax(0,1fr)]';
  return (
    <div
      className={`grid grid-cols-[104px_minmax(0,1fr)] items-start gap-x-3 ${columns}`}
    >
      <dt className={`${LABEL_CLASS} pt-px`}>{label}</dt>
      <dd className={VALUE_CLASS}>
        {children}
        {error && (
          <p className="mt-0.5 text-sm leading-[22px] text-danger">{error}</p>
        )}
      </dd>
    </div>
  );
}

/**
 * [확인 카드 칸] (FN-AIM-012-05·06·07, SCR-AIM-013 검사 수치)
 * - 칸 규칙(params) 순서대로 "칸 이름 | 값", 빈 필수 칸은 "입력해 주세요"
 * - 반려동물: 정했으면 이름, 못 정했으면 이름 칩(가장 최근 카드만, 누르면 말로 고르기와 같이 보냄)
 * - 검사 수치: 넣을 검진기록 + 항목·수치·단위·참고 범위 표
 * - 케어 항목: 다음 예정일(주기 미정이면 "—")
 * - 서버 칸 오류는 그 칸 아래(카드 아래 오류 줄은 ActionCard가 errorFieldsShown 밖만)
 */
export default function ActionCardFields({
  card,
  input,
  fieldErrors,
  isActive,
  isDisabled,
  onChoosePet,
  onChangeInput,
  photoFields = [],
  isPhotoAsked = false,
}) {
  const rows = cardRows(card, input);
  /** 칸 없는 카드(예: 튜토리얼 봤음 저장): 빈 목록이 카드 간격을 하나 더 만들지 않게 그리지 않음 */
  const hasNoParams = Object.keys(card.params ?? {}).length === 0;
  const isInspection = card.tool === INSPECTION_TOOL;
  /**
   * 서버 칸 오류가 난 값 목록 칸은 카드에서 고른다(사람 결정 2026-11-27, 값 목록 칸만)
   * - 고르면 오류가 지워지므로 한 번 열린 칸은 카드가 남아 있는 동안 계속 고를 수 있다
   */
  const [errorOpened, setErrorOpened] = useState([]);
  const newlyErrored = Object.keys(fieldErrors).filter(
    (field) => hasValues(card.params[field]) && !errorOpened.includes(field),
  );
  if (newlyErrored.length > 0) {
    setErrorOpened([...errorOpened, ...newlyErrored]);
  }
  if (hasNoParams) return null;
  const petNm =
    card.petNm ??
    card.petChoices.find((pet) => pet.petSn === input.petSn)?.petNm;
  const hasPetChips = isActive && hasPetChoice(card) && input.petSn == null;
  const missing = missingFields(card, input);
  /** 반려동물 줄: 선택 칸(필수 아님)이 비면 다른 선택 칸처럼 숨김(예: 지출 조건 삭제의 빈 반려동물 = 전체) */
  const isPetRowShown =
    'petSn' in card.params &&
    (input.petSn != null ||
      hasPetChips ||
      missing.includes('petSn') ||
      Boolean(fieldErrors.petSn));
  const breedRow = isBreedShown(card, input) && (
    <Row
      key="vrtySn"
      label={actionFieldName('vrtySn')}
      error={fieldErrors.vrtySn ?? fieldErrors.vrtyDrctInptNm}
    >
      <BreedValue input={input} />
    </Row>
  );
  /** 품종은 종류 줄 바로 아래, 종류 줄이 없으면 맨 아래 */
  const hasKindRow = rows.some(({ field }) => field === 'petSeCd');

  return (
    <dl className="flex flex-col gap-2">
      {isPetRowShown && (
        <Row label="반려동물" error={fieldErrors.petSn}>
          {input.petSn != null && (petNm ?? '')}
          {hasPetChips && (
            <div className="flex flex-wrap gap-2">
              {card.petChoices.map((pet) => (
                <button
                  key={pet.petSn}
                  type="button"
                  disabled={isDisabled}
                  className="h-8 rounded-full border border-line bg-white px-3 text-sm leading-[1.25] text-ink-2 enabled:hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => onChoosePet(pet)}
                >
                  {[pet.petNm, pet.petSeNm, pet.vrtyNm]
                    .filter(Boolean)
                    .join(' · ')}
                </button>
              ))}
            </div>
          )}
          {input.petSn == null && !hasPetChips && (
            <span className="text-danger">{MISSING}</span>
          )}
        </Row>
      )}
      {hasObservationItemRow(card) && (
        <Row label="관찰 항목" error={fieldErrors.obsrvArtclSn}>
          <ObservationItemValue
            petSn={input.petSn ?? null}
            obsrvArtclSn={input.obsrvArtclSn}
          />
        </Row>
      )}
      {hasInvitationRow(card) && (
        <Row label={actionFieldName('jntBrupInvtnSn')}>
          <InvitationValue card={card} input={input} />
        </Row>
      )}
      {hasPlaceRow(card) && (
        <Row label={actionFieldName('plcSn')} error={fieldErrors.plcSn}>
          <PlaceValue card={card} plcSn={input.plcSn} />
        </Row>
      )}
      {hasCheckupRow(card) && (
        <Row label="검진기록" error={fieldErrors.ckupRcdSn}>
          <CheckupValue
            input={input}
            isDisabled={isDisabled || !isActive}
            onChange={onChangeInput}
          />
        </Row>
      )}
      {rows.map(
        ({ field, param, value, isMissing, isEditable: isEditableAtFirst }) => {
          const isEditable = isEditableAtFirst || errorOpened.includes(field);
          if (isInspection && field === 'values' && Array.isArray(value)) {
            return (
              <div key={field} className="flex flex-col gap-1">
                <dt className={LABEL_CLASS}>
                  {actionFieldName(field)} {value.length}항목
                </dt>
                <dd>
                  <InspectionTable card={card} values={value} />
                </dd>
              </div>
            );
          }
          let content;
          if (isEditable) {
            content = (
              <div className="flex flex-col gap-1">
                <EditableValue
                  card={card}
                  field={field}
                  param={param}
                  value={value}
                  isMissing={isMissing}
                  isDisabled={isDisabled || !isActive}
                  onChangeInput={onChangeInput}
                />
                {isMissing && (
                  <span className="text-sm leading-[22px] text-danger">
                    {MISSING}
                  </span>
                )}
              </div>
            );
          } else if (isMissing) {
            content = <span className="text-danger">{MISSING}</span>;
          } else if (hasValues(param)) {
            content = valuesText(field, param, value);
          } else if (isNumberList(param) && Array.isArray(value)) {
            content = (
              <NumberListValue
                card={card}
                field={field}
                value={value}
                input={input}
              />
            );
          } else if (param.type === 'array' && Array.isArray(value)) {
            content = <ArrayItems param={param} values={value} input={input} />;
          } else if (field === 'cldrBadgeColrCd') {
            content = <BadgeColor value={value} />;
          } else {
            content = (
              <span className="whitespace-pre-wrap">
                {formatValue(param, value, input)}
              </span>
            );
          }
          const row = (
            <Row
              key={field}
              label={actionFieldName(field)}
              isStacked={isEditable}
              error={fieldErrors[field]}
            >
              {content}
            </Row>
          );
          if (field === 'petSeCd' && breedRow) {
            return (
              <Fragment key={field}>
                {row}
                {breedRow}
              </Fragment>
            );
          }
          return row;
        },
      )}
      {!hasKindRow && breedRow}
      {(isProfileReset(card, input) ? [] : photoFields).map((field) => (
        <Row key={field} label={actionFieldName(field)} isStacked>
          <PhotoField
            label={actionFieldName(field)}
            value={input[field]}
            isMissing={missing.includes(field)}
            missingText={photoMissingText(card, isPhotoAsked)}
            isDisabled={isDisabled || !isActive}
            onPick={(file) => onChangeInput({ [field]: file })}
          />
        </Row>
      ))}
      {card.tool === CARE_ITEM_TOOL && (
        <Row label="다음 예정일">
          {nextDueYmd(input) ? formatYmd(nextDueYmd(input)) : '—'}
        </Row>
      )}
    </dl>
  );
}
