import { generatePath, Link } from 'react-router-dom';
import FileImage from '@/components/FileImage';
import { PATHS } from '@/routes/paths';
import { formatDateTime } from '@/utils/formatDate';
import { publicFileUrl } from '@/utils/fileUrl';
import { BBS_OPTIONS, getOptionLabel, POST_STATUS_OPTIONS } from './postLabels';

/**
 * [게시글 상세 정보]
 * - 작성자 -> 회원 상세
 * - 본문은 글 그대로 줄바꿈 표시
 */
export default function PostDetailInfo({ post }) {
  const rows = [
    [
      '게시판 · 상태',
      `${getOptionLabel(BBS_OPTIONS, post.bbsCd)} · ${getOptionLabel(
        POST_STATUS_OPTIONS,
        post.pstSttsCd,
      )}`,
    ],
    ['제목', post.pstTtl],
    [
      '작성자',
      <Link
        key="author"
        to={generatePath(PATHS.ADMIN_MEMBER_DETAIL, { mbrSn: post.mbrSn })}
        className="hover:underline"
      >
        {post.mbrNcnm}
      </Link>,
    ],
    ['작성일', formatDateTime(post.regDt)],
    [
      '신고 · 댓글',
      `신고 ${post.dclrCnt.toLocaleString()}건 · 댓글 ${post.cmntCnt.toLocaleString()}개`,
    ],
    [
      '본문',
      <p key="body" className="whitespace-pre-line">
        {post.pstCn}
      </p>,
    ],
  ];

  return (
    <dl className="rounded-[14px] border border-line bg-white">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="grid grid-cols-[180px_1fr] gap-3 border-b border-line px-4 py-3 text-base last:border-b-0 max-[760px]:grid-cols-[130px_1fr]"
        >
          <dt className="text-subtle">{label}</dt>
          <dd className="min-w-0 break-words text-ink-2">{value}</dd>
        </div>
      ))}
      {post.images.length > 0 && (
        <div className="grid grid-cols-[180px_1fr] gap-3 px-4 py-3 text-base max-[760px]:grid-cols-[130px_1fr]">
          <dt className="text-subtle">이미지</dt>
          <dd className="flex min-w-0 flex-wrap gap-2">
            {post.images.map(({ atchFileSn }, index) => (
              <FileImage
                key={atchFileSn}
                src={publicFileUrl(atchFileSn)}
                alt={`게시글 사진 ${index + 1}`}
                className="size-28 rounded-[8px] object-cover"
              />
            ))}
          </dd>
        </div>
      )}
    </dl>
  );
}
