/**
 * 게시판 본문 영역: 최소 높이 200px
 * - 200px은 사진(children)과 글을 합친 영역 기준. 사진이 있으면 글 아래를 200px까지 채우지 않고 글 길이까지만 표시
 * - 글은 빈 줄로 문단 구분
 */
export default function PostBody({ content, children }) {
  return (
    <div className="mt-6">
      <div className="min-h-[200px]">
        {children}
        <div className="text-base leading-[1.6] text-[#1a3234]">
          {content.split('\n\n').map((paragraph) => (
            <p key={paragraph} className="mb-5 whitespace-pre-line last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
