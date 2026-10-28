// src/api/axios.js 응답 인터셉터가 docs/convention/api.md "응답 모양"·"상태 코드" 절대로 동작하는지 서버 없이 확인한다.
// 테스트 도구가 없어 이 스크립트가 회귀 확인을 대신한다. 서버 응답은 가짜 adapter가 만든다.
// 오류 본문은 백엔드 ApiResponse 모양({ status, httpCode, message, path, code, data })을 따른다.
// 사용: node scripts/check-axios-errors.mjs   (하나라도 어긋나면 종료 코드 1)
import { register } from 'node:module';
import { AxiosError } from 'axios';

/** src의 '@/' 별칭(Vite 설정)을 node가 풀도록 연결 */
const srcUrl = new URL('../src/', import.meta.url).href;
const hook = `export const resolve = (specifier, context, next) =>
  specifier.startsWith('@/')
    ? next(${JSON.stringify(srcUrl)} + specifier.slice(2) + '.js', context)
    : next(specifier, context);`;
register('data:text/javascript,' + encodeURIComponent(hook));

/** 랜딩 이동을 기록할 가짜 location */
globalThis.location = { pathname: '/health', search: '?tab=1', href: '' };
const { api, aiApi } = await import('../src/api/axios.js');

/** 경로별 가짜 응답. status가 없으면 네트워크 단절 */
let routes = {};
let calls = [];
const adapter = async (config) => {
  /** AI 서버 요청은 'ai:' 접두사로 구분 */
  calls.push(config.baseURL === '/ai' ? `ai:${config.url}` : config.url);
  const route = routes[config.url];
  const reply = typeof route === 'function' ? route() : route;
  if (!reply?.status) {
    throw new AxiosError('Network Error', 'ERR_NETWORK', config);
  }
  const response = {
    status: reply.status,
    data: reply.data,
    headers: {},
    config,
  };
  if (reply.status >= 400) {
    throw new AxiosError('fail', 'ERR_BAD_RESPONSE', config, null, response);
  }
  return response;
};
api.defaults.adapter = adapter;
aiApi.defaults.adapter = adapter;

const errorBody = (httpCode, code, message, data = null) => ({
  status: 'error',
  httpCode,
  message,
  path: '/api/x',
  code,
  data,
});
const ok = (data) => ({ status: 200, data: { status: 'success', data } });

const reset = (next) => {
  routes = next;
  calls = [];
  globalThis.location.href = '';
};
const run = (url, config) =>
  api.get(url, config).catch((e) => ({ rejected: e }));

