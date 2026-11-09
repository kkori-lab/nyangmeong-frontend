// spacing: 모바일에서 제목 아래를 띄워 입력 요소가 화면 가운데 가까이 오게 한다
// - wide: 로그인·SNS 가입 확인(추가-5·6)
// - step: 회원가입 단계. 아래 단계 표시(1·2·3·4) 높이만큼 덜 띄워 첫 입력 요소를 로그인과 같은 높이에 둔다(추가-7)
const SPACING = {
  wide: 'mb-5 max-md:mb-[12vh]',
  step: 'mb-5 max-md:mb-[max(20px,calc(12vh-67px))]',
};

export default function AuthHeading({ title, subtitle, spacing }) {
  return (
    <div className={SPACING[spacing] ?? 'mb-5'}>
      <h2 className="mb-1.5 text-[26px] font-bold tracking-[-0.02em] text-ink max-md:text-2xl">
        {title}
      </h2>
      <p className="text-sm leading-normal text-subtle">{subtitle}</p>
    </div>
  );
}
