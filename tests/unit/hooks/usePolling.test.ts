import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePolling } from '@/hooks/usePolling';
import { ok, err } from '@/utils/result.utils';

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should fetch data on mount when enabled', async () => {
    const mockData = { id: '1', name: 'test' };
    const fetcher = vi.fn().mockResolvedValue(ok(mockData));

    const { result } = renderHook(() =>
      usePolling({
        fetcher,
        enabled: true,
        interval: 3000,
      })
    );

    // 비동기 처리 대기
    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });

    expect(fetcher).toHaveBeenCalled();
  });

  it('should not fetch data when disabled', async () => {
    const fetcher = vi.fn().mockResolvedValue(ok({ id: '1' }));

    renderHook(() =>
      usePolling({
        fetcher,
        enabled: false,
      })
    );

    // 약간 대기
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(fetcher).not.toHaveBeenCalled();
  });

  it('should call onSuccess callback when fetch succeeds', async () => {
    const mockData = { id: '1' };
    const fetcher = vi.fn().mockResolvedValue(ok(mockData));
    const onSuccess = vi.fn();

    renderHook(() =>
      usePolling({
        fetcher,
        onSuccess,
        enabled: true,
      })
    );

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  it('should set error after max retries', async () => {
    const fetcher = vi.fn().mockResolvedValue(err('NETWORK_ERROR'));
    const onError = vi.fn();
    const maxRetries = 1;

    const { result } = renderHook(() =>
      usePolling({
        fetcher,
        onError,
        maxRetries,
        enabled: true,
        interval: 10000, // 긴 인터벌
      })
    );

    await waitFor(() => {
      expect(result.current.error).toBe('NETWORK_ERROR');
    });

    expect(onError).toHaveBeenCalledWith('NETWORK_ERROR');
  });

  it('should provide refresh function', async () => {
    const mockData = { id: '1' };
    const fetcher = vi.fn().mockResolvedValue(ok(mockData));

    const { result } = renderHook(() =>
      usePolling({
        fetcher,
        enabled: true,
        interval: 100000, // 매우 긴 인터벌로 설정
      })
    );

    // 초기 fetch 대기
    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });

    const initialCallCount = fetcher.mock.calls.length;

    // 수동 리프레시
    await act(async () => {
      await result.current.refresh();
    });

    expect(fetcher.mock.calls.length).toBeGreaterThan(initialCallCount);
  });

  it('should return loading state', async () => {
    let resolvePromise: (value: unknown) => void;
    const fetcher = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    const { result } = renderHook(() =>
      usePolling({
        fetcher,
        enabled: true,
      })
    );

    // 로딩 상태 확인
    expect(result.current.isLoading).toBe(true);

    // Promise 해결
    await act(async () => {
      resolvePromise!(ok({ id: '1' }));
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should clear error on successful fetch after failure', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(err('NETWORK_ERROR'))
      .mockResolvedValueOnce(ok({ id: '1' }));

    const { result } = renderHook(() =>
      usePolling({
        fetcher,
        maxRetries: 1,
        enabled: true,
        interval: 100000,
      })
    );

    // 첫 번째 실패 대기
    await waitFor(() => {
      expect(result.current.error).toBe('NETWORK_ERROR');
    });

    // 수동 리프레시로 성공
    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.error).toBe(null);
      expect(result.current.data).toEqual({ id: '1' });
    });
  });

  it('should stop polling when unmounted', async () => {
    const fetcher = vi.fn().mockResolvedValue(ok({ id: '1' }));

    const { unmount } = renderHook(() =>
      usePolling({
        fetcher,
        enabled: true,
        interval: 100000,
      })
    );

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalled();
    });

    const callCountBeforeUnmount = fetcher.mock.calls.length;
    unmount();

    // 언마운트 후에는 추가 호출이 없어야 함
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(fetcher.mock.calls.length).toBe(callCountBeforeUnmount);
  });
});
