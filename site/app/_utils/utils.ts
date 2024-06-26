export function findParam(searchParams: Record<string, string | string[]>, name: string) {
  const param = searchParams[name];
  if (Array.isArray(param)) {
    return param[0];
  }
  return param;
}
