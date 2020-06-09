function ptInTriangle(p, p0, p1, p2) {
    var A = 1/2 * (-p1[1] * p2[0] + p0[1] * (-p1[0] + p2[0]) + p0[0] * (p1[1] - p2[1]) + p1[0] * p2[1]);
    var sign = A < 0 ? -1 : 1;
    var s = (p0[1] * p2[0] - p0[0] * p2[1] + (p2[1] - p0[1]) * p[0] + (p0[0] - p2[0]) * p[1]) * sign;
    var t = (p0[0] * p1[1] - p0[1] * p1[0] + (p0[1] - p1[1]) * p[0] + (p1[0] - p0[0]) * p[1]) * sign;

    return s > 0 && t > 0 && (s + t) < 2 * A * sign;
}
