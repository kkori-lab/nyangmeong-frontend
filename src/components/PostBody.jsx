import FileImage from '@/components/FileImage';
import { publicFileUrl } from '@/utils/fileUrl';

/** 줄 전체가 ![설명](/api/files/public/숫자)인 줄만 이미지. 그 밖의 줄은 글 */
const IMAGE_LINE = /^!\[([^\]]*)\]\(\/api\/files\/public\/(\d+)\)$/;

/** 한 문단을 글 덩어리(문자열)와 이미지({ atchFileSn, alt })로 나눈다 */
function splitImageLines(paragraph) {
  const blocks = [];
  let textLines = [];
  const flush = () => {
    if (textLines.length) blocks.push(textLines.join('\n'));
    textLines = [];
  };
  paragraph.split('\n').forEach((line) => {
    const match = IMAGE_LINE.exec(line.trim());
    if (!match) {
      textLines.push(line);
      return;
    }
    flush();
    blocks.push({ atchFileSn: Number(match[2]), alt: match[1] });
  });
  flush();
  return blocks;
}

/**
 * 게시판 본문 영역: 최소 높이 160px + 아래 여백 40px
 * - fileImages: 줄 전체가 ![](/api/files/public/숫자)인 줄을 공개 파일 이미지로 그린다(공지 본문). 다른 주소는 글 그대로
 * - 160px은 글과 사진(children)을 합친 영역 기준. 사진이 있으면 글 아래를 160px까지 채우지 않고 글 길이까지만 표시
 * - 글을 먼저, 사진·지도(children)를 24px 아래에 표시. mediaFirst면 사진을 먼저(펫뉴스처럼 대표 이미지가 위인 글)
 * - 글은 빈 줄로 문단 구분
 */
export default function PostBody({
  content,
  children,
  mediaFirst = false,
  fileImages = false,
}) {
  const text = (
    <div className="text-base leading-[1.6] text-[#1a3234]">
      {content
        .split('\n\n')
        .flatMap((paragraph) =>
          fileImages ? splitImageLines(paragraph) : [paragraph],
        )
        .map((block, index) =>
          typeof block === 'string' ? (
            <p key={index} className="mb-5 whitespace-pre-line last:mb-0">
              {block}
            </p>
          ) : (
            <FileImage
              key={index}
              src={publicFileUrl(block.atchFileSn)}
              alt={block.alt}
              className="mx-auto mb-5 block h-auto max-w-full rounded-[10px] last:mb-0"
              fallback={<></>}
            />
          ),
        )}
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
