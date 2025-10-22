export type Color = 'BLACK' | 'RED'
export type Direction = 'left' | 'right'

export type Priority = number | string
export type PriorityFunction<K> = (key: K) => Priority
export type BooleanFunction<K> = (key: K) => boolean

export type TraverseOptions<K> = {
    reverse?: boolean
    low?: Priority
    high?: Priority
    includeLow?: boolean
    includeHigh?: boolean
}