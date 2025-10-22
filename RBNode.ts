import type {
    Color,
    Direction
} from './types'


export default class RBNode<K, V> {

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


    static createAnchor<K, V>() : RBNode<K, V>{
        const anchor = new RBNode<K, V>()
        anchor.left = new RBNode(anchor)
        return anchor
    }


    isAnchor(): boolean {
        return this.parent === this
    }


    isNull(): boolean {
        return this.left === this && this.right === this
    }


    get type(): Direction {
        return (this === this.parent.left) ? 'left' : 'right'
    }


    get opposite(): Direction {
        return (this === this.parent.left) ? 'right' : 'left'
    }


    #rotate(type: Direction, opposite: Direction): void {
        const parent = this.parent
        this.#connectParent(parent.parent, parent.type)
        this[opposite].#connectParent(parent, type)
        parent.#connectParent(this, opposite)
    }


    #connectParent(parent: RBNode<K, V>, type: Direction): void {
        this.parent = parent
        parent[type] = this
    }


    #swapColorWith(node: RBNode<K, V>): void {
        const color = node.color
        node.color = this.color
        this.color = color
    }


    set(key: K, value?: V): boolean {

        this.key = key
        this.value = value
        this.alive = true

        if (this.isNull()) {
            this.left = new RBNode(this)
            this.right = new RBNode(this)
            this.color = 'RED'
            this.#rebalanceRed()
            return true
        }

        return false
    }


    #rebalanceRed(): void {

        if (this.parent.isAnchor()) {
            this.color = 'BLACK'
            return
        }

        if (this.parent.color === 'BLACK') {
            return
        }

        const type = this.type
        const opposite = this.opposite
        const grandParent = this.parent.parent
        const uncle = grandParent[opposite]

        if (type !== this.parent.type) {
            this.#rotate(type, opposite)
            this[opposite].#rebalanceRed()
        } else if (uncle.color === 'RED') {
            uncle.color = 'BLACK'
            grandParent.#swapColorWith(this.parent)
            grandParent.#rebalanceRed()
        } else {
            this.parent.#swapColorWith(grandParent)
            this.parent.#rotate(type, opposite)
        }
    }


    deleteLazy(): boolean {

        this.value = undefined

        if (this.alive) {
            this.alive = false
            return true
        }

        return false
    }


    delete(): boolean {

        if (this.isNull()) {
            return false
        }

        if (this.left.isNull()) {
            this.#replaceWith(this.right)
        } else if (this.right.isNull()) {
            this.#replaceWith(this.left)
        } else {
            let successor = this.right

            while (!successor.left.isNull()) {
                successor = successor.left
            }

            this.key = successor.key
            this.value = successor.value
            this.alive = successor.alive
            successor.#replaceWith(successor.right)
        }

        return true
    }


    #replaceWith(node: RBNode<K, V>): void {

        node.#connectParent(this.parent, this.type)

        if (this.color === 'BLACK' && node.color === 'BLACK') {
            node.#rebalanceDoubleBlack()
        } else {
            node.color = 'BLACK'
        }
    }


    #rebalanceDoubleBlack(): void {

        if (this.parent.isAnchor()) {
            return
        }

        const type = this.type
        const opposite = this.opposite
        const sibling = this.parent[opposite]
        const niece = sibling[type]
        const nephew = sibling[opposite]

        if (sibling.color === 'RED') {
            sibling.#swapColorWith(niece)
            sibling.#rotate(opposite, type)
        } else if (nephew.color === 'RED') {
            nephew.color = 'BLACK'
            sibling.#swapColorWith(this.parent)
            sibling.#rotate(opposite, type)
        } else if (niece.color === 'RED') {
            niece.#swapColorWith(nephew)
            niece.#rotate(type, opposite)
            this.#rebalanceDoubleBlack()
        } else if (this.parent.color === 'BLACK') {
            sibling.color = 'RED'
            this.parent.#rebalanceDoubleBlack()
        } else {
            sibling.#swapColorWith(this.parent)
        }
    }


    copy(parent?: RBNode<K, V>): RBNode<K, V> {

        const node = new RBNode<K, V>(parent)

        if (!this.isNull()) {
            node.left = this.left.copy(node)
            node.right = this.right.copy(node)
            node.key = this.key
            node.value = this.value
            node.alive = this.alive
            node.color = this.color
        }

        return node
    }
}