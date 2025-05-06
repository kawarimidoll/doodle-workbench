#version 300 es
precision highp float;
precision highp int; // 32bit
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
int channel;

// hash functions start
const uvec3 shuffler = uvec3(0x456789abu, 0x6789ab45u, 0x89ab4567u);
const uvec3 shifter = uvec3(1, 2, 3);
const uint UINT_MAX = 0xffffffffu;
uint uhash11(uint n) {
    n ^= (n << shifter.x); // 左シフトしてXOR
    n ^= (n >> shifter.x); // 右シフトしてXOR
    n *= shuffler.x; // 算術積
    n ^= (n << shifter.x); // 左シフトしてXOR
    return n * shuffler.x; // 算術積
}
float hash11(float p) {
    uint n = floatBitsToUint(p); // 浮動小数点数のビット列を符号なし整数に変換
    return float(uhash11(n)) / float(UINT_MAX); // 値をhash化して0.0-1.0に正規化
}
uvec2 uhash22(uvec2 n) {
    n ^= (n.yx << shifter.xy);
    n ^= (n.yy >> shifter.xy);
    n *= shuffler.xy;
    n ^= (n.yx << shifter.xy);
    return n * shuffler.xy;
}
vec2 hash22(vec2 p) {
    uvec2 n = floatBitsToUint(p);
    return vec2(uhash22(n)) / vec2(UINT_MAX);
}
uvec3 uhash33(uvec3 n) {
    n ^= (n.yzx << shifter.xyz);
    n ^= (n.yzx >> shifter.xyz);
    n *= shuffler.xyz;
    n ^= (n.yzx << shifter.xyz);
    return n * shuffler.xyz;
}
vec3 hash33(vec3 p) {
    uvec3 n = floatBitsToUint(p);
    return vec3(uhash33(n)) / vec3(UINT_MAX);
}
float hash21(vec2 p) {
    uvec2 n = floatBitsToUint(p);
    return float(uhash22(n).x) / float(UINT_MAX);
}
float hash31(vec3 p) {
    uvec3 n = floatBitsToUint(p);
    return float(uhash33(n).x) / float(UINT_MAX);
}
// hash functions end

// 2変数の値ノイズ関数
float vnoise21(vec2 p) {
    vec2 n = floor(p); // 格子点を扱うため、小数点以下を切り捨て
    float v[4]; // 任意の点の周囲の4つの格子点のノイズ値を格納する配列
    for (int j = 0; j < 2; j++) {
        for (int i = 0; i < 2; i++) {
            v[i + 2 * j] = hash21(n + vec2(i, j));
        }
    }
    vec2 f = fract(p);
    if (channel == 1) {
        f = f * f * (3.0 - 2.0 * f); // エルミート補間
        // f = smoothstep(0.0, 1.0, f); // これと同じ
    }
    return mix(mix(v[0], v[1], f[0]), mix(v[2], v[3], f[0]), f[1]); // 線形補間
}

// 3変数の値ノイズ関数
float vnoise31(vec3 p) {
    vec3 n = floor(p);
    float v[8];
    for (int k = 0; k < 2; k++) {
        for (int j = 0; j < 2; j++) {
            for (int i = 0; i < 2; i++) {
                v[i + 2 * j + 4 * k] = hash31(n + vec3(i, j, k));
            }
        }
    }
    vec3 f = fract(p);
    f = smoothstep(0.0, 1.0, f); // エルミート補間
    float[2] w;
    for (int i = 0; i < 2; i++) {
        w[i] = mix(
                mix(v[4 * i], v[4 * i + 1], f[0]),
                mix(v[4 * i + 2], v[4 * i + 3], f[0]),
                f[1]);
    }
    return mix(w[0], w[1], f[2]);
}

void main() {
    vec2 pos = gl_FragCoord.xy / min(u_resolution.x, u_resolution.y); // [0, 1]範囲に正規化
    pos = 10.0 * pos + u_time; // スケールして時間を加算

    channel = int(3.0 * gl_FragCoord.x / u_resolution.x); // 画面を3分割
    if (channel < 2) {
        fragColor = vec4(vec3(vnoise21(pos)), 1.0);
    } else {
        fragColor = vec4(vnoise31(vec3(pos, u_time))); // x, y, 時間で3次元ノイズ
    }
}
