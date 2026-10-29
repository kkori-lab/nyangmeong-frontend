import axios from 'axios';
import { toLoginPath } from '@/utils/loginRedirect';

/** 서버의 상태 변경 요청 거절(403) 방지용 헤더 */
const headers = { 'X-Requested-With': 'XMLHttpRequest' };

export const api = axios.create({ baseURL: '/api', headers });

/** AI 서버(Python): 같은 오리진 /ai 접두사(개발 Vite 프록시, 운영 nginx) */
export const aiApi = axios.create({ baseURL: '/ai', headers });

/** 진행 중인 재발급 공유 */
let refreshing = null;

/** 서버 오류 형식 통일 */
const fallbackError = (response) =>
  response
    ? {
        code: 'SERVER_ERROR',
        message: '일시적인 오류가 발생했어요.',
        fields: null,
      }
    : {
        code: 'NETWORK_ERROR',
        message: '네트워크 연결을 확인해 주세요.',
        fields: null,
      };

/** 서버 오류 { code, message, data } 정리(fields는 검증 오류의 data) */
const toError = (body, response) =>
  body?.code
    ? {
        code: body.code,
        message: body.message,
        fields: body.code === 'INVALID_INPUT_VALUE' ? body.data : null,
      }
    : fallbackError(response);

/** 재발급: 동시에 온 401은 한 번만 */
const refresh = () =>
  (refreshing ??= api.post('/auth/refresh').finally(() => {
    refreshing = null;
  }));

/** 로그아웃 상태면 로그인 이동, 로그인 화면(새로고침 반복 방지)은 제외 */
const redirectIfLoggedOut = (status, error) => {
  const loggedOut = status === 401 || error.code === 'MEMBER_INACTIVE';
  if (loggedOut && location.pathname !== '/login') {
    location.href = toLoginPath(location.pathname, location.search);
  }
};

/** 두 인스턴스가 공통 응답 처리 */
const onFulfilled = (res) =>
  /** 응답 data 추출(파일은 Blob 그대로) */
  res.config.responseType === 'blob' ? res.data : res.data.data;

const onRejected = async (err) => {
  const { config, response } = err;
  let body = response?.data;
  /** 파일 요청 실패 시 오류 Blob 파싱 */
  if (body instanceof Blob) {
    body = await body
      .text()
      .then(JSON.parse)
      .catch(() => null);
  }
  const error = toError(body, response);
  /** 재발급은 항상 메인 서버(refresh_token 쿠키는 /api/auth 경로에만 전달) */
  const isRefresh =
    config?.baseURL === '/api' && config?.url === '/auth/refresh';
  if (
    response?.status === 401 &&
    error.code === 'TOKEN_EXPIRED' &&
    !config._retried &&
    !isRefresh
  ) {
    /** 재발급 1회 제한 */
    config._retried = true;
    try {
      await refresh();
      /** 요청을 보낸 인스턴스로 재전송 */
      return (config.baseURL === aiApi.defaults.baseURL ? aiApi : api)(config);
    } catch {
      /** 재발급 실패 시 로그인 이동으로 진행 */
    }
  }
  /** 재발급 요청 자신은 이동 제외 */
  if (!isRefresh && !config?.skipAuthRedirect) {
    redirectIfLoggedOut(response?.status, error);
  }
  return Promise.reject(error);
};

api.interceptors.response.use(onFulfilled, onRejected);
aiApi.interceptors.response.use(onFulfilled, onRejected);

/** SSE 블록 하나: event·data(JSON) 줄 */
const parseEvent = (block) => {
  let name = 'message';
  const data = [];
  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) name = line.slice(6).trim();
    if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
  }
  return data.length > 0 ? { name, data: JSON.parse(data.join('\n')) } : null;
};

/**
 * AI 서버 스트리밍(SSE) POST: EventSource가 POST 불가라 fetch로 읽기
 * - 응답이 JSON이면 스트림 전 오류: 인터셉터와 같은 오류 모양·재발급·로그인 이동
 * - 이벤트는 받는 대로 onEvent(name, data), 스트림이 닫히면 끝
 */
export const aiStream = async (url, body, { signal, onEvent }, retried) => {
  let response;
  try {
    /* eslint-disable-next-line no-restricted-globals -- SSE POST는 axios로 스트림을 읽지 못해 이 파일에서만 fetch를 쓴다 */
    response = await fetch(`${aiApi.defaults.baseURL}${url}`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw fallbackError(null);
  }

  if (!response.headers.get('content-type')?.includes('text/event-stream')) {
    const error = toError(await response.json().catch(() => null), response);
    if (response.status === 401 && error.code === 'TOKEN_EXPIRED' && !retried) {
      /** 재발급 1회 제한, 실패하면 로그인 이동으로 진행 */
      const isRefreshed = await refresh().then(
        () => true,
        () => false,
      );
      if (isRefreshed) return aiStream(url, body, { signal, onEvent }, true);
    }
    redirectIfLoggedOut(response.status, error);
    throw error;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, '\n');
    const blocks = buffer.split('\n\n');
    buffer = done ? '' : blocks.pop();
    for (const block of blocks) {
      const event = parseEvent(block);
      if (event) onEvent(event.name, event.data);
    }
    if (done) return;
  }
};
