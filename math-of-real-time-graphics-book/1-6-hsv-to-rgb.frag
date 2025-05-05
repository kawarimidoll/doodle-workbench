#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

const float PI = 3.1415926;

int channel;

float atan2(float y, float x) {
    return x == 0.0 ? sign(y) * PI / 2.0 : atan(y, x);
}
vec2 cartesianToPolar(vec2 v) {
    return vec2(atan2(v.y, v.x), length(v));
}
vec2 polarToCartesian(vec2 v) {
    // v.x: angle, v.y: length
    return v.y * vec2(cos(v.x), sin(v.x));
}

// ref: https://www.shadertoy.com/view/MsS3Wc
vec3 hsvToRgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);

    return c.z * mix(vec3(1.0), rgb, c.y);
}
vec3 hsvToRgbSmooth(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);

    rgb = rgb * rgb * (3.0 - 2.0 * rgb); // cubic smoothing
    return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
    vec2 pos = gl_FragCoord.xy / u_resolution; // [0, 1]範囲に正規化
    pos = 2.0 * pos.xy - vec2(1.0); // [-1, 1]範囲に変換

    pos = cartesianToPolar(pos); // 直交座標系から極座標系に変換
    // この時点でpos.xは[-PI, PI]の範囲
    // PIで割ることで[-1, 1]の範囲に変換
    // さらに0.5を掛けて[-0.5, 0.5]の範囲に変換
    // mod(0.5 * pos.x / PI, 1.0)で[0, 1]の範囲に変換
    pos.x = mod(0.5 * pos.x / PI, 1.0); // [0, 1]の範囲に変換

    // pos.xは色相、pos.yは明度 brightnessは1.0で固定
    // fragColor = vec4(hsvToRgb(vec3(pos, 1.0)), 1.0);
    fragColor = vec4(hsvToRgbSmooth(vec3(pos, 1.0)), 1.0);
}
