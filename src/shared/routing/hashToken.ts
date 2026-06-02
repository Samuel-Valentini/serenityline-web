export function getTokenFromHash(hash: string): string {
    const normalizedHash = hash.startsWith("#") ? hash.slice(1) : hash;
    const params = new URLSearchParams(normalizedHash);

    return params.get("token")?.trim() ?? "";
}
