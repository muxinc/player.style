
export function findParam(searchParams: Record<string, string | string[]>, name: string) {
  return (Array.isArray(searchParams[name]) ? searchParams[name][0] : searchParams[name])
}
