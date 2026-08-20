/**
 * Port of C# PagedResult<T>.
 * Generic pagination wrapper used across all paginated endpoints.
 */
export interface PagedResult<T> {
  items: T[];
  total: number;
}

