/**
 * [채팅 입력]
 * - 사진 첨부·주소 공유·메시지 입력·전송 한 줄 (FN-COM-009-19, FN-CMU-005-04·05)
 * - Enter 전송·Shift+Enter 줄바꿈(한글 조합 중에는 보내지 않음), 공백 전송 금지
 * - 전송이 실패하면 입력 유지 후 같은 요청 ID로 재전송
 */
import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import { showToast } from '@/components/toastStore';
import { useSendChatMessage } from '../queries';
import { MSG_TYPE, canShareAddress } from '../shared/chatCodes';
import AddressShareModal from './AddressShareModal';

const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PHOTO_MAX_COUNT = 10;
const PHOTO_MAX_BYTES = 10 * 1024 * 1024;
const TEXTAREA_MIN_HEIGHT = 40;
/** 3줄까지 늘고 그 뒤는 스크롤 */
const TEXTAREA_MAX_HEIGHT = 88;

const NOT_MATCHED_NOTICE = '매칭이 완료된 뒤 주소를 공유할 수 있어요';

const iconButton =
  'grid size-11 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-surface-3 aria-disabled:text-line-strong aria-disabled:hover:bg-transparent';

/** 사진 고르기 검사: 문제가 있으면 문구 */
const checkPhotos = (files, currentCount) => {
  if (files.some((file) => !PHOTO_TYPES.includes(file.type))) {
    return 'JPG·PNG·WEBP 사진만 보낼 수 있어요';
  }
  if (files.some((file) => file.size > PHOTO_MAX_BYTES)) {
    return '사진은 장당 10MB까지 보낼 수 있어요';
  }
  if (currentCount + files.length > PHOTO_MAX_COUNT) {
    return `사진은 한 번에 ${PHOTO_MAX_COUNT}장까지 보낼 수 있어요`;
  }
  return null;
};

