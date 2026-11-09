import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import AiErrorGuide from '@/components/AiErrorGuide';

const STYLES = {
  error: { box: 'bg-danger-soft', icon: 'text-danger', Icon: CircleAlert },
  warn: { box: 'bg-warn-soft', icon: 'text-warn', Icon: CircleAlert },
  ok: {
    box: 'bg-tone-green-bg',
    icon: 'text-tone-green-fg',
    Icon: CircleCheck,
  },
  info: { box: 'bg-brand-50', icon: 'text-brand-500', Icon: Info },
};

// 처리 결과를 폼 위에 알린다. 나타날 때 서서히 떠오른다(움직임 줄이기 설정이면 바로 보인다)
// hasGuide면 같은 문구가 두 번 보이지 않게 AI 안내 말풍선만 보인다. 말풍선은 aria-hidden이라 문구를 화면 읽기용으로 따로 둔다
export default function AuthNotice({ type, message, hasGuide }) {
  if (hasGuide) {
    return (
      <div role="alert" className="mb-6">
        <span className="sr-only">{message}</span>
        <AiErrorGuide message={message} />
      </div>
    );
  }
  const style = STYLES[type];
  const Icon = style.Icon;
  return (
    <div
      role="alert"
      className={`relative mb-6 flex flex-wrap gap-2.5 rounded-box px-4 py-3.5 leading-6 text-ink-2 transition-[opacity,translate] duration-300 ease-out starting:translate-y-1 starting:opacity-0 motion-reduce:transition-none ${style.box}`}
    >
      <Icon className={`mt-0.5 size-5 shrink-0 ${style.icon}`} />
      <span className="min-w-0 flex-1">{message}</span>
    </div>
  );
}
