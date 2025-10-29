import jsonlint from 'jsonlint-mod';

export type ValidationError = { message: string; line?: number; column?: number } | null;

export function sortObjectKeys<T>(obj: T): T {
  if (Array.isArray(obj)) return obj.map(sortObjectKeys) as unknown as T;
  if (obj && typeof obj === 'object') {
    return Object.keys(obj as any)
      .sort()
      .reduce((acc: any, k) => {
        acc[k] = sortObjectKeys((obj as any)[k]);
        return acc;
      }, {}) as T;
  }
  return obj;
}

export function parseAndValidate(text: string): { ok: boolean; error: ValidationError } {
  try {
    jsonlint.parse(text);
    return { ok: true, error: null };
  } catch (e: any) {
    const match = /line\s(\d+)\scolumn\s(\d+)/i.exec(e.message);
    return { ok: false, error: { message: e.message, line: match ? Number(match[1]) : undefined, column: match ? Number(match[2]) : undefined } };
  }
}


