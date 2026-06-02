export type ApiErrorBody = {
    code?: string;
    message?: string;
    details?: unknown;
};

export class ApiError extends Error {
    readonly status: number;
    readonly body: ApiErrorBody | unknown;

    constructor(status: number, body: ApiErrorBody | unknown) {
        const message =
            isApiErrorBody(body) && body.message
                ? body.message
                : `API request failed with status ${status}`;

        super(message);

        this.name = "ApiError";
        this.status = status;
        this.body = body;
    }
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
    return typeof value === "object" && value !== null;
}
