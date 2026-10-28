/**
 * 장소 찾기(전북 한정): 카카오맵 SDK services(장소 검색·주소 검색·좌표→주소)로 브라우저에서 바로 찾는다
 * - kakao는 @/hooks/useKakaoMap이 불러온 SDK
 * - 돌려주는 키는 목격 장소 키(wtnsPlcNm·wtnsPlcAddr·wtnsPlcLat·wtnsPlcLot·sggNm·emdNm). 주소는 「전북 …」으로 맞춘다
 */

/** 전북 전체를 덮는 사각형(경도·위도). 가장자리의 다른 도 결과는 주소로 한 번 더 거른다 */
const JEONBUK_RECT = '126.35,35.28,127.92,36.16';
const JEONBUK = /^(전북특별자치도|전라북도|전북)/;

export const isJeonbuk = (address) => JEONBUK.test(address ?? '');
const toJeonbuk = (address) => address.replace(JEONBUK, '전북');

/** SDK 콜백을 Promise로. 결과 없음은 빈 배열 */
const call = (kakao, run) =>
  new Promise((resolve, reject) => {
    run((result, status) => {
      if (status === kakao.maps.services.Status.OK) resolve(result);
      else if (status === kakao.maps.services.Status.ZERO_RESULT) resolve([]);
      else reject(new Error('카카오 검색 실패'));
    });
  });

/**
 * 검색어 하나로 장소 검색과 주소(동·도로명·지번) 검색을 같이 돌려 전북 결과만 합친다
 * - isAddress: 주소·동 결과(장소명 없이 주소만 보여 준다)
 */
export async function searchPlaces(kakao, keyword) {
  const places = new kakao.maps.services.Places();
  const geocoder = new kakao.maps.services.Geocoder();
  const [placeRows, addressRows] = await Promise.all([
    call(kakao, (cb) =>
      places.keywordSearch(keyword, cb, { rect: JEONBUK_RECT, size: 15 }),
    ),
    call(kakao, (cb) => geocoder.addressSearch(keyword, cb, { size: 10 })),
  ]);

  const fromAddress = addressRows
    .filter((row) => isJeonbuk(row.address_name))
    .map((row) => ({
      key: `address-${row.address_name}`,
      isAddress: true,
      wtnsPlcNm: row.road_address?.building_name || '',
      wtnsPlcAddr: toJeonbuk(row.address_name),
      wtnsPlcLat: Number(row.y),
      wtnsPlcLot: Number(row.x),
    }));
  const fromPlace = placeRows
    .filter((row) => isJeonbuk(row.address_name))
    .map((row) => ({
      key: `place-${row.id}`,
      isAddress: false,
      wtnsPlcNm: row.place_name,
      wtnsPlcAddr: toJeonbuk(row.road_address_name || row.address_name),
      wtnsPlcLat: Number(row.y),
      wtnsPlcLot: Number(row.x),
    }));
  return [...fromAddress, ...fromPlace];
}

/**
 * 카카오 동 이름을 목록 읍·면·동 필터 값으로: 「효자동1가」(법정동)·「인후1동」(행정동) → 「효자동」·「인후동」
 * 필터 목록(missingCodes DONG_BY_REGION)은 서버 행정동 코드 목록으로 바뀐다. 그때 맞춤 규칙도 다시 본다
 */
export const toBaseDong = (name) =>
  name.replace(/\d+가$/, '').replace(/(\D)\d+동$/, '$1동');

/** 좌표의 시군구·동(필터 값). 전북이 아니면 null */
export async function findRegion(kakao, lat, lng) {
  const geocoder = new kakao.maps.services.Geocoder();
  const rows = await call(kakao, (cb) =>
    geocoder.coord2RegionCode(lng, lat, cb),
  );
  const region = rows.find((row) => row.region_type === 'B') ?? rows[0];
  if (!region || !isJeonbuk(region.region_1depth_name)) return null;
  return {
    sggNm: region.region_2depth_name,
    emdNm: toBaseDong(region.region_3depth_name),
  };
}

/**
 * 시군구·동 이름의 중심 좌표(공개 좌표가 없는 펫돌봄 상세·수정용). 못 찾으면 null
 * - 주소 검색에 없는 동네 이름(예: 서곡동)은 장소 검색 첫 결과(전북)로 대신한다
 */
export async function findDongCenter(kakao, sggNm, emdNm) {
  const geocoder = new kakao.maps.services.Geocoder();
  const [row] = await call(kakao, (cb) =>
    geocoder.addressSearch(`전북 ${sggNm} ${emdNm}`, cb),
  );
  if (row) return { wtnsPlcLat: Number(row.y), wtnsPlcLot: Number(row.x) };
  const places = new kakao.maps.services.Places();
  const placeRows = await call(kakao, (cb) =>
    places.keywordSearch(`${sggNm} ${emdNm}`, cb, { rect: JEONBUK_RECT }),
  );
  const place = placeRows.find((item) => isJeonbuk(item.address_name));
  return place
    ? { wtnsPlcLat: Number(place.y), wtnsPlcLot: Number(place.x) }
    : null;
}

/** 지도를 끌어 놓은 좌표의 장소. 전북이 아니면 null */
export async function findPlaceAt(kakao, lat, lng) {
  const region = await findRegion(kakao, lat, lng);
  if (!region) return null;
  const geocoder = new kakao.maps.services.Geocoder();
  const [row] = await call(kakao, (cb) => geocoder.coord2Address(lng, lat, cb));
  const address =
    row?.road_address?.address_name ||
    row?.address?.address_name ||
    `${region.sggNm} ${region.emdNm}`;
  return {
    ...region,
    wtnsPlcNm: row?.road_address?.building_name || `${region.emdNm} 인근`,
    wtnsPlcAddr: toJeonbuk(isJeonbuk(address) ? address : `전북 ${address}`),
    wtnsPlcLat: lat,
    wtnsPlcLot: lng,
  };
}
