/**
 * [조사 고르기]
 * - 끝 글자 받침 기준 '은/는'·'이/가'·'을/를'·'과/와' 중 하나
 * - 끝 글자가 한글이 아니면 받침을 알 수 없어 '은(는)'처럼 둘 다
 */

const HANGUL_FIRST = 0xac00;
const HANGUL_LAST = 0xd7a3;
/** 한글 음절 하나에 딸린 받침 경우의 수(받침 없음 포함) */
const FINAL_COUNT = 28;

/** 단어 뒤에 붙일 조사: pair는 '받침 있을 때/없을 때' 형식 */
export const pickJosa = (word, pair) => {
  const [withFinal, withoutFinal] = pair.split('/');
  const code = (word ?? '').trim().slice(-1).charCodeAt(0);
  if (!(code >= HANGUL_FIRST && code <= HANGUL_LAST)) {
    return `${withFinal}(${withoutFinal})`;
  }
  return (code - HANGUL_FIRST) % FINAL_COUNT === 0 ? withoutFinal : withFinal;
};

/**
 * 부르는 이름: 끝 글자에 받침이 있으면 '이'를 붙인다(구름 → 구름이, 코코 → 코코)
 * - 끝 글자가 한글이 아니면 그대로
 */
export const callName = (name) => {
  const text = (name ?? '').trim();
  const code = text.slice(-1).charCodeAt(0);
  const hasFinal =
    code >= HANGUL_FIRST &&
    code <= HANGUL_LAST &&
    (code - HANGUL_FIRST) % FINAL_COUNT !== 0;
  return hasFinal ? `${text}이` : text;
};
