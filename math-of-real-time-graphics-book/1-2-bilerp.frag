#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 u_resolution;

void main() {
    vec2 pos = gl_FragCoord.xy / u_resolution;
    vec3[4] col4 = vec3[](
            vec3(1.0, 0.0, 0.0),
            vec3(0.0, 0.0, 1.0),
            vec3(0.0, 1.0, 0.0),
            vec3(1.0, 1.0, 0.0)
        );
    // 上辺と下辺で別々の線形補間
    vec3 mixedBottom = mix(col4[0], col4[1], pos.x);
    vec3 mixedTop = mix(col4[2], col4[3], pos.x);
    // 上辺と下辺の線形補間
    vec3 mixed = mix(mixedBottom, mixedTop, pos.y);
    fragColor = vec4(mixed, 1.0);
}
