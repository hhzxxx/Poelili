function midNum(list) {
    list = list.sort((a, b) => a - b);
    console.log(list);
    return list.length % 2 !== 0
        ? list[Math.floor(list.length / 2)]
        : (list[Math.floor(list.length / 2) - 1] +
            list[Math.floor(list.length / 2)]) /
        2
}

export {
    midNum
}