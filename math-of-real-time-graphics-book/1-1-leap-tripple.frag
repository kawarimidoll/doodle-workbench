#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 u_resolution;

void main() {
    vec2 pos = gl_FragCoord.xy / u_resolution;
    vec3[3] col3 = vec3[3](
            vec3(1.0, 0.0, 0.0),
            vec3(0.0, 0.0, 1.0),
            vec3(0.0, 1.0, 0.0)
        );
    pos.x *= 2.0; // x方向を0.0~2.0にスケール
    int idx = int(pos.x); // 整数部分を取得
    vec3 mixed = mix(col3[idx], col3[idx + 1], fract(pos.x)); // fractは小数部分を取得する関数
    fragColor = vec4(mixed, 1.0);
}
