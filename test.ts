import RBTree from './RBTree.ts'

let tree: RBTree<[number, number]> = new RBTree((a, b) => a[0] + a[1] - b[0] - b[1])

console.log('Adding random keys')

for (let i = 0; i < 100; i++) {
    tree.insert([Math.floor(1000 * Math.random()), Math.floor(100 * Math.random())])
}

console.log('entries:', Array.from(tree.entries()))
console.log('Deleting some nodes')

for (let i = 0; i < 100; i++) {
    tree.delete([Math.floor(1000 * Math.random()), Math.floor(100 * Math.random())])
}

console.log('keys:', Array.from(tree.keys()))
console.log('size:', tree.size)
console.log('totalSize', tree.totalSize)
console.log('Hard deleting some nodes')

for (let i = 0; i < 250; i++) {
    tree.delete([Math.floor(1000 * Math.random()), Math.floor(100 * Math.random())], true)
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
console.log(Array.from(tree.keys({low: [100, 50], high: [150, 150], includeLow: false})))
console.log('keys in descending order in interval [800, inf)')
console.log(Array.from(tree.keys({reverse: true, low: [300, 500]})))