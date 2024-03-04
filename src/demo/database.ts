interface DB<T> {
  // load: (start: number, limit?: number) => Promise<FeedResponse<T>>;
  load: (start: number, limit?: number) => FeedResponse<T>
}

interface FeedResponse<T> {
  size: number
  next: number
  prev: number
  chunk: T[]
}

export const db = <T>(
  size: number = 100,
  pageSize: number = 10,
  getItem: (index: number) => T
): DB<T> => {
  const items = Array.from({ length: size }, (_, i) => getItem(i))

  return {
    load: (start: number, limit: number = pageSize) => {
      const chunk = items.slice(start, start + limit)
      const response: FeedResponse<T> = {
        size: chunk.length,
        next: start + limit,
        prev: start - limit,
        chunk,
      }

      return response
      // return new Promise((res) => res(response));
    },
  }
}
