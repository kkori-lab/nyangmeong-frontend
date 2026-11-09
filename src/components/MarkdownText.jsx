import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** HTML 태그는 글자로 두고(rehype-raw 안 씀), 이미지는 그리지 않는다 */
const DISALLOWED = ['img'];

/** react-markdown이 넘기는 `node`는 DOM 속성이 아니라서 빼고 클래스만 붙인다 */
const styled = (Tag, className, extra = {}) =>
  function MarkdownElement(props) {
    const rest = { ...props };
    delete rest.node;
    return <Tag className={className} {...extra} {...rest} />;
  };

/** 말풍선 대화 흐름 안이라 제목은 h3부터 쓴다 */
const components = {
  p: styled('p', 'whitespace-pre-wrap [&:not(:first-child)]:mt-2'),
  h1: styled('h3', 'mt-3 text-[18px] font-bold leading-[28px] first:mt-0'),
  h2: styled('h4', 'mt-3 text-[16px] font-bold leading-[24px] first:mt-0'),
  h3: styled('h5', 'mt-3 font-bold first:mt-0'),
  h4: styled('h6', 'mt-3 font-bold first:mt-0'),
  ul: styled('ul', 'mt-2 list-disc pl-5 first:mt-0 [&_ul]:mt-1'),
  ol: styled('ol', 'mt-2 list-decimal pl-5 first:mt-0 [&_ol]:mt-1'),
  li: styled('li', 'mt-1 first:mt-0'),
  strong: styled('strong', 'font-bold'),
  a: styled('a', 'text-[#285a5c] underline underline-offset-2', {
    target: '_blank',
    rel: 'noopener noreferrer',
  }),
  code: styled('code', 'rounded bg-[#f4f6f6] px-1 text-[14px] leading-[22px]'),
  pre: styled(
    'pre',
    'mt-2 overflow-x-auto rounded-lg bg-[#f4f6f6] p-3 first:mt-0 [&_code]:bg-transparent [&_code]:p-0',
  ),
  blockquote: styled(
    'blockquote',
    'mt-2 border-l-2 border-[#e2e7e7] pl-3 text-[#667374] first:mt-0',
  ),
  hr: styled('hr', 'my-3 border-[#e2e7e7]'),
  table: function MarkdownTable(props) {
    const rest = { ...props };
    delete rest.node;
    return (
      <div className="mt-2 max-w-full overflow-x-auto rounded-lg border border-[#e2e7e7] first:mt-0">
        <table
          className="w-max min-w-full border-collapse text-[14px] leading-[22px] tracking-[-0.03em]"
          {...rest}
        />
      </div>
    );
  },
  thead: styled('thead', 'bg-[#f4f6f6]'),
  th: styled(
    'th',
    'whitespace-nowrap border-b border-[#e2e7e7] px-3 py-2 text-left font-bold [&:not(:last-child)]:border-r',
  ),
  td: styled(
    'td',
    'whitespace-nowrap border-[#e2e7e7] px-3 py-2 [&:not(:last-child)]:border-r [tr:not(:last-child)>&]:border-b',
  ),
};

/** Markdown(GFM) 문자열을 React 요소로 그린다 */
export default function MarkdownText({ text }) {
  return (
    <div className="min-w-0 break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        disallowedElements={DISALLOWED}
        unwrapDisallowed
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
