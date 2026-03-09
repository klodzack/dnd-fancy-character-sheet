function mapValues(map, fn) {
    return Object.fromEntries(Array.from(Object.entries(map)).map(([key, value]) => [key, fn(value)]));
}

module.exports = {
    mapValues,
}