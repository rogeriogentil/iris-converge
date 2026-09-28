export type BaseResponse<T> = {
  result: T;
};

export type ApiError = {
  status: number;
  code?: string;
  message: string;
  detail?: string;
  fieldErrors?: Record<string, string>;
};

export type AsyncTaskResponse = {
  result: {
    asyncTaskId: string;
  };
};

export type AsyncTaskResult<T> = {
  result: {
    status: 'pending' | 'running' | 'complete' | 'error';
    data?: T;
    error?: string;
  };
};
