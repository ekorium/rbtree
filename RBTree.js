const BLACK = 'BLACK'
const RED = 'RED'
const LEFT = 'left'
const RIGHT = 'right'
const OPPOSITE = {left: 'right', right: 'left'}

class RBNode {

    constructor(parent = undefined) {
        this.parent = parent ?? this
        this.key = undefined
        this.value = undefined
        this.left = this
        this.right = this
        this.color = BLACK
        this.alive = false
    }

    get type() {
        return (this === this.parent.left) ? LEFT : RIGHT
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

    rotate(type, opposite) {
        const parent = this.parent
        this.connectParent(parent.parent, parent.type)
        this[opposite].connectParent(parent, type)
        parent.connectParent(this, opposite)
    }

    connectParent(parent, type) {
        this.parent = parent
        parent[type] = this
    }

    set(key, value) {
        this.value = value
        this.alive = true
        if (this.key === undefined) {
            this.key = key
            this.left = new RBNode(this)
            this.right = new RBNode(this)
            this.color = RED
            this.rebalanceRed()
        }
    }

    rebalanceRed() {
        if (this.parent instanceof Anchor) {
            this.color = BLACK
        } else if (this.parent.color === RED) {
            const type = this.type
            const opposite = OPPOSITE[type]
            if (type === this.parent.type) {
                const grandParent = this.parent.parent
                const uncle = grandParent[opposite]
                this.parent.color = BLACK
                grandParent.color = RED
                if (uncle.color === RED) {
                    uncle.color = BLACK
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

    delete(hard) {
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

    replace(node) {
        node.connectParent(this.parent, this.type)
        if (this.color === BLACK && node.color === BLACK) {
            node.rebalanceDoubleBlack()
        } else {
            node.color = BLACK
        }
    }

    rebalanceDoubleBlack() {
        if (this.parent instanceof Anchor) {
            return
        }
        const type = this.type
        const opposite = OPPOSITE[type]
        const sibling = this.parent[opposite]
        const niece = sibling[type]
        const nephew = sibling[opposite]
        if (sibling.color === RED) {
            sibling.color = BLACK
            niece.color = RED
            sibling.rotate(opposite, type)
        } else if (nephew.color === BLACK) {
            if (niece.color === BLACK) {
                sibling.color = RED
                if (this.parent.color === BLACK) {
                    this.parent.rebalanceDoubleBlack()
                } else {
                    this.parent.color = BLACK
                }
            } else {
                niece.color = BLACK
                nephew.color = RED
                niece.rotate(type, opposite)
                this.rebalanceDoubleBlack()
            }
        } else {
            sibling.color = this.parent.color
            this.parent.color = BLACK
            nephew.color = BLACK
            sibling.rotate(opposite, type)
        }
    }

    copy(parent) {
        const node = new RBNode(parent)
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

class Anchor extends RBNode {

    left = new RBNode(this)
}

export default class RBTree {

    #anchor = new Anchor()
    #size = 0
    #totalSize = 0

    get size() {
        return this.#size
    }

    get totalSize() {
        return this.#totalSize
    }

    get #root() {
        return this.#anchor.left
    }

    set #root(value) {
        this.#anchor.left = value
    }

    has(key) {
        return this.#root.findNode(key).alive
    }

    get(key) {
        return this.#root.findNode(key).value
    }

    insert(key, value = undefined) {
        const node = this.#root.findNode(key)
        if (!node.alive) {
            this.#size++
            if (node.key === undefined) {
                this.#totalSize++
            }
        }
        node.set(key, value)
    }

    delete(key, hard = false) {
        const node = this.#root.findNode(key)
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

    clear() {
        this.#root = new RBNode()
        this.#size = 0
        this.#totalSize = 0
    }

    rebuild() {
        const tree = new RBTree()
        const nodes = [this.#root]
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
        this.#root = tree.#root
        this.#totalSize = this.#size
    }

    copy() {
        const tree = new RBTree()
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
    } = {}) {
        for (const node of this.#root.traverse(
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
        for (const node of this.#root.traverse(
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
        for (const node of this.#root.traverse(
            reverse, low, high, includeLow, includeHigh
        )) {
            yield node.value
        }
    }
}