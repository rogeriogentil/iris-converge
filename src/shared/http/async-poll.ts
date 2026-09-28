import type { ApiError } from '@/types/api'
import { apiFetch } from './client'

const POLL_INTERVAL_MS = 2_000

type AsyncTaskStatus<T> = {
  status: 'pending' | 'running' | 'complete' | 'error'
  result?: T
  error?: string
}

export async function pollAsyncTask<T>(
  taskId: string,
  signal?: AbortSignal,
): Promise<T> {
  while (true) {
    if (signal?.aborted) {
      throw { status: 0, message: 'Request cancelled' } satisfies ApiError
    }

    const status = await apiFetch<AsyncTaskStatus<T>>(
      `/v2/async-result?id=${encodeURIComponent(taskId)}`,
    )

    if (status.status === 'complete') {
      if (status.result === undefined) {
        throw { status: 500, message: 'Async task completed with no result' } satisfies ApiError
      }
      return status.result
    }

    if (status.status === 'error') {
      throw {
        status: 500,
        message: status.error ?? 'Async task failed',
      } satisfies ApiError
    }

    // pending or running — wait and retry
    await delay(POLL_INTERVAL_MS, signal)
  }
}

export async function cancelAsyncTask(taskId: string): Promise<void> {
  await apiFetch(`/v2/async-result/cancel?id=${encodeURIComponent(taskId)}`, {
    method: 'POST',
  })
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(id)
      reject({ status: 0, message: 'Request cancelled' } satisfies ApiError)
    })
  })
}
