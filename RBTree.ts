import RBNode from './RBNode.ts'

import type {
    Direction,
    Priority,
    PriorityFunction,
    BooleanFunction,
    TraverseOptions,
} from './types'


export default class RBTree<K, V = undefined> {

    #anchor: RBNode<K, V> = RBNode.createAnchor()
    #size: number = 0
    #totalSize: number = 0
    #priorityOf: PriorityFunction<K>

    constructor(priorityFunction: PriorityFunction<K>) {
        this.#priorityOf = priorityFunction
    }


    get #root(): RBNode<K, V> {
        return this.#anchor.left
    }


    get size(): number {
        return this.#size
    }


    get totalSize(): number {
        return this.#totalSize
    }


    #findNode(key: K): RBNode<K, V> {
        return this.#findByPriority(this.#root, this.#priorityOf(key))
    }


    #findByPriority(node: RBNode<K, V>, target: Priority): RBNode<K, V> {

        if (node.isNull()) {
            return node
        }

        const priority = this.#priorityOf(node.key as K)

        if (priority === target) {
            return node
        } else if (priority > target) {
            return this.#findByPriority(node.left, target)
        } else {
            return this.#findByPriority(node.right, target)
        }
    }


    has(key: K): boolean {
        return this.#findNode(key).alive
    }


    get(key: K): V | undefined {
        return this.#findNode(key).value
    }


    insert(key: K, value?: V): boolean {

        const node = this.#findNode(key)

        if (!node.alive) {
            this.#size++
        }

        if (node.set(key, value)) {
            this.#totalSize++
            return true
        }

        return false
    }


    delete(key: K, lazy: boolean = false): boolean {

        const node = this.#findNode(key)

        if (node.deleteLazy()) {
            this.#size--

            if (lazy) {
                return true
            }
        }

        if (!lazy && node.delete()) {
            this.#totalSize--
            return true
        }

        return false
    }


    clear(): void {
        this.#anchor = RBNode.createAnchor()
        this.#size = 0
        this.#totalSize = 0
    }


    rebuild(inPlace = true): RBTree<K, V> {

        const tree = new RBTree<K, V>(this.#priorityOf)
        const nodes = [this.#root]

        for (let i = 0;; i++) {
            if (i >= nodes.length) {
                break
            }

            const node = nodes[i]

            if (node.isNull()) {
                continue
            }

            nodes.push(node.left)
            nodes.push(node.right)

            if (node.alive) {
                tree.insert(node.key as K, node.value)
            }
        }

        if (inPlace) {
            this.#anchor = tree.#anchor
            this.#totalSize = tree.size
            return this
        }

        return tree
    }


    copy(): RBTree<K, V> {
        const tree = new RBTree<K, V>(this.#priorityOf)
        tree.#anchor = this.#anchor.copy()
        tree.#size = this.size
        tree.#totalSize = this.totalSize
        return tree
    }


    *entries({
        reverse = false,
        low = undefined,
        high = undefined,
        includeLow = true,
        includeHigh = true
    }: TraverseOptions<K> = {}): Generator<[K, V | undefined]> {
        for (const [key, value] of this.#traverse({
            reverse, low, high, includeLow, includeHigh
        })) {
            yield [key, value]
        }
    }


    *keys({
        reverse = false,
        low = undefined,
        high = undefined,
        includeLow = true,
        includeHigh = true
    }: TraverseOptions<K> = {}): Generator<K>{
        for (const [key, value] of this.#traverse({
            reverse, low, high, includeLow, includeHigh
        })) {
            yield key
        }
    }


    *values({
        reverse = false,
        low = undefined,
        high = undefined,
        includeLow = true,
        includeHigh = true
    }: TraverseOptions<K> = {}): Generator<V | undefined> {
        for (const [key, value] of this.#traverse({
            reverse, low, high, includeLow, includeHigh
        })) {
            yield value
        }
    }


    *#traverse(
        {reverse, low, high, includeLow, includeHigh}: TraverseOptions<K>
    ): Generator<[K, V | undefined]> {

        let isAboveLow: BooleanFunction<K> = (key) => true
        let isBelowHigh: BooleanFunction<K> = (key) => true

        if (low !== undefined) {
            isAboveLow = (includeLow)
                ? (key) => this.#priorityOf(key) >= low
                : (key) => this.#priorityOf(key) > low
        }

        if (high !== undefined) {
            isBelowHigh = (includeHigh)
                ? (key) => this.#priorityOf(key) <= high
                : (key) => this.#priorityOf(key) < high
        }

        if (!reverse) {
            yield* this.#walk(
                this.#root, 'left', 'right', isAboveLow, isBelowHigh
            )
        } else {
            yield* this.#walk(
                this.#root, 'right', 'left', isBelowHigh, isAboveLow
            )
        }
    }


    *#walk(
        node: RBNode<K, V>,
        start: Direction,
        end: Direction,
        visitStart: BooleanFunction<K>,
        visitEnd: BooleanFunction<K>
    ): Generator<[K, V | undefined]> {

        if (node.isNull()) {
            return
        }

        const key = node.key as K
        const startVisit = visitStart(key)
        const endVisit = visitEnd(key)

        if (startVisit) {
            yield* this.#walk(
                node[start], start, end, visitStart, visitEnd
            )
        }

        if (startVisit && endVisit && node.alive) {
            yield [key, node.value]
        }

        if (endVisit) {
            yield* this.#walk(
                node[end], start, end, visitStart, visitEnd
            )
        }
    }
}