declare global {
    interface Array<T> {
        groupBy<K>(getKey: (item: T) => K): [K, T[]][]
    }
}

Array.prototype.groupBy = function groupBy<TValue, TKey>(this: TValue[], getKey: (item: TValue) => TKey) {
    const map = new Map<TKey, TValue[]>()
    for (const item of this) {
        const key = getKey(item)
        const list = map.get(key)
        if (list) list.push(item)
        else map.set(key, [item])
    }
    return Array.from(map)
}

export { }