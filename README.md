# Red-Black Tree

A simple TypeScript implementation of a red-black tree that stores key-value pairs and can be used as a Map or a Set (value is undefined by default). Here's a minimal example showing how to use it:

```ts
import RBT from '.../RBTree.ts'

const tree = new RBT<number, string>((key) => key)
tree.insert(1, 'Cat') // key = 1, value = 'Cat'
tree.insert(2) // value = undefined
tree.insert(4, 'Banana')
tree.has(1) // -> true
tree.get(1) // -> 'Cat'
tree.size // -> 3
tree.delete(1)
tree.get(1) // -> undefined
Array.from(tree.keys()) // [2, 4]
Array.from(tree.values()) // [undefined, 'Banana']
```

There is some more functionality too, such as lazy deletion (simply toggles a flag instead of removing) and a rebuild() function that excludes those ones. There's also the option to iterate through the tree with entries(), keys() and values(), which all accepts optional arguments for reverse and specifying range as follows:

```ts
const set = new RBT<number>((key) => key)
for (let i = 0; i < 10; i++) {
    set.insert(i)
}

set.keys({low: 4, includeLow: false}) // -> iterator 5, 6, 7, 8, 9
set.keys({low: 2, high: 4, reverse: true}) // -> iterator 4, 3, 2
set.delete(5, true) // lazy deletion
set.size // -> 9
set.totalSize // -> 10
set.rebuild()
set.totalSize // -> 9
```