export default function ChatMessageInput({
  otoChatRoomSn,
  stage,
  ctptMbrNcnm,
}) {
  const [msgCn, setMsgCn] = useState('');
  const [photos, setPhotos] = useState([]);
  const [photoError, setPhotoError] = useState(null);
  const [failed, setFailed] = useState(null);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const textareaRef = useRef(null);
  const fileRef = useRef(null);
  const sendMessage = useSendChatMessage(otoChatRoomSn);
  const hasPhotos = photos.length > 0;
  const canSend = (msgCn.trim() !== '' || hasPhotos) && !sendMessage.isPending;
  const isAddressEnabled = canShareAddress(stage);

  /** 입력 줄 수에 맞춰 높이 */
  useEffect(() => {
    const textarea = textareaRef.current;
    textarea.style.height = `${TEXTAREA_MIN_HEIGHT}px`;
    textarea.style.height = `${Math.min(textarea.scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
  }, [msgCn]);

  /** 실패하면 body·onDone을 보관해 [다시 보내기]에서 같은 요청 ID로 */
  const send = (body, onDone) => {
    sendMessage.mutate(body, {
      onSuccess: () => {
        setFailed(null);
        onDone();
      },
      onError: () => setFailed({ body, onDone }),
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSend) return;
    if (hasPhotos) {
      send(
        {
          msgTypeCd: MSG_TYPE.IMAGE,
          photoUrls: photos.map((photo) => photo.url),
          idmptDmndId: crypto.randomUUID(),
        },
        () => setPhotos([]),
      );
      return;
    }
    send(
      {
        msgTypeCd: MSG_TYPE.TEXT,
        msgCn: msgCn.trim(),
        idmptDmndId: crypto.randomUUID(),
      },
      () => {
        setMsgCn('');
        textareaRef.current?.focus();
      },
    );
  };

  const handleKeyDown = (event) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      event.currentTarget.form.requestSubmit();
    }
  };

  const handleFiles = (event) => {
    const files = [...event.target.files];
    event.target.value = '';
    if (files.length === 0) return;
    const message = checkPhotos(files, photos.length);
    setPhotoError(message);
    if (message) return;
    setPhotos((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
      })),
    ]);
  };

  const removePhoto = (photo) => {
    URL.revokeObjectURL(photo.url);
    setPhotos((prev) => prev.filter((item) => item.id !== photo.id));
    setPhotoError(null);
  };

  const handleAddressClick = () => {
    if (!isAddressEnabled) {
      showToast(NOT_MATCHED_NOTICE);
      return;
    }
    setIsAddressOpen(true);
  };

  const handleAddressSend = ({ shrnAddr, detail }) =>
    sendMessage.mutate(
      {
        msgTypeCd: MSG_TYPE.ADDRESS,
        shrnAddr,
        msgCn: detail || null,
        idmptDmndId: crypto.randomUUID(),
      },
      {
        onSuccess: () => setIsAddressOpen(false),
        onError: (error) => showToast(error.message),
      },
    );

  return (
    <footer className="shrink-0 border-t border-line bg-white px-3 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))]">
      {hasPhotos && (
        <ul
          className="mb-2 flex gap-2 overflow-x-auto pb-1"
          aria-label="보낼 사진"
        >
          {photos.map((photo) => (
            <li key={photo.id} className="relative shrink-0">
              <img
                src={photo.url}
                alt="보낼 사진 미리보기"
                className="size-16 rounded-box border border-line object-cover"
              />
              <button
                type="button"
                aria-label="사진 빼기"
                className="absolute -top-1.5 -right-1.5 grid size-6 place-items-center rounded-full bg-ink text-white"
                onClick={() => removePhoto(photo)}
              >
                <Icon name="close" className="text-sm" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {photoError && (
        <p role="alert" className="mb-2 text-sm text-danger">
          {photoError}
        </p>
      )}
      {failed && (
        <p
          role="alert"
          className="mb-2 flex items-center justify-between gap-2 rounded-box bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          메시지를 보내지 못했어요
          <button
            type="button"
            className="h-8 shrink-0 rounded-md bg-white px-3 font-semibold text-danger shadow-[inset_0_0_0_1px_currentColor] disabled:opacity-50"
            disabled={sendMessage.isPending}
            onClick={() => send(failed.body, failed.onDone)}
          >
            다시 보내기
          </button>
        </p>
      )}

      <form className="flex items-end gap-1" onSubmit={handleSubmit}>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept={PHOTO_TYPES.join(',')}
          className="hidden"
          onChange={handleFiles}
        />
        <button
          type="button"
          aria-label="사진 첨부"
          className={iconButton}
          onClick={() => fileRef.current.click()}
        >
          <Icon name="image" className="text-2xl" />
        </button>
        <button
          type="button"
          aria-label="주소 공유"
          aria-disabled={!isAddressEnabled}
          className={iconButton}
          onClick={handleAddressClick}
        >
          <Icon name="location_on" className="text-2xl" />
        </button>
        <div className="flex min-w-0 flex-1 items-end gap-1 rounded-[22px] border border-input-line bg-white py-px pr-px pl-4 focus-within:border-brand-500">
          <textarea
            ref={textareaRef}
            rows={1}
            aria-label="메시지"
            placeholder="메시지를 입력하세요"
            className="h-10 max-h-[88px] min-w-0 flex-1 resize-none bg-transparent py-2 leading-6 text-ink outline-none placeholder:text-placeholder"
            value={msgCn}
            onChange={(event) => setMsgCn(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            aria-label="전송"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-500 text-white disabled:bg-surface-3 disabled:text-placeholder"
            disabled={!canSend}
          >
            <Icon name="arrow_upward" className="text-[22px]" />
          </button>
        </div>
      </form>

      {isAddressOpen && (
        <AddressShareModal
          ctptMbrNcnm={ctptMbrNcnm}
          isPending={sendMessage.isPending}
          onClose={() => setIsAddressOpen(false)}
          onSend={handleAddressSend}
        />
      )}
    </footer>
  );
}
