import { useState } from 'react';

/**
 * 검색창 입력 초안: 입력값은 화면에서 보관하고, 주소의 검색어(keyword)가 바뀌면 맞춘다
 * - 입력 중에 자동 검색이 주소를 바꿔도(내가 보낸 값) 입력창을 덮어쓰지 않아 포커스·글자가 유지된다
 * - 뒤로 가기·초기화처럼 밖에서 바뀐 검색어만 입력창에 반영한다
 * - commit(): 지금 입력값(앞뒤 공백 뺀)을 적용할 값으로 돌려주고 「내가 보낸 값」으로 기록한다
 */
export default function useSearchDraft(keyword) {
  const [input, setInput] = useState(keyword);
  const [seen, setSeen] = useState(keyword);
  const [sent, setSent] = useState(keyword);

  if (keyword !== seen) {
    setSeen(keyword);
    if (keyword !== sent) {
      setInput(keyword);
      setSent(keyword);
    }
  }

  const commit = () => {
    const next = input.trim();
    setSent(next);
    return next;
  };

  return { input, setInput, commit };
}
