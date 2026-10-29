# 냥멍케어 프론트엔드 컨벤션: 서버 통신

`AGENTS.md`에서 이어지는 문서다.

## 주소와 인증

- 서버는 둘이다. 메인 서버(Spring Boot)와 AI 서버(Python)이다.
- 메인 서버 요청은 `/api`로 시작하는 상대 경로다. 호스트와 포트를 코드에 적지 않는다. 개발 환경은 Vite 프록시가, 운영은 Nginx가 같은 오리진으로 만들어 준다.
- AI 서버 요청은 `api/axios.js`의 `aiApi` 인스턴스로 보낸다. 주소는 메인 서버처럼 같은 오리진의 `/ai` 상대 경로다(개발은 Vite 프록시 `^/ai/`, 운영은 Nginx `/ai/`가 Python으로 보낸다). 둘 다 접두사를 자르지 않는다. 호스트와 포트를 코드에 적지 않고 환경변수로도 두지 않는다. 같은 오리진이라 CORS와 `withCredentials`가 필요 없다. 오류 모양과 401 처리는 `api`와 같은 응답 인터셉터를 쓴다.
- AI 서버 스트리밍(SSE) 응답은 `api/axios.js`의 `aiStream`으로 받는다. 오류 모양·401 재발급·로그인 이동이 인터셉터와 같다. 화면 코드에서 `fetch`를 직접 쓰지 않는다.
- AI 서버도 로그인한 사용자만 쓴다. 메인 서버가 심은 같은 로그인 쿠키로 확인한다. 401이 오면 `api`와 같이 메인 서버의 재발급을 한 번 거쳐 다시 보낸다.
- 인증은 서버가 심는 HttpOnly 쿠키다. 코드에서 토큰을 읽거나 저장하지 않는다.
- 로그인 여부와 역할은 `features/member`의 `useMe`(`GET /auth/me`: 회원 번호·권한·닉네임·프로필 사진·마스킹 이메일)로만 확인한다. 쿠키가 HttpOnly라 코드에서 읽을 수 없으므로 서버에 묻는 것이 유일한 방법이다. 헤더와 `ProtectedRoute`가 같은 훅을 쓴다.
- 상태를 바꾸는 요청(GET·HEAD·OPTIONS가 아닌 요청)은 `X-Requested-With: XMLHttpRequest` 헤더가 없으면 서버가 403으로 거절한다. `api/axios.js`의 인스턴스가 모든 요청에 붙여 주므로 그 인스턴스만 쓴다. 파일 업로드(`multipart/form-data`)도 같다.
- API 명세(경로, 요청·응답 필드)는 백엔드의 Swagger UI에서 본다. 개발 환경 주소는 `http://localhost:8080/swagger-ui.html`이다.
- 수정(PATCH)은 바꿀 필드만 보낸다. 서버는 보내지 않은 필드와 `null`인 필드를 바꾸지 않는다. 값을 비워야 하면 빈 문자열(`""`)을 보낸다. PUT으로 저장하는 API는 전체를 보내며, 보내지 않은 항목은 지워진다.
- 로그인한 회원 자신의 자원은 `/members/me`처럼 `me` 경로로 요청한다. 회원 일련번호를 경로나 본문에 넣어 보내지 않는다.
  - 로그인 확인과 회원 요약(닉네임·마스킹 이메일)은 `GET /auth/me`(`useMe`, `useMemberSummary`)다. `/members/me`는 회원정보 수정 화면용 상세 조회라 로그인 확인에 쓰지 않는다.

## 응답 모양

2026-10-20 확정. 백엔드 `docs/convention/api.md`와 같다.

```json
{"timestamp":"2026-10-20T09:10:00","status":"success","httpCode":200,"message":"ok","data":{ ... }}
{"timestamp":"2026-10-20T09:10:00","status":"error","httpCode":404,"message":"일치하는 회원정보를 찾을 수 없습니다.","path":"/api/auth/me","code":"MEMBER_NOT_FOUND"}
{"timestamp":"2026-10-20T09:10:00","status":"error","httpCode":400,"message":"입력값이 올바르지 않습니다.","path":"/api/pets","code":"INVALID_INPUT_VALUE","data":[{"field":"petNm","message":"이름을 입력해 주세요"}]}
```

