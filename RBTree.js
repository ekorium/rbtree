const COLOR = {
    RED: 'RED',
    BLACK: 'BLACK'
}

const TYPE = {
    ROOT: 'root',
    LEFT: 'left',
    RIGHT: 'right',
}

class RBNode {

    constructor(parent = null) {
        this.parent = parent
        this.key = null
        this.color = COLOR.BLACK
        this.alive = false
    }

    set(key, value = null) {
        this.value = value
        this.alive = true
        if (this.key === null) {
            this.key = key
            this.left = new this.constructor(this)
            this.right = new this.constructor(this)
            this.color = COLOR.RED
            this.rebalance()
        }
    }

    type(opposite = false) {
        if (this.parent === null) {
            return TYPE.ROOT
        }
        if ((this === this.parent.left) ^ opposite) {
            return TYPE.LEFT
        }
        return TYPE.RIGHT
    }

    rebalance() {
        const type = this.type()
        if (type === TYPE.ROOT) {
            this.color = COLOR.BLACK
        } else if (this.parent.color === COLOR.RED) {
            const opposite = this.type(true)
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
        this.parent.color = COLOR.BLACK
        grandParent.color = COLOR.RED
        if (uncle.color === COLOR.RED) {
            uncle.color = COLOR.BLACK
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

    findNode(key) {
        if (key === this.key || this.key === null) {
            return this
        }
        if (key < this.key) {
            return this.left.findNode(key)
        }
        return this.right.findNode(key)
    }

    copy(parent = null) {
        const node = new this.constructor(parent)
        if (this.key !== null) {
            node.key = this.key
            node.value = this.value
            node.color = this.color
            node.alive = this.alive
            node.left = this.left.copy(node)
            node.right = this.right.copy(node)
        }
        return node
    }

    *traverse(callback, {
        reverse = false,
        low = null,
        high = null,
        includeLow = true,
        includeHigh = true
    } = {}) {
        if (this.key === null) {
            return
        }
        const direction1 = reverse ? TYPE.RIGHT : TYPE.LEFT
        const direction2 = reverse ? TYPE.LEFT : TYPE.RIGHT
        const aboveLow =
            low == null ||
            this.key > low ||
            includeLow && this.key === low
        const belowHigh =
            high == null ||
            this.key < high ||
            includeHigh && this.key === high
        if (reverse ? belowHigh : aboveLow) {
            yield* this[direction1].traverse(callback, {
                reverse, low, high, includeLow, includeHigh
            })
        }
        if (aboveLow && belowHigh) {
            yield callback(this)
        }
        if (reverse ? aboveLow : belowHigh) {
            yield* this[direction2].traverse(callback, {
                reverse, low, high, includeLow, includeHigh
            })
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

    get deadSize() {
        return this._deadSize
    }

    get totalSize() {
        return this._size + this._deadSize
    }

    clear() {
        this._root = new RBNode()
        this._size = 0
        this._deadSize = 0
    }

    has(key) {
        return this._root.findNode(key).alive
    }

    get(key) {
        return this._root.findNode(key).value
    }

    insert(key, value = null) {
        const node = this._root.findNode(key)
        if (!node.alive) {
            this._size++
            if (node.key !== null) {
                this._deadSize--
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
            node.alive = false
            this._size--
            this._deadSize++
            return true
        }
        return false
    }

    copy() {
        const tree = new this.constructor()
        tree._root = this._root.copy()
        tree._size = this._size
        tree._deadSize = this._deadSize
        return tree
    }

    rebuild() {
        const tree = new this.constructor()
        for (const [key, value] of this.entries()) {
            tree.insert(key, value)
        }
        return tree
    }

    *entries({
        reverse = false,
        low = null,
        high = null,
        includeLow = true,
        includeHigh = true
    } = {}) {
        yield* this._root.traverse((node) => [node.key, node.value], {
            reverse, low, high, includeLow, includeHigh
        })
    }

    *keys({
        reverse = false,
        low = null,
        high = null,
        includeLow = true,
        includeHigh = true
    } = {}) {
        yield* this._root.traverse((node) => node.key, {
            reverse, low, high, includeLow, includeHigh
        })
    }

    *values({
        reverse = false,
        low = null,
        high = null,
        includeLow = true,
        includeHigh = true
    } = {}) {
        yield* this._root.traverse((node) => node.value, {
            reverse, low, high, includeLow, includeHigh
        })
    }
}