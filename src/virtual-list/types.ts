export type OnlyNumberAndString<T> = {
  [K in keyof T as T[K] extends string | number ? K : never]: T[K]
}
