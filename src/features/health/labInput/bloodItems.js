/**
 * [혈액검사 항목 12종]
 * - 기능 태그 4묶음(코드는 checkup/checkupTypes.js의 FUNCTION_TAGS와 같다)에 약어 + 한글 이름 (FN-HLT-007-02)
 * - inspArtclCd: 저장할 때 보내는 검사항목 공통코드(HLTG12)
 */
export const BLOOD_ITEM_GROUPS = [
  {
    cd: 'CBC',
    nm: '혈구',
    items: [
      { ab: 'WBC', kn: '백혈구', inspArtclCd: 'HLTC0024' },
      { ab: 'RBC', kn: '적혈구', inspArtclCd: 'HLTC0025' },
      { ab: 'HGB', kn: '헤모글로빈', inspArtclCd: 'HLTC0026' },
      { ab: 'HCT', kn: '적혈구 용적률', inspArtclCd: 'HLTC0027' },
      { ab: 'PLT', kn: '혈소판', inspArtclCd: 'HLTC0028' },
    ],
  },
  {
    cd: 'KID',
    nm: '신장',
    items: [
      { ab: 'BUN', kn: '요소질소', inspArtclCd: 'HLTC0029' },
      { ab: 'CREA', kn: '크레아티닌', inspArtclCd: 'HLTC0030' },
      { ab: 'SDMA', kn: '대칭성 디메틸아르지닌', inspArtclCd: 'HLTC0078' },
    ],
  },
  {
    cd: 'LIV',
    nm: '간',
    items: [
      { ab: 'ALT', kn: '알라닌아미노전이효소', inspArtclCd: 'HLTC0031' },
      {
        ab: 'AST',
        kn: '아스파르테이트아미노전이효소',
        inspArtclCd: 'HLTC0032',
      },
      { ab: 'ALP', kn: '알칼리인산분해효소', inspArtclCd: 'HLTC0033' },
    ],
  },
  {
    cd: 'GLU',
    nm: '당',
    items: [{ ab: 'GLU', kn: '포도당', inspArtclCd: 'HLTC0034' }],
  },
];

/** 약어로 항목을 찾는다. 목록에 없으면(직접입력 항목) null */
export const findBloodItem = (ab) => {
  for (const group of BLOOD_ITEM_GROUPS) {
    const item = group.items.find((candidate) => candidate.ab === ab);
    if (item) return { ...item, fnctTagCd: group.cd, tagNm: group.nm };
  }
  return null;
};
