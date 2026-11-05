import { Link } from 'react-router-dom';
import Icon from '@/components/Icon';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import EmptyBox from '../diary/EmptyBox';

/** 카드 제목: 영역 아이콘 + 이름 */
export function CardTitle({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon name={icon} className="text-brand-500" />
      {children}
    </span>
  );
}

/** [전체 보기 ＞] 글자 링크 */
export function MoreLink({ to, state, children = '전체 보기' }) {
  return (
    <Link
      to={to}
      state={state}
      className="inline-flex shrink-0 items-center gap-0.5 font-semibold whitespace-nowrap text-brand-600 hover:underline hover:underline-offset-3"
    >
      {children}
      <Icon name="chevron_right" className="text-xl" />
    </Link>
  );
}

/** 0건 카드: 영역 아이콘 + 안내 + 원천 화면 이동 버튼 1개 */
export function SummaryEmpty({ icon, description, action, to }) {
  return (
    <EmptyBox
      icon={icon}
      title="등록된 기록이 없습니다"
      description={description}
      action={
        to && (
          <Link to={to} className={`${BTN_SECONDARY} mt-2 h-8 px-3`}>
            {action}
          </Link>
        )
      }
    />
  );
}

/** 영역 묶음 제목. PC는 탭 이름과 겹쳐 숨김(탭 내용은 aria-labelledby로 탭 이름을 읽음) (추가 요청) */
export function SectionHead({ title, description }) {
  return (
    <div className="min-[1101px]:hidden">
      <h2 className="text-[22px] leading-[1.35] font-bold tracking-[-0.02em] text-ink">
        {title}
      </h2>
      <p className="mt-1 text-muted">{description}</p>
    </div>
  );
}
