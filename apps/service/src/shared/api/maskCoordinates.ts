const COORDINATE_QUERY_PATTERN = /([?&](?:lat|lng)=)[^&#]*/g;

export function maskCoordinates(url: string): string {
  return url.replace(COORDINATE_QUERY_PATTERN, '$1***');
}
