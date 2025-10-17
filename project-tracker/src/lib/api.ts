export type ApiResponse<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiError = {
  error: string;
  details?: unknown;
};

export function ok<T>(data: T, meta?: Record<string, unknown>): Response {
  return Response.json({ data, meta } satisfies ApiResponse<T>);
}

export function fail(status: number, error: string, details?: unknown): Response {
  return new Response(JSON.stringify({ error, details }), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
