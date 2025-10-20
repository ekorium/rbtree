type Color = 'BLACK' | 'RED'
type Direction = 'left' | 'right'
type BooleanFunction<K> = (a: K) => boolean
type CompareFunction<K> = (a: K, b: K) => number
type TraverseOptions<K> = {
    reverse?: boolean;
    low?: K;
    high?: K;
    includeLow?: boolean;
    includeHigh?: boolean;
}

class RBNode<K, V> {

    parent: RBNode<K, V>
    left: RBNode<K, V> = this
    right: RBNode<K, V> = this
    key: K | undefined
    value: V | undefined
    alive: boolean = false
    color: Color = 'BLACK'

    constructor(parent?: RBNode<K, V>) {
        this.parent = parent ?? this
    }

    get type(): Direction {
        return (this === this.parent.left) ? 'left' : 'right'
    }

    get opposite(): Direction {
        return (this === this.parent.left) ? 'right' : 'left'
    }

    findNode(key: K, compare: CompareFunction<K>): RBNode<K, V> {
        if (this.key === undefined) {
            return this
        }
        const relation = compare(key, this.key)
        if (relation === 0) {
            return this
        }
        if (relation < 0) {
            return this.left.findNode(key, compare)
        }
        return this.right.findNode(key, compare)
    }

    rotate(type: Direction, opposite: Direction): void {
        const parent = this.parent
        this.connectParent(parent.parent, parent.type)
        this[opposite].connectParent(parent, type)
        parent.connectParent(this, opposite)
    }

    connectParent(parent: RBNode<K, V>, type: Direction): void {
        this.parent = parent
        parent[type] = this
    }

    set(key: K, value?: V): void {
        this.value = value
        this.alive = true
        if (this.key === undefined) {
            this.key = key
            this.left = new RBNode(this)
            this.right = new RBNode(this)
            this.color = 'RED'
            this.rebalanceRed()
        }
    }

    rebalanceRed(): void {
        if (this.parent instanceof Anchor) {
            this.color = 'BLACK'
        } else if (this.parent.color === 'RED') {
            const type = this.type
            const opposite = this.opposite
            if (type === this.parent.type) {
                const grandParent = this.parent.parent
                const uncle = grandParent[opposite]
                this.parent.color = 'BLACK'
                grandParent.color = 'RED'
                if (uncle.color === 'RED') {
                    uncle.color = 'BLACK'
                    grandParent.rebalanceRed()
                } else {
                    this.parent.rotate(type, opposite)
                }
            } else {
                this.rotate(type, opposite)
                this[opposite].rebalanceRed()
            }
        }
    }

    delete(hard: boolean): void {
        if (this.key === undefined) {
            return
        }
        if (!hard) {
            this.value = undefined
            this.alive = false
        } else if (this.left.key === undefined) {
            this.replace(this.left)
        } else if (this.right.key === undefined) {
            this.replace(this.right)
        } else {
            let successor = this.right
            while (successor.left.key !== undefined) {
                successor = successor.left
            }
            this.key = successor.key
            this.value = successor.value
            this.alive = successor.alive
            successor.delete(hard)
        }
    }

    replace(node: RBNode<K, V>): void {
        node.connectParent(this.parent, this.type)
        if (this.color === 'BLACK' && node.color === 'BLACK') {
            node.rebalanceDoubleBlack()
        } else {
            node.color = 'BLACK'
        }
    }

    rebalanceDoubleBlack(): void {
        if (this.parent instanceof Anchor) {
            return
        }
        const type = this.type
        const opposite = this.opposite
        const sibling = this.parent[opposite]
        const niece = sibling[type]
        const nephew = sibling[opposite]
        if (sibling.color === 'RED') {
            sibling.color = 'BLACK'
            niece.color = 'RED'
            sibling.rotate(opposite, type)
        } else if (nephew.color === 'BLACK') {
            if (niece.color === 'BLACK') {
                sibling.color = 'RED'
                if (this.parent.color === 'BLACK') {
                    this.parent.rebalanceDoubleBlack()
                } else {
                    this.parent.color = 'BLACK'
                }
            } else {
                niece.color = 'BLACK'
                nephew.color = 'RED'
                niece.rotate(type, opposite)
                this.rebalanceDoubleBlack()
            }
        } else {
            sibling.color = this.parent.color
            this.parent.color = 'BLACK'
            nephew.color = 'BLACK'
            sibling.rotate(opposite, type)
        }
    }

