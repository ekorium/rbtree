import RBT from './RBTree.ts'

let tree: RBT<number> = new RBT((x) => x)

console.log('Adding random keys')

for (let i = 0; i < 100; i++) {
    tree.insert(Math.floor(1000 * Math.random()))
}

console.log('entries:', Array.from(tree.entries()))
console.log('Deleting some nodes')

for (let i = 0; i < 100; i++) {
    tree.delete(Math.floor(1000 * Math.random()), true)
}

console.log('keys:', Array.from(tree.keys()))
console.log('size:', tree.size)
console.log('totalSize', tree.totalSize)
console.log('Hard deleting some nodes')

for (let i = 0; i < 250; i++) {
    tree.delete(Math.floor(1000 * Math.random()))
}

console.log('values:', Array.from(tree.values()))
console.log('size:', tree.size)
console.log('totalSize', tree.totalSize)
console.log('Rebuilding tree')

tree.rebuild()

console.log('keys:', Array.from(tree.keys()))
console.log('size:', tree.size)
console.log('totalSize', tree.totalSize)
console.log('keys in ascending order in interval (150, 300]')
console.log(Array.from(tree.keys({low: 150, high: 300, includeLow: false})))
console.log('keys in descending order in interval [800, inf)')
console.log(Array.from(tree.keys({reverse: true, low: 800})))