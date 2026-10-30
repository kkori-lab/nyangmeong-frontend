import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Clock,
  HeartHandshake,
  Lock,
  MessagesSquare,
  Wallet,
} from 'lucide-react';
import SettingsCard from '@/components/SettingsCard';
import Toggle from '@/components/Toggle';
import { PATHS } from '@/routes/paths';
import { useSaveNotificationSettings } from '../queries';

/** 저장 요청 키 (maskedAcntEml·expndLimSetYn은 서버 표시용이라 제외) */
const SAVE_KEYS = [
  'emlNotiRcptnYn',
  'inappNotiRcptnYn',
  'careSchdlNotiRcptnYn',
  'leadTimes',
  'mtchDlngNotiRcptnYn',
  'cmntNotiRcptnYn',
  'lostExpryNotiRcptnYn',
  'expndLimNotiRcptnYn',
];

const BEFORE_DAYS = [
  { key: 'TODAY', label: '당일' },
  { key: 'D1', label: '1일 전' },
  { key: 'D3', label: '3일 전' },
  { key: 'D7', label: '7일 전' },
];

const ALWAYS_ON = [
  '공동양육 초대·결과·연동 해제',
  '캐릭터 생성 완료',
  '1:1 문의 답변',
  '공지사항',
];

/** 사전 알림 시점은 선택 순서와 상관없이 같은 집합이면 동일 */
const isSameLeadTimes = (a, b) =>
  a.length === b.length && a.every((item) => b.includes(item));

function SettingRow({ title, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#edf1f1] px-5 py-4 last:border-b-0">
      <div>
        <p className="text-base font-semibold text-[#1a3234]">{title}</p>
        {description && (
          <p className="mt-0.5 text-sm text-[#566465]">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

/** settings 서버 값, draft 화면 편집 값 */
export default function NotificationSettingsForm({ settings }) {
  const [draft, setDraft] = useState(settings);
  const { mutate: save, isPending } = useSaveNotificationSettings();

  const isChanged = SAVE_KEYS.some((key) =>
    key === 'leadTimes'
      ? !isSameLeadTimes(draft.leadTimes, settings.leadTimes)
      : draft[key] !== settings[key],
  );
  const needsLimit = draft.expndLimNotiRcptnYn && !settings.expndLimSetYn;

  const handleChange = (key) => (value) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const toggleLeadTime = (key) =>
    setDraft((prev) => ({
      ...prev,
      leadTimes: prev.leadTimes.includes(key)
        ? prev.leadTimes.filter((item) => item !== key)
        : [...prev.leadTimes, key],
    }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const body = Object.fromEntries(SAVE_KEYS.map((key) => [key, draft[key]]));
    save(body);
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <SettingsCard icon={Bell} title="알림 채널">
        <SettingRow
          title="이메일로 받기"
          description={`${settings.maskedAcntEml} (가입 이메일 · 변경할 수 없어요)`}
        >
          <Toggle
            label="이메일로 받기"
            checked={draft.emlNotiRcptnYn}
            onChange={handleChange('emlNotiRcptnYn')}
          />
        </SettingRow>
        <SettingRow
          title="앱 알림함으로 받기"
          description="두 채널을 모두 끄면 어떤 알림도 보내지 않아요"
        >
          <Toggle
            label="앱 알림함으로 받기"
            checked={draft.inappNotiRcptnYn}
            onChange={handleChange('inappNotiRcptnYn')}
          />
        </SettingRow>
      </SettingsCard>

      <SettingsCard icon={CalendarDays} title="케어 일정">
        <SettingRow
          title="예정일 알림"
          description="예방접종·정기검진·반복 예방 예정일을 미리 알려드려요"
        >
          <Toggle
            label="예정일 알림"
            checked={draft.careSchdlNotiRcptnYn}
            onChange={handleChange('careSchdlNotiRcptnYn')}
          />
        </SettingRow>
        <div className="px-5 py-4">
          <p className="text-base font-semibold text-[#1a3234]">
            미리 알림 시점{' '}
            <span className="text-xs font-normal text-[#566465]">
              여러 개 선택
            </span>
          </p>
          <div className="mt-3 flex gap-2">
            {BEFORE_DAYS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                aria-pressed={draft.leadTimes.includes(key)}
                className={`h-9 rounded-full border px-4 text-sm ${
                  draft.leadTimes.includes(key)
                    ? 'border-[#285a5c] bg-[#285a5c] text-white'
                    : 'border-[#d5dcdc] bg-white text-[#3d4a4b]'
                }`}
                onClick={() => toggleLeadTime(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-2 rounded-lg bg-[#f4f6f6] px-4 py-3 text-sm text-[#566465]">
            <Clock size={16} className="shrink-0" aria-hidden="true" />
            사전 알림은 매일 오전 9시에 발송돼요. 이후에 등록·변경한 오늘 알림은
            발송되지 않아요.
          </p>
        </div>
      </SettingsCard>

      <SettingsCard icon={HeartHandshake} title="펫돌봄 거래 상태">
        <SettingRow
          title="거래 상태 알림"
          description="매칭 요청·수락·취소, 돌봄 완료·확인"
        >
          <Toggle
            label="거래 상태 알림"
            checked={draft.mtchDlngNotiRcptnYn}
            onChange={handleChange('mtchDlngNotiRcptnYn')}
          />
        </SettingRow>
      </SettingsCard>

      <SettingsCard icon={MessagesSquare} title="커뮤니티">
        <SettingRow
          title="댓글 알림"
          description="내 글·댓글에 댓글이 달리면 알려드려요"
        >
          <Toggle
            label="댓글 알림"
            checked={draft.cmntNotiRcptnYn}
            onChange={handleChange('cmntNotiRcptnYn')}
          />
        </SettingRow>
        <SettingRow
          title="실종 제보 글 만료 예고"
          description="만료 7일 전과 전날에 알려드려요"
        >
          <Toggle
            label="실종 제보 글 만료 예고"
            checked={draft.lostExpryNotiRcptnYn}
            onChange={handleChange('lostExpryNotiRcptnYn')}
          />
        </SettingRow>
      </SettingsCard>

      <SettingsCard icon={Wallet} title="가계부">
        <SettingRow
          title="월 지출 한도 초과 알림"
          description="월 한도 금액은 가계부 화면에서 설정해요"
        >
          <Toggle
            label="월 지출 한도 초과 알림"
            checked={draft.expndLimNotiRcptnYn}
            onChange={handleChange('expndLimNotiRcptnYn')}
          />
        </SettingRow>
        {needsLimit && (
          <p
            role="status"
            className="border-b border-[#edf1f1] bg-[#fff6e5] px-5 py-3 text-sm text-[#7a5200]"
          >
            월 한도를 아직 정하지 않았어요. 가계부에서 한도를 먼저 정해 주세요.
          </p>
        )}
        <Link
          to={PATHS.MYPAGE_EXPENSES}
          className="flex items-center gap-1 px-5 py-4 text-sm font-semibold text-[#1a3234]"
        >
          가계부로 이동
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      </SettingsCard>

      <SettingsCard icon={Lock} title="항상 받는 알림">
        {ALWAYS_ON.map((name) => (
          <SettingRow key={name} title={name}>
            <span className="rounded-full bg-[#eef1f1] px-2.5 py-1 text-xs text-[#566465]">
              끌 수 없음
            </span>
          </SettingRow>
        ))}
      </SettingsCard>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isChanged || isPending}
          className="h-10 rounded-lg bg-[#285a5c] px-8 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          저장
        </button>
      </div>
    </form>
  );
}
