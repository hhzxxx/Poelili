function midNum(list) {
    list = list.sort((a, b) => a - b);
    console.log(list);
    return list.length % 2 !== 0
        ? list[Math.floor(list.length / 2)]
        : (list[Math.floor(list.length / 2) - 1] +
            list[Math.floor(list.length / 2)]) /
        2
}

function strSimilarity2Number(s, t) {
    var n = s.length, m = t.length, d = [];
    var i, j, s_i, t_j, cost;
    if (n == 0) return m;
    if (m == 0) return n;
    for (i = 0; i <= n; i++) {
        d[i] = [];
        d[i][0] = i;
    }
    for (j = 0; j <= m; j++) {
        d[0][j] = j;
    }
    for (i = 1; i <= n; i++) {
        s_i = s.charAt(i - 1);
        for (j = 1; j <= m; j++) {
            t_j = t.charAt(j - 1);
            if (s_i == t_j) {
                cost = 0;
            } else {
                cost = 1;
            }
            d[i][j] = Minimum(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
        }
    }
    return d[n][m];
}
//两个字符串的相似程度，并返回相似度百分比
function strSimilarity2Percent(s, t) {
    var l = s.length > t.length ? s.length : t.length;
    var d = strSimilarity2Number(s, t);
    return (1 - d / l).toFixed(4);
}
function Minimum(a, b, c) {
    return a < b ? (a < c ? a : c) : (b < c ? b : c);
}

export {
    midNum,
    strSimilarity2Percent
}