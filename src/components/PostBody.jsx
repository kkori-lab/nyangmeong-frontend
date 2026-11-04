/**
 * 게시판 본문 영역: 최소 높이 160px + 아래 여백 40px
 * - 160px은 글과 사진(children)을 합친 영역 기준. 사진이 있으면 글 아래를 160px까지 채우지 않고 글 길이까지만 표시
 * - 글을 먼저, 사진·지도(children)를 24px 아래에 표시. mediaFirst면 사진을 먼저(펫뉴스처럼 대표 이미지가 위인 글)
 * - 글은 빈 줄로 문단 구분
 */
export default function PostBody({ content, children, mediaFirst = false }) {
  const text = (
    <div className="text-base leading-[1.6] text-[#1a3234]">
      {content.split('\n\n').map((paragraph) => (
        <p key={paragraph} className="mb-5 whitespace-pre-line last:mb-0">
          {paragraph}
        </p>
      ))}
    </div>
  );

  return (
    <div className="mt-6 pb-10">
      <div className="min-h-[160px]">
        {mediaFirst ? (
          <>
            {children}
            {text}
          </>
        ) : (
          <>
            {text}
            {children && <div className="mt-6">{children}</div>}
          </>
        )}
      </div>
    </div>
  );
}
