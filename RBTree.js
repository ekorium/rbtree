const BLACK = 'BLACK'
const RED = 'RED'
const ROOT = 'root'
const LEFT = 'left'
const RIGHT = 'right'
const OPPOSITE = {left: 'right', right: 'left'}

class RBNode {

    constructor(parent = null) {
        this.parent = parent
        this.key = undefined
        this.value = undefined
        this.left = undefined
        this.right = undefined
        this.color = BLACK
        this.alive = false
    }

    findNode(key) {
        if (this.key === key || this.key === undefined) {
            return this
        }
        if (key < this.key) {
            return this.left.findNode(key)
        }
        return this.right.findNode(key)
    }

    type() {
        if (this.parent === null) {
            return ROOT
        }
        if (this === this.parent.left) {
            return LEFT
        }
        return RIGHT
    }

    set(key, value) {
        this.value = value
        this.alive = true
        if (this.key === undefined) {
            this.key = key
            this.left = new this.constructor(this)
            this.right = new this.constructor(this)
            this.color = RED
            this.rebalance()
        }
    }

    rebalance() {
        const type = this.type()
        if (type === ROOT) {
            this.color = BLACK
        } else if (this.parent.color === RED) {
            const opposite = OPPOSITE[type]
            if (type === this.parent.type()) {
                this.handleZigZig(type, opposite)
            } else {
                this.rotate(type, opposite)
                this[opposite].rebalance()
            }
        }
    }

    handleZigZig(type, opposite) {
        const grandParent = this.parent.parent
        const uncle = grandParent[opposite]
        this.parent.color = BLACK
        grandParent.color = RED
        if (uncle.color === RED) {
            uncle.color = BLACK
            grandParent.rebalance()
        } else {
            this.parent.rotate(type, opposite)
        }
    }

    rotate(type, opposite) {
        const parent = this.parent
        this.connectParent(parent.parent, parent.type())
        this[opposite].connectParent(parent, type)
        parent.connectParent(this, opposite)
    }

    connectParent(parent, type) {
        this.parent = parent
        if (parent) {
            parent[type] = this
        }
    }

    delete() {
        this.value = undefined
        this.alive = false
    }

    copy(parent = null) {
        const node = new this.constructor(parent)
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

    *traverse(reverse, low, high, includeLow, includeHigh) {
        const isAboveLow = (low === undefined)
            ? (key) => true
            : (includeLow)
                ? (key) => key >= low
                : (key) => key > low
        const isBelowHigh = (high === undefined)
            ? (key) => true
            : (includeHigh)
                ? (key) => key <= high
                : (key) => key < high
        if (!reverse) {
            yield* this.walk(LEFT, RIGHT, isAboveLow, isBelowHigh)
        } else {
            yield* this.walk(RIGHT, LEFT, isBelowHigh, isAboveLow)
        }
    }

    *walk(start, end, visitStart, visitEnd) {
        if (this.key === undefined) {
            return
        }
        const startVisit = visitStart(this.key)
        const endVisit = visitEnd(this.key)
        if (startVisit) {
            yield* this[start].walk(start, end, visitStart, visitEnd)
        }
        if (startVisit && endVisit && this.alive) {
            yield this
        }
        if (endVisit) {
            yield* this[end].walk(start, end, visitStart, visitEnd)
        }
    }
}

export default class RBTree {

    constructor() {
        this.clear()
    }

    get size() {
        return this._size
    }

    get totalSize() {
        return this._totalSize
    }

    clear() {
        this._root = new RBNode()
        this._size = 0
        this._totalSize = 0
    }

    has(key) {
        return this._root.findNode(key).alive
    }

    get(key) {
        return this._root.findNode(key).value
    }

    insert(key, value = undefined) {
        const node = this._root.findNode(key)
        if (!node.alive) {
            this._size++
            if (node.key === undefined) {
                this._totalSize++
            }
        }
        node.set(key, value)
        if (this._root.parent) {
            this._root = this._root.parent
        }
    }

    delete(key) {
        const node = this._root.findNode(key)
        if (node.alive) {
            node.delete()
            this._size--
            return true
        }
        return false
    }

    copy() {
        const tree = new this.constructor()
        tree._root = this._root.copy()
        tree._size = this._size
        tree._totalSize = this._totalSize
        return tree
    }

    rebuild() {
        const tree = new this.constructor()
        const nodes = [this._root]
        for (let i = 0;; i++) {
            if (i >= nodes.length) {
                break
            }
            if (nodes[i].key !== undefined) {
                nodes.push(nodes[i].left)
                nodes.push(nodes[i].right)
                if (nodes[i].alive) {
                    tree.insert(nodes[i].key, nodes[i].value)
                }
            }
        }
        return tree
    }

    *entries({
        reverse = false,
        low = undefined,
        high = undefined,
        includeLow = true,
        includeHigh = true
    } = {}) {
        for (const node of this._root.traverse(
            reverse, low, high, includeLow, includeHigh
        )) {
            yield [node.key, node.value]
        }
    }

    *keys({
        reverse = false,
        low = undefined,
        high = undefined,
        includeLow = true,
        includeHigh = true
    } = {}) {
        for (const node of this._root.traverse(
            reverse, low, high, includeLow, includeHigh
        )) {
            yield node.key
        }
    }

    *values({
        reverse = false,
        low = undefined,
        high = undefined,
        includeLow = true,
        includeHigh = true
    } = {}) {
        for (const node of this._root.traverse(
            reverse, low, high, includeLow, includeHigh
        )) {
            yield node.value
        }
    }
}