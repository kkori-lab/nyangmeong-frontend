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

/** 두 인스턴스가 같은 응답 처리를 쓴다 */
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
  /** 서버 오류 { code, message, data } 정리(fields는 검증 오류의 data) */
  const error = body?.code
    ? {
        code: body.code,
        message: body.message,
        fields: body.code === 'INVALID_INPUT_VALUE' ? body.data : null,
      }
    : fallbackError(response);
  /** 재발급은 항상 메인 서버(refresh_token 쿠키가 /api/auth 경로에만 간다) */
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
      refreshing ??= api.post('/auth/refresh').finally(() => {
        refreshing = null;
      });
      await refreshing;
      /** 요청을 보낸 인스턴스로 다시 보낸다 */
      return (config.baseURL === aiApi.defaults.baseURL ? aiApi : api)(config);
    } catch {
      /** 재발급 실패 시 로그인 이동으로 진행 */
    }
  }
  const loggedOut =
    response?.status === 401 || error.code === 'MEMBER_INACTIVE';
  /** 재발급 요청 자신과 로그인 화면(새로고침 반복 방지)은 이동 제외 */
  if (
    loggedOut &&
    !isRefresh &&
    !config?.skipAuthRedirect &&
    location.pathname !== '/login'
  ) {
    location.href = toLoginPath(location.pathname, location.search);
  }
  return Promise.reject(error);
};

api.interceptors.response.use(onFulfilled, onRejected);
aiApi.interceptors.response.use(onFulfilled, onRejected);
