import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import { INFINITE_OPTIONS } from '@/utils/infiniteList';
import { getNews, getNewsList } from './api';

export const newsKeys = {
  all: ['news'],
  list: (params) => ['news', 'list', params],
  detail: (newsSn) => ['news', newsSn],
};

/** 쪽 번호 목록(760px 이상). options.enabled가 false면 요청하지 않는다(모바일은 무한 스크롤 훅만 쓴다) */
export const useNewsList = (params, { enabled = true } = {}) =>
  useQuery({
    enabled,
    queryKey: newsKeys.list(params),
    queryFn: () => getNewsList(params),
    /** 카테고리·검색·쪽을 바꾸는 동안 이전 목록 유지로 화면이 스켈레톤으로 바뀌지 않게 한다 */
    placeholderData: keepPreviousData,
  });

/** 무한 스크롤 목록: params에 page는 넣지 않는다 */
export const useNewsInfiniteList = (params, { enabled = true } = {}) =>
  useInfiniteQuery({
    enabled,
    ...INFINITE_OPTIONS,
    queryKey: [...newsKeys.list(params), 'infinite'],
    queryFn: ({ pageParam }) => getNewsList({ ...params, page: pageParam }),
    placeholderData: keepPreviousData,
  });

export const useNews = (newsSn) =>
  useQuery({
    queryKey: newsKeys.detail(newsSn),
    queryFn: () => getNews(newsSn),
  });