- 인터셉터가 `data`만 꺼내서 돌려준다. `api.js`의 함수는 `data` 안의 값을 받는다(axios 응답 객체가 아니므로 `res.data`를 또 꺼내지 않는다). 삭제·상태 변경처럼 `data`가 없는 성공은 `undefined`가 온다.
- 보호 파일 다운로드만 예외다. JSON이 아니라 파일 자체가 오므로 이 모양이 아니다. `api.get(url, { responseType: 'blob' })`로 요청하면 인터셉터가 Blob을 그대로 돌려준다.
- 오류는 `status`가 `"error"`이고 최상위에 `code`·`message`가 있다. `code`(백엔드 `ErrorCode` 상수 이름)로 분기하고 `message`를 그대로 화면에 표시한다. 같은 오류의 문구를 프론트에서 새로 쓰지 않는다. 인터셉터는 `{ code, message, fields, data }`로 정리해 거부(reject)하므로 화면 코드는 그 모양만 본다.
- `fields`는 입력값 검증 오류(`INVALID_INPUT_VALUE`)일 때만 서버 응답의 `data`에서 꺼낸 `[{ field, message }]`이고 그 밖에는 `null`이다. 입력칸 아래 문구에 쓴다.
- `data`는 검증 오류가 아닌 오류에서 서버 응답의 `data`를 그대로 담고(없으면 `null`), 검증 오류일 때는 `null`이다. 오류에 딸린 값(예: `EMAIL_CERT_RESEND_NOT_YET`의 `resendAvailableDt`)을 읽을 때만 쓴다.
- 서버가 이 모양을 주지 않은 경우에도 인터셉터가 같은 모양을 만들어 준다. 응답이 없으면(네트워크 단절) `NETWORK_ERROR`, 응답은 있는데 `code`가 없으면(Nginx 502·504 등) `SERVER_ERROR`다. 화면 코드는 이 경우를 따로 처리하지 않는다.

## 오류 표시

- `error.fields`가 있으면 해당 입력칸 아래에 그 `message`를 표시한다.
- 그 밖의 변경 요청(mutation) 오류는 토스트로 `error.message`를 표시한다.
- 조회(query) 오류는 그 영역에 `error.message`와 "다시 시도" 버튼을 표시한다.
- 토스트는 공통 구현 하나만 쓴다. 도메인 코드에서 따로 만들지 않는다. `alert()`를 쓰거나 다른 알림 라이브러리를 추가하지 않는다.
- 화면설계서에 표시 방식이 따로 정해진 화면은 화면설계서를 따른다.

## 상태 코드

| 코드 | 뜻 | 프론트가 하는 일 |
| --- | --- | --- |
| 400 | 입력값이 틀렸거나 업무 규칙에 어긋남 | `error.message`, `error.fields` 표시 |
| 401 | 토큰 없음·틀림(`UNAUTHORIZED`)·만료(`TOKEN_EXPIRED`) | `TOKEN_EXPIRED`면 인터셉터가 재발급을 1회 시도. 실패하거나 `UNAUTHORIZED`면 로그인 화면으로 이동 |
| 403 | 권한 없음. `MEMBER_INACTIVE`는 정지·탈퇴 회원 | `MEMBER_INACTIVE`는 재발급 없이 로그인 화면으로 이동. 그 밖은 `error.message` 표시 |
| 404 | 대상이 없음 | `error.message` 표시 |
| 409 | 이미 있음 | `error.message` 표시 |
| 429 | 로그인에 보안코드 필요 | 로그인 화면이 처리 |

