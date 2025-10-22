# Red-Black Tree

A simple implementation of a red-black tree that stores key-value pairs and can be used as a Map or a Set (value is undefined by default). Here's a minimal example showing how to use it:

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
Array.from(tree.values()) // [undefined, 'Banana']
```

There is some more functionality too, such as lazy deletion (simply toggles a flag instead of removing) and a rebuild() function that excludes those ones. There's also the option to iterate through the tree with entries(), keys() and values(), which all accepts optional arguments for reverse and specifying range.
