'use client';

/**
 * 폴링 커스텀 훅
 *
 * 주기적으로 데이터를 가져오는 폴링 로직을 추상화합니다.
 * Result 패턴을 사용하여 에러 처리를 합니다.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { POLLING_INTERVAL, POLLING_MAX_RETRIES } from '@/constants/polling.constants';
import type { Result } from '@/types/common/result.types';
import { isOk } from '@/utils/result.utils';

/** 폴링 옵션 */
export interface UsePollingOptions<T> {
  /** 데이터를 가져오는 함수 */
  fetcher: () => Promise<Result<T, string>>;
  /** 폴링 주기 (ms) */
  interval?: number;
  /** 폴링 활성화 여부 */
  enabled?: boolean;
  /** 성공 콜백 */
  onSuccess?: (data: T) => void;
  /** 에러 콜백 */
  onError?: (error: string) => void;
  /** 최대 재시도 횟수 */
  maxRetries?: number;
}

/** 폴링 결과 */
export interface UsePollingResult<T> {
  /** 가져온 데이터 */
  data: T | null;
  /** 에러 메시지 */
  error: string | null;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 수동 리프레시 함수 */
  refresh: () => Promise<void>;
}

/**
 * 폴링 커스텀 훅
 * @param options - 폴링 옵션
 * @returns 폴링 결과
 */
export const usePolling = <T>({
  fetcher,
  interval = POLLING_INTERVAL,
  enabled = true,
  onSuccess,
  onError,
  maxRetries = POLLING_MAX_RETRIES,
}: UsePollingOptions<T>): UsePollingResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const retryCount = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetcher();

      if (isOk(result)) {
        setData(result.data);
        setError(null);
        retryCount.current = 0;
        onSuccess?.(result.data);
      } else {
        retryCount.current += 1;
        if (retryCount.current >= maxRetries) {
          setError(result.error);
          onError?.(result.error);
        }
      }
    } catch (e) {
      retryCount.current += 1;
      const errorMessage = e instanceof Error ? e.message : 'NETWORK_ERROR';
      if (retryCount.current >= maxRetries) {
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, maxRetries, onSuccess, onError]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 초기 fetch
    fetchData();

    // 폴링 인터벌 설정
    intervalRef.current = setInterval(fetchData, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, fetchData]);

  const refresh = useCallback(async () => {
    retryCount.current = 0;
    await fetchData();
  }, [fetchData]);

  return {
    data,
    error,
    isLoading,
    refresh,
  };
};
