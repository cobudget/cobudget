
export const toMS = (ms: number) => new Date(ms).toISOString().substring(14, 19)