- 재발급은 1회만 한다. 다시 보낸 요청이 또 401이거나 `/auth/refresh` 자신이 401이면 더 시도하지 않는다.
- 여러 요청이 동시에 401을 받아도 재발급 요청은 하나만 보내고 나머지는 그 결과를 같이 기다린다. 서버는 재발급할 때마다 Refresh Token을 바꾸므로, 재발급을 두 번 보내면 두 번째가 실패해 로그인한 사용자가 로그인 화면으로 튕긴다.
- 로그인 화면으로 보낼 때는 현재 경로를 `redirect` 파라미터에 담는다(`utils/loginRedirect.js`의 `toLoginPath`). 랜딩·로그인 화면에서 보낼 때는 새로 담지 않고 지금 주소의 `redirect`를 넘긴다.
- 이미 로그인 화면(`/login`)에 있으면 이동하지 않는다. 이동하면 같은 화면을 다시 불러오기만 한다.
- `skipAuthRedirect: true`는 로그인하지 않은 상태에서도 부르는 요청에만 붙인다. 이 요청은 실패해도 인터셉터가 로그인 화면으로 보내지 않고, 실패를 그 화면이 직접 안내한다. 로그인이 필요한 화면의 요청에는 붙이지 않는다.
  - 로그인 여부 확인: `getMe`. 붙이지 않으면 랜딩에서 비로그인 사용자가 401을 받을 때마다 로그인 화면으로 끌려간다
  - 로그인 화면의 요청: `login`, `getLoginStatus`, `getCaptcha`. 붙이지 않으면 정지 회원(`MEMBER_INACTIVE`) 안내 문구 대신 화면이 이동한다
  - 로그인 전 화면의 이미지: `hooks/useCharacterImage.js`

```js
// src/api/axios.js
import axios from 'axios';
import { toLoginPath } from '@/utils/loginRedirect';

export const api = axios.create({
  baseURL: '/api',                                  // 상대 경로만
  headers: { 'X-Requested-With': 'XMLHttpRequest' },   // 없으면 서버가 거절한다
});

let refreshing = null;                                 // 동시에 온 401이 재발급 하나를 같이 기다린다

// 서버가 error를 주지 않은 경우에도 화면 코드는 같은 모양을 받는다
const fallbackError = (response) => (response
  ? { code: 'SERVER_ERROR', message: '일시적인 오류가 발생했어요.', fields: null, data: null }
  : { code: 'NETWORK_ERROR', message: '네트워크 연결을 확인해 주세요.', fields: null, data: null });

api.interceptors.response.use(
  (res) => (res.config.responseType === 'blob'
    ? res.data                                         // 보호 파일은 Blob 그대로 돌려준다
    : res.data.data),                                  // { status, httpCode, message, data }에서 data만 꺼낸다
  async (err) => {
    const { config, response } = err;
    let body = response?.data;
    if (body instanceof Blob) {                        // 파일 요청이 실패하면 오류 JSON도 Blob으로 온다
      body = await body.text().then(JSON.parse).catch(() => null);
    }
    // 서버 오류 { code, message, data }를 { code, message, fields, data }로 정리한다. fields는 검증 오류의 data, 그 밖의 오류는 data를 그대로 둔다
    const error = body?.code
      ? { code: body.code, message: body.message, fields: body.code === 'INVALID_INPUT_VALUE' ? body.data : null, data: body.code === 'INVALID_INPUT_VALUE' ? null : (body.data ?? null) }
      : fallbackError(response);
    const isRefresh = config?.url === '/auth/refresh';
    if (response?.status === 401 && error.code === 'TOKEN_EXPIRED' && !config._retried && !isRefresh) {
      config._retried = true;                          // 재발급은 한 번만
      try {
        refreshing ??= api.post('/auth/refresh').finally(() => { refreshing = null; });
        await refreshing;
        return api(config);
      } catch { /* 아래 로그인 화면 이동으로 넘어간다 */ }
    }
    const loggedOut = response?.status === 401 || error.code === 'MEMBER_INACTIVE';
    // 재발급 요청 자신과 로그인 화면은 이동하지 않는다. 이동 여부는 원래 요청의 skipAuthRedirect로 정한다
    if (loggedOut && !isRefresh && !config?.skipAuthRedirect && location.pathname !== '/login') {
      location.href = toLoginPath(location.pathname, location.search);
    }
    return Promise.reject(error);
  },
);
```

