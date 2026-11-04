import FileImage from '@/components/FileImage';
import { useFileImage } from '@/hooks/useFileImage';

/**
 * [아이템 이미지]
 * - GET /items/{itemSn}/image. 없거나 열리지 않으면 fallback(없으면 이름 앞 두 글자)
 */
export default function ItemImage({ item, fallback }) {
  const { src, isPending } = useFileImage({
    queryKey: ['items', item.itemSn, 'image'],
    url: `/items/${item.itemSn}/image`,
  });
  return (
    <FileImage
      src={src}
      pending={isPending}
      className="size-full object-contain [image-rendering:pixelated]"
      fallback={
        fallback ?? <span aria-hidden="true">{item.itemNm.slice(0, 2)}</span>
      }
    />
  );
}
