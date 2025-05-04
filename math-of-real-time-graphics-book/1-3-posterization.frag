#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 u_resolution;

int channel;

void main() {
    vec2 pos = gl_FragCoord.xy / u_resolution;
    vec3[4] col4 = vec3[](
            vec3(1.0, 0.0, 0.0),
            vec3(1.0, 1.0, 0.0),
            vec3(1.0, 0.0, 1.0),
            vec3(1.0, 1.0, 1.0)
        );
    float n = 6.0; // 階調数 これは色ベクトルの要素数とは関係ない
    pos *= n; // 座標空間を[0,n]範囲にスケール
    pos = floor(pos) + step(0.5, fract(pos)); // (整数部分)+(四捨五入) で階段化

    pos /= n; // 座標空間を[0,1]範囲に戻す

    // 上辺と下辺で別々の線形補間
    vec3 mixedBottom = mix(col4[0], col4[1], pos.x);
    vec3 mixedTop = mix(col4[2], col4[3], pos.x);
    // 上辺と下辺の線形補間
    vec3 mixed = mix(mixedBottom, mixedTop, pos.y);
    fragColor = vec4(mixed, 1.0);
}
