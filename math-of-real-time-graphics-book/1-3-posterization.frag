#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

int channel;

void main() {
    vec2 pos = gl_FragCoord.xy / u_resolution;

    // channel = int(2.0 * pos.x); // ビューポート左側が0、右側が1
    channel = gl_FragCoord.x < u_mouse.x ? 0 : 1; // マウス左側が0、右側が1

    vec3[4] col4 = vec3[](
            vec3(1.0, 0.0, 0.0),
            vec3(1.0, 1.0, 0.0),
            vec3(1.0, 0.0, 1.0),
            vec3(1.0, 1.0, 1.0)
        );
    float n = 6.0; // 階調数 これは色ベクトルの要素数とは関係ない
    pos *= n; // 座標空間を[0,n]範囲にスケール

    if (channel == 0) {
        // 左側: stepで階段化
        pos = floor(pos) + step(0.5, fract(pos)); // (整数部分)+(四捨五入) で階段化
    } else {
        // 右側: smoothstepで階段化
        float margin = 0.25 * (sin(u_time) + 1.0);
        pos = floor(pos) + smoothstep(0.5 - margin, 0.5 + margin, fract(pos));
    }

    pos /= n; // 座標空間を[0,1]範囲に戻す

    // 上辺と下辺で別々の線形補間
    vec3 mixedBottom = mix(col4[0], col4[1], pos.x);
    vec3 mixedTop = mix(col4[2], col4[3], pos.x);
    // 上辺と下辺の線形補間
    vec3 mixed = mix(mixedBottom, mixedTop, pos.y);
    fragColor = vec4(mixed, 1.0);
}
