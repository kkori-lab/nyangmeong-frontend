import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getNews, getNewsList } from './api';

export const newsKeys = {
  all: ['news'],
  list: (params) => ['news', 'list', params],
  detail: (newsSn) => ['news', newsSn],
};

export const useNewsList = (params) =>
  useQuery({
    queryKey: newsKeys.list(params),
    queryFn: () => getNewsList(params),
    /** 카테고리·검색·쪽을 바꾸는 동안 이전 목록 유지로 화면이 스켈레톤으로 바뀌지 않게 한다 */
    placeholderData: keepPreviousData,
  });

export const useNews = (newsSn) =>
  useQuery({
    queryKey: newsKeys.detail(newsSn),
    queryFn: () => getNews(newsSn),
  });