```js
// features/member/api.js
export const getMe = () => api.get('/auth/me', { skipAuthRedirect: true });

// features/member/queries.js
export const memberKeys = { me: ['auth', 'me'] };
export const useMe = () =>
  useQuery({ queryKey: memberKeys.me, queryFn: getMe, staleTime: 5 * 60 * 1000 });
```

## 날짜와 시간

- 서버는 일시를 `"2026-10-12T09:30:00"`, 날짜를 `"2026-10-12"` 문자열로 준다. 시간대 표기는 없고 모두 한국 시간이다. 요청으로 보낼 때도 같은 형식이다.
- 화면에 표시할 문자열은 `utils/formatDate`로만 만든다. 컴포넌트에서 `new Date()`로 직접 변환하거나 문자열을 잘라 쓰지 않는다. `new Date('2026-10-12')`는 UTC 자정으로, `new Date('2026-10-12T09:30:00')`는 브라우저 시간대로 해석되어 기준이 서로 다르다.

## Y/N 필드

- 이름이 `Yn`으로 끝나는 필드(`repPetYn`, `emlNotiRcptnYn`)는 `true`/`false`다. DB 컬럼 이름을 그대로 따라 `Yn`이 붙어 있을 뿐 값은 `"Y"`/`"N"`이 아니다.
- `if (pet.repPetYn)`처럼 쓴다. `=== 'Y'`와 비교하지 않는다. 항상 거짓이 되어 오류 없이 화면이 틀린다.
- 요청으로 보낼 때도 `true`/`false`를 보낸다. 수정(PATCH)에서 바꾸지 않을 필드는 보내지 않는다.

## 목록

목록 API는 요청과 응답의 모양이 모두 같다.

- 요청: `?page=1&size=20&sort=...`. **`page`는 1부터 시작한다.** `size`는 최대 50이다.
- 결과가 없으면 오류가 아니라 200에 빈 `content`가 온다. 빈 목록 화면은 `content.length === 0`으로 판단한다.
- 쿼리 파라미터 이름은 서버 필드 이름과 같다(`plcClsfCd`). 검색어는 `keyword`다.
- `size`를 생략하면 서버가 20건을 준다. 게시판 10건, 실종 카드 12건처럼 화면설계서가 정한 값이 있는 목록은 서버가 그 값을 기본값으로 쓴다.
- 응답의 `data`: `content`(목록), `page`, `size`, `totalElements`, `totalPages`, `hasNext`.

## 파일

- 공개 파일은 응답에 담긴 `/files/...` 주소를 `<img src>`에 그대로 쓴다.
- 보호 파일(검진 첨부, 영수증, 문의 첨부, 채팅 사진)은 API 경로로 받는다. 주소를 직접 만들지 않는다. `api.get(url, { responseType: 'blob' })`로 받고, `<img src>`에 API 경로를 직접 넣지 않는다. 직접 넣으면 Access Token이 만료됐을 때 재발급 없이 이미지가 깨진다.
- 업로드는 파일 하나에 10MB 이하, 확장자는 jpg·jpeg·png·webp만 된다. 검진 첨부만 pdf도 된다. 파일을 고른 시점에 프론트에서 먼저 검사한다. 서버도 다시 검사하므로 프론트 검사는 안내용이다.
- 이 값은 `constants/`에 한 번만 정의해 쓴다. 한 번에 올릴 수 있는 파일 개수는 화면마다 다르므로 기능명세서를 따른다.

## 환경변수

- `import.meta.env`는 `api/env.js`만 읽는다. 나머지는 `env.js`에서 import 한다. 서버 주소는 환경변수로 두지 않는다(메인 서버는 `/api`, AI 서버는 `/ai`).