    copy(parent: RBNode<K, V>): RBNode<K, V> {
        const node = new RBNode<K, V>(parent)
        if (this.key !== undefined) {
            node.key = this.key
            node.value = this.value
            node.left = this.left.copy(node)
            node.right = this.right.copy(node)
            node.color = this.color
            node.alive = this.alive
        }
        return node
    }

    *walk(
        start: Direction,
        end: Direction,
        visitStart: BooleanFunction<K>,
        visitEnd: BooleanFunction<K>
    ): Generator<[K, V | undefined]> {
        if (this.key === undefined) {
            return
        }
        const startVisit = visitStart(this.key)
        const endVisit = visitEnd(this.key)
        if (startVisit) {
            yield* this[start].walk(start, end, visitStart, visitEnd)
        }
        if (startVisit && endVisit && this.alive) {
            yield [this.key, this.value]
        }
        if (endVisit) {
            yield* this[end].walk(start, end, visitStart, visitEnd)
        }
    }
}

class Anchor<K, V> extends RBNode<K, V> {

    left: RBNode<K, V> = new RBNode(this)
}

export default class RBTree<K, V = undefined> {

    #anchor: Anchor<K, V> = new Anchor()
    #size: number = 0
    #totalSize: number = 0
    #compare: CompareFunction<K> = (a, b) => {
        return (a === b) ? 0 : (a > b) ? 1 : -1
    }

    constructor(compare?: CompareFunction<K>) {
        if (compare) {
            this.#compare = compare
        }
    }

    get size(): number {
        return this.#size
    }

    get totalSize(): number {
        return this.#totalSize
    }

    get #root(): RBNode<K, V> {
        return this.#anchor.left
    }

    set #root(value: RBNode<K, V>) {
        this.#anchor.left = value
    }

    has(key: K): boolean {
        return this.#root.findNode(key, this.#compare).alive
    }

    get(key: K): V | undefined {
        return this.#root.findNode(key, this.#compare).value
    }

    insert(key: K, value?: V): void {
        const node = this.#root.findNode(key, this.#compare)
        if (!node.alive) {
            this.#size++
            if (node.key === undefined) {
                this.#totalSize++
            }
        }
        node.set(key, value)
    }

    delete(key: K, hard: boolean = false): boolean {
        const node = this.#root.findNode(key, this.#compare)
        if (node.key !== undefined && (node.alive || hard)) {
            if (node.alive) {
                this.#size--
            }
            if (hard) {
                this.#totalSize--
            }
            node.delete(hard)
            return true
        }
        return false
    }

    clear(): void {
        this.#root = new RBNode()
        this.#size = 0
        this.#totalSize = 0
    }

    rebuild(): void {
        const tree = new RBTree<K, V>()
        const nodes = [this.#root]
        for (let i = 0;; i++) {
            if (i >= nodes.length) {
                break
            }
            const node = nodes[i]
            if (node.key !== undefined) {
                nodes.push(node.left)
                nodes.push(node.right)
                if (node.alive) {
                    tree.insert(node.key, node.value)
                }
            }
        }
        this.#root = tree.#root
        this.#totalSize = this.#size
    }

    copy(): RBTree<K, V> {
        const tree = new RBTree<K, V>()
        tree.#root = this.#root.copy(tree.#anchor)
        tree.#size = this.#size
        tree.#totalSize = this.#totalSize
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

    *#traverse({
        reverse,
        low,
        high,
        includeLow,
        includeHigh
    }: TraverseOptions<K>): Generator<[K, V | undefined]> {
        const isAboveLow: BooleanFunction<K> =
            (low === undefined)
            ? (key) => true
            : (includeLow)
                ? (key) => this.#compare(key, low) >= 0
                : (key) => this.#compare(key, low) > 0
        const isBelowHigh: BooleanFunction<K> =
            (high === undefined)
            ? (key) => true
            : (includeHigh)
                ? (key) => this.#compare(key, high) <= 0
                : (key) => this.#compare(key, high) < 0
        if (!reverse) {
            yield* this.#root.walk('left', 'right', isAboveLow, isBelowHigh)
        } else {
            yield* this.#root.walk('right', 'left', isBelowHigh, isAboveLow)
        }
    }
}