import FadeIn from './FadeIn';

// 랜딩 섹션 머리(히어로 제외). 모든 섹션이 같은 영어 라벨·제목·설명 모양을 쓴다
// isLight: 어두운 사진 배경 위에 올릴 때 글자를 흰색으로
export default function SectionTitle({
  label,
  title,
  desc,
  className = '',
  isLight = false,
}) {
  return (
    <FadeIn
      delay={100}
      className={`flex flex-col items-center space-y-4 text-center ${className}`}
    >
      <span
        className={`text-[14px] font-medium tracking-wider uppercase md:text-[18px] lg:text-[20px] ${
          isLight ? 'text-white/80' : 'text-[#2c6669]'
        }`}
      >
        {label}
      </span>
      <h2
        className={`text-[28px] leading-tight font-normal break-keep md:text-[40px] lg:text-[48px] ${
          isLight ? 'text-white' : 'text-black'
        }`}
      >
        {title}
      </h2>
      {desc && (
        <p
          className={`text-[14px] leading-relaxed break-keep md:text-[18px] lg:text-[20px] ${
            isLight ? 'text-white/85' : 'text-black'
          }`}
        >
          {desc}
        </p>
      )}
    </FadeIn>
  );
}