let failed = 0;
const check = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  if (!pass) failed += 1;
  console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}`);
  if (!pass) {
    console.log(
      `     기대 ${JSON.stringify(expected)}\n     실제 ${JSON.stringify(actual)}`,
    );
  }
};

/** I-01 오류 모양 */
reset({
  '/r': {
    status: 404,
    data: errorBody(404, 'RECEIPT_NOT_FOUND', '영수증을 찾을 수 없습니다.'),
  },
});
check('404 서버 code·message 그대로', (await run('/r')).rejected, {
  code: 'RECEIPT_NOT_FOUND',
  message: '영수증을 찾을 수 없습니다.',
  fields: null,
});

const fieldErrors = [{ field: 'petNm', message: '이름을 입력해 주세요' }];
reset({
  '/v': {
    status: 400,
    data: errorBody(
      400,
      'INVALID_INPUT_VALUE',
      '입력값이 올바르지 않습니다.',
      fieldErrors,
    ),
  },
});
check('400 검증 오류 data → fields', (await run('/v')).rejected, {
  code: 'INVALID_INPUT_VALUE',
  message: '입력값이 올바르지 않습니다.',
  fields: fieldErrors,
});

reset({ '/g': { status: 502, data: '<html>Bad Gateway</html>' } });
check(
  '502 code 없음 → SERVER_ERROR',
  (await run('/g')).rejected?.code,
  'SERVER_ERROR',
);

reset({});
check(
  '응답 없음 → NETWORK_ERROR',
  (await run('/n')).rejected?.code,
  'NETWORK_ERROR',
);

/** I-02 재발급 조건 */
let expired = true;
reset({
  '/p': () =>
    expired
      ? {
          status: 401,
          data: errorBody(401, 'TOKEN_EXPIRED', '로그인이 만료되었습니다.'),
        }
      : ok({ petSn: 1 }),
  '/auth/refresh': () => {
    expired = false;
    return ok(null);
  },
});
check('TOKEN_EXPIRED → 재발급 1회 후 재시도 성공', await run('/p'), {
  petSn: 1,
});
check('TOKEN_EXPIRED 요청 순서', calls, ['/p', '/auth/refresh', '/p']);

expired = true;
calls = [];
await Promise.all([run('/p'), run('/p')]);
check(
  '동시 401 두 건 → 재발급 1회',
  calls.filter((u) => u === '/auth/refresh').length,
  1,
);

reset({
  '/u': {
    status: 401,
    data: errorBody(401, 'UNAUTHORIZED', '로그인이 필요합니다.'),
  },
  '/auth/refresh': ok(null),
});
await run('/u');
check('UNAUTHORIZED → 재발급 없음', calls, ['/u']);
check(
  'UNAUTHORIZED → 로그인 이동',
  globalThis.location.href,
  '/login?redirect=%2Fhealth%3Ftab%3D1',
);

reset({
  '/i': {
    status: 403,
    data: errorBody(403, 'MEMBER_INACTIVE', '이용할 수 없는 계정입니다.'),
  },
});
await run('/i');
check(
  'MEMBER_INACTIVE → 로그인 이동',
  globalThis.location.href,
  '/login?redirect=%2Fhealth%3Ftab%3D1',
);

reset({
  '/me': {
    status: 401,
    data: errorBody(401, 'UNAUTHORIZED', '로그인이 필요합니다.'),
  },
});
await run('/me', { skipAuthRedirect: true });
check('skipAuthRedirect → 이동 없음', globalThis.location.href, '');

/** AI 서버(aiApi): 같은 응답 처리, 재발급은 메인 서버로, 재시도는 aiApi로 */
const runAi = (url) => aiApi.get(url).catch((e) => ({ rejected: e }));

expired = true;
reset({
  '/c': () =>
    expired
      ? {
          status: 401,
          data: errorBody(401, 'TOKEN_EXPIRED', '로그인이 만료되었습니다.'),
        }
      : ok([{ aiCnvrsRoomSn: 1 }]),
  '/auth/refresh': () => {
    expired = false;
    return ok(null);
  },
});
check('aiApi TOKEN_EXPIRED → 재발급 후 재시도 성공', await runAi('/c'), [
  { aiCnvrsRoomSn: 1 },
]);
check('aiApi 요청 순서(재발급은 메인 서버)', calls, [
  'ai:/c',
  '/auth/refresh',
  'ai:/c',
]);

reset({
  '/c': {
    status: 401,
    data: errorBody(401, 'UNAUTHORIZED', '로그인이 필요합니다.'),
  },
});
await runAi('/c');
check('aiApi UNAUTHORIZED → 재발급 없음', calls, ['ai:/c']);
check(
  'aiApi UNAUTHORIZED → 로그인 이동',
  globalThis.location.href,
  '/login?redirect=%2Fhealth%3Ftab%3D1',
);

reset({
  '/c': {
    status: 502,
    data: errorBody(502, 'EXTERNAL_API_ERROR', '외부 서버 오류입니다.'),
  },
});
check(
  'aiApi 502 코드 그대로·이동 없음',
  [(await runAi('/c')).rejected?.code, globalThis.location.href],
  ['EXTERNAL_API_ERROR', ''],
);

process.exit(failed ? 1 : 0);
