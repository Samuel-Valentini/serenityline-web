import { env } from "../config/env";
import { getAccessToken } from "./accessTokenStore";
import { ApiError } from "./apiError";
import { refreshSessionOnce } from "./sessionRefresh";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type QueryValue = string | number | boolean | null | undefined;

type ApiRequestOptions = {
    method?: HttpMethod;
    body?: unknown;
    query?: Record<string, QueryValue | QueryValue[]>;
    headers?: HeadersInit;
    requiresAuth?: boolean;
    includeCredentials?: boolean;
    skipAuthRefresh?: boolean;
    signal?: AbortSignal;
};

function buildUrl(path: string, query?: ApiRequestOptions["query"]): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${env.apiBaseUrl}${normalizedPath}`);

    if (query) {
        Object.entries(query).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((item) => appendQueryParam(url, key, item));
                return;
            }

            appendQueryParam(url, key, value);
        });
    }

    return url.toString();
}

function appendQueryParam(url: URL, key: string, value: QueryValue): void {
    if (value === null || value === undefined) {
        return;
    }

    url.searchParams.append(key, String(value));
}

function buildHeaders(options: ApiRequestOptions): Headers {
    const headers = new Headers(options.headers);

    headers.set("Accept", "application/json");
    headers.set("Accept-Language", "it-IT");

    if (options.body !== undefined && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (options.requiresAuth) {
        const token = getAccessToken();

        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
    }

    return headers;
}

async function parseResponseBody(response: Response): Promise<unknown> {
    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("Content-Type");

    if (contentType?.includes("application/json")) {
        return response.json();
    }

    const text = await response.text();

    return text.length > 0 ? text : null;
}

async function executeRequest(
    path: string,
    options: ApiRequestOptions,
): Promise<Response> {
    return fetch(buildUrl(path, options.query), {
        method: options.method ?? "GET",
        headers: buildHeaders(options),
        body:
            options.body === undefined
                ? undefined
                : JSON.stringify(options.body),
        credentials: options.includeCredentials ? "include" : "same-origin",
        signal: options.signal,
    });
}

export async function apiRequest<TResponse>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<TResponse> {
    const response = await executeRequest(path, options);
    const responseBody = await parseResponseBody(response);

    if (response.ok) {
        return responseBody as TResponse;
    }

    if (
        response.status === 401 &&
        options.requiresAuth &&
        !options.skipAuthRefresh
    ) {
        const refreshed = await refreshSessionOnce();

        if (refreshed) {
            return apiRequest<TResponse>(path, {
                ...options,
                skipAuthRefresh: true,
            });
        }
    }

    throw new ApiError(response.status, responseBody);
}
