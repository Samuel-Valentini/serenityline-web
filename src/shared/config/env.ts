const requiredEnv = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
} as const;

function assertEnvValue(name: string, value: string | undefined): string {
    if (!value || value.trim().length === 0) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

export const env = {
    apiBaseUrl: assertEnvValue(
        "VITE_API_BASE_URL",
        requiredEnv.apiBaseUrl,
    ).replace(/\/$/, ""),
} as const;
