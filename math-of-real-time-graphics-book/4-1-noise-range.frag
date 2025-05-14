#version 300 es
precision highp float;
precision highp int; // 32bit
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
const float PI = 3.1415926;
ivec2 channel;

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

// hash functions start
const uvec3 SHUFFLER = uvec3(0x456789abu, 0x6789ab45u, 0x89ab4567u);
const uvec3 SHIFTER = uvec3(1, 2, 3);
const uint UINT_MAX = 0xffffffffu;
uint uhash11(uint n) {
    n ^= (n << SHIFTER.x); // 左シフトしてXOR
    n ^= (n >> SHIFTER.x); // 右シフトしてXOR
    n *= SHUFFLER.x; // 算術積
    n ^= (n << SHIFTER.x); // 左シフトしてXOR
    return n * SHUFFLER.x; // 算術積
}
float hash11(float p) {
    uint n = floatBitsToUint(p); // 浮動小数点数のビット列を符号なし整数に変換
    return float(uhash11(n)) / float(UINT_MAX); // 値をhash化して0.0-1.0に正規化
}
uvec2 uhash22(uvec2 n) {
    n ^= (n.yx << SHIFTER.xy);
    n ^= (n.yy >> SHIFTER.xy);
    n *= SHUFFLER.xy;
    n ^= (n.yx << SHIFTER.xy);
    return n * SHUFFLER.xy;
}
vec2 hash22(vec2 p) {
    uvec2 n = floatBitsToUint(p);
    return vec2(uhash22(n)) / vec2(UINT_MAX);
}
uvec3 uhash33(uvec3 n) {
    n ^= (n.yzx << SHIFTER.xyz);
    n ^= (n.yzx >> SHIFTER.xyz);
    n *= SHUFFLER.xyz;
    n ^= (n.yzx << SHIFTER.xyz);
    return n * SHUFFLER.xyz;
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
    // if (channel == 0) {
    //     // 3次エルミート補間
    //     f = f * f * (3.0 - 2.0 * f);
    // } else {
    //     // 5次エルミート補間
    //     f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    // }
    f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
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

// 3変数・3次元出力の値ノイズ関数
vec3 vnoise33(vec3 p) {
    vec3 n = floor(p);
    vec3 v[8];
    for (int k = 0; k < 2; k++) {
        for (int j = 0; j < 2; j++) {
            for (int i = 0; i < 2; i++) {
                v[i + 2 * j + 4 * k] = hash33(n + vec3(i, j, k));
            }
        }
    }
    vec3 f = fract(p);
    f = smoothstep(0.0, 1.0, f); // エルミート補間
    vec3[2] w;
    for (int i = 0; i < 2; i++) {
        w[i] = mix(
                mix(v[4 * i], v[4 * i + 1], f[0]),
                mix(v[4 * i + 2], v[4 * i + 3], f[0]),
                f[1]);
    }
    return mix(w[0], w[1], f[2]);
}

// 数値微分による勾配取得
vec2 grad(vec2 p) {
    float eps = 0.001; // 微小量
    vec2 ex = vec2(eps, 0.0); // x方向の微小ベクトル
    vec2 ey = vec2(0.0, eps); // y方向の微小ベクトル
    // 中央差分（中心差分）法で勾配を計算
    return 0.5 * (vec2(
            vnoise21(p + ex) - vnoise21(p - ex),
            vnoise21(p + ey) - vnoise21(p - ey)
        )) / eps;
}

// 2次元勾配ノイズ
float gnoise21(vec2 p) {
    vec2 n = floor(p);
    vec2 f = fract(p);
    float[4] v;
    for (int j = 0; j < 2; j++) {
        for (int i = 0; i < 2; i++) {
            // 乱数ベクトルを正規化
            vec2 g = normalize(hash22(n + vec2(i, j)) - vec2(0.5));
            // 窓関数の係数を計算
            v[i + 2 * j] = dot(g, f - vec2(i, j));
        }
    }
    // 5次エルミート補間
    f = f * f * f * (10.0 - 15.0 * f + 6.0 * f * f);
    // ノイズ値を正規化して返却
    return 0.5 * mix(mix(v[0], v[1], f[0]), mix(v[2], v[3], f[0]), f[1]) + 0.5;
}

// 3次元勾配ノイズ
float gnoise31(vec3 p) {
    vec3 n = floor(p);
    vec3 f = fract(p);
    float[8] v;
    for (int k = 0; k < 2; k++) {
        for (int j = 0; j < 2; j++) {
            for (int i = 0; i < 2; i++) {
                // 乱数ベクトルを正規化
                vec3 g = normalize(hash33(n + vec3(i, j, k)) - vec3(0.5));
                // 窓関数の係数を計算
                v[i + 2 * j + 4 * k] = dot(g, f - vec3(i, j, k));
            }
        }
    }
    // 5次エルミート補間
    f = f * f * f * (10.0 - 15.0 * f + 6.0 * f * f);

    float[2] w;
    for (int i = 0; i < 2; i++) {
        w[i] = mix(
                mix(v[4 * i], v[4 * i + 1], f[0]),
                mix(v[4 * i + 2], v[4 * i + 3], f[0]),
                f[1]);
    }
    // ノイズ値を正規化して返却
    return 0.5 * mix(w[0], w[1], f[2]) + 0.5;
}

void main() {
    vec2 pos = gl_FragCoord.xy / min(u_resolution.x, u_resolution.y); // [0, 1]範囲に正規化
    pos = 10.0 * pos + u_time; // スケールして時間を加算

    channel = ivec2(gl_FragCoord.xy * 2.0 / u_resolution.xy);
    float v;
    if (channel[0] == 0) {
        if (channel[1] == 0) {
            // 左下：2変数の値ノイズ
            v = vnoise21(pos);
        } else {
            // 左上：3変数の値ノイズ
            v = vnoise31(vec3(pos, u_time));
        }
    } else {
        if (channel[1] == 0) {
            // 右下：2変数の勾配ノイズ
            v = gnoise21(pos);
        } else {
            // 右上：3変数の勾配ノイズ
            v = gnoise31(vec3(pos, u_time));
        }
    }
    fragColor.rgb = hsvToRgbSmooth(vec3(v, 1.0, 1.0));
    fragColor.a = 1.0;
}
