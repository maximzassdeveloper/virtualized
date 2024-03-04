type AnyCallback = (...args: any[]) => any

export function throttleCallback<T extends AnyCallback>(cb: T, interval: number) {
  let lastCalled: number

  return (...args: Parameters<T>) => {
    if (lastCalled && lastCalled + interval > Date.now()) {
      return
    }

    cb(...args)
    lastCalled = Date.now()
  }
}
