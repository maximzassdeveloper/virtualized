type ValideObject = Record<any, any> | undefined | null

export const shallowEqual = (obj1: ValideObject, obj2: ValideObject): boolean => {
  if (obj1 === obj2) {
    return true
  }

  if (!obj1 || !obj2) {
    return false
  }

  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false
  }

  for (const key in obj1) {
    if (obj1[key] !== obj2[key]) {
      return false
    }
  }

  return true
}
