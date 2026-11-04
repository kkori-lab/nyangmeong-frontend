import { User } from 'lucide-react';
import FileImage from '@/components/FileImage';

/**
 * 회원 프로필 사진 (커뮤니티 작성자·댓글 작성자)
 *
 * 사용법
 *   <Avatar src={publicFileUrl(post.mbrAtchFileSn)} className="size-8" iconSize={18} />
 *
 * - src: 사진 주소. null이거나 열리지 않으면(404 등) 기본 아이콘
 * - className: 크기(`size-*`). 이미지와 기본 아이콘 자리에 똑같이 붙는다
 * - iconSize: 기본 아이콘 크기(px)
 * - 꾸밈용이라 화면 읽기에서는 숨긴다(옆에 닉네임이 있음)
 */
export default function Avatar({ src, className = '', iconSize = 18 }) {
  const shape = `block shrink-0 rounded-full ${className}`;
  return (
    <FileImage
      src={src}
      className={`${shape} object-cover`}
      fallback={
        <span
          aria-hidden="true"
          className={`${shape} grid place-items-center bg-brand-50 text-brand-500`}
        >
          <User size={iconSize} />
        </span>
      }
    />
  );
}
