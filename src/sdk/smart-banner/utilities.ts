/**
 * Wraps JSON.parse() with try-catch.
 * Returns parsed object if successfully parsed and null otherwise.
 */
export function parseJson(str?: string | null): any {
  if (!str) {
    return null
  }

  try {
    return JSON.parse(str)
  } catch (error) {
    return null
  }
}
