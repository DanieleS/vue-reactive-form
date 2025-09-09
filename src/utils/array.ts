// Returns an array where the item at the originalIndex is moved to the targetIndex
export const moveItemInArray = <T>(
  originalIndex: number,
  targetIndex: number,
  list: T[]
) => {
  const copy = [...list]

  const itemToMove = list[originalIndex]

  if (itemToMove === undefined) {
    return copy
  }

  const breakpoint = originalIndex < targetIndex ? targetIndex + 1 : targetIndex

  const firstHalf = copy.slice(0, breakpoint).filter((i) => i !== itemToMove)
  const secondHalf = copy.slice(breakpoint).filter((i) => i !== itemToMove)

  return [...firstHalf, itemToMove, ...secondHalf]
}
