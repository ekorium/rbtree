import RBTree from './RBTree.js'

let tree = new RBTree()

console.log('Adding random keys')

for (let i = 0; i < 100; i++) {
    tree.insert(parseInt(1000 * Math.random()))
}

console.log('keys:', tree.keys().toArray())
console.log('Deleting some nodes')

for (let i = 0; i < 100; i++) {
    tree.delete(parseInt(1000 * Math.random()))
}

console.log('keys:', tree.keys().toArray())
console.log('size:', tree.size)
console.log('totalSize', tree.totalSize)
console.log('Hard deleting some nodes')

for (let i = 0; i < 250; i++) {
    tree.delete(parseInt(1000 * Math.random()), true)
}

console.log('keys:', tree.keys().toArray())
console.log('size:', tree.size)
console.log('totalSize', tree.totalSize)
console.log('Rebuilding tree')

tree.rebuild()

console.log('keys:', tree.keys().toArray())
console.log('size:', tree.size)
console.log('totalSize', tree.totalSize)
console.log('keys in ascending order in interval (150, 300]')
console.log(tree.keys({low: 150, high: 300, includeLow: false}).toArray())
console.log('keys in descending order in interval [800, inf)')
console.log(tree.keys({reverse: true, low: 800}).toArray())