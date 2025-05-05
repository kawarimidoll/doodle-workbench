#version 300 es
precision highp float;
precision highp int; // 32bit
out vec4 fragColor;
uniform vec2 u_resolution;
uniform float u_time;
const uvec3 shuffler = uvec3(0x456789abu, 0x6789ab45u, 0x89ab4567u); // 算術積に使うための大きな桁数の定数
const uvec3 shifter = uvec3(1, 2, 3); // シフト数
const uint UINT_MAX = 0xffffffffu; // 符号なし整数の最大値

ivec2 channel;

// 任意の浮動小数点数を0から1の浮動小数点数に写すハッシュ関数
// 1. 浮動小数点数のビット列をfloatBitsToUintで符号なし整数に変換
// 2. 符号なし整数用のハッシュ関数を適用
// 3. 符号なし整数をUINT_MAXで割って0から1の範囲に正規化

// 符号なし整数のハッシュ関数
// SHIFTとXORを組み合わせて、ビット列をシャッフルする
uint uhash11(uint n) {
    n ^= (n << shifter.x); // 左シフトしてXOR
    n ^= (n >> shifter.x); // 右シフトしてXOR
    n *= shuffler.x; // 算術積
    n ^= (n << shifter.x); // 左シフトしてXOR
    return n * shuffler.x; // 算術積
}
// 浮動小数点数のハッシュ関数
float hash11(float p) {
    uint n = floatBitsToUint(p); // 浮動小数点数のビット列を符号なし整数に変換
    return float(uhash11(n)) / float(UINT_MAX); // 値をhash化して0.0-1.0に正規化
}

// 2次元のハッシュ関数
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

// 3次元のハッシュ関数
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

// 引数が2次元、戻り値が1次元のハッシュ関数
float hash21(vec2 p){
    uvec2 n = floatBitsToUint(p);
    return float(uhash22(n).x) / float(UINT_MAX);
}

// 引数が3次元、戻り値が1次元のハッシュ関数
float hash31(vec3 p){
    uvec3 n = floatBitsToUint(p);
    return float(uhash33(n).x) / float(UINT_MAX);
}

void main() {
    float time = floor(60.0 * u_time); // フレーム数
    vec2 pos = gl_FragCoord.xy + time; // フレーム数を加算

    channel = ivec2(2.0 * gl_FragCoord.xy / u_resolution.xy); // チャンネル番号を取得
    if (channel[0] == 0) {
        // left
        if (channel[1] == 0) {
            fragColor.rgb = vec3(hash21(pos));
        } else {
            fragColor.rgb = vec3(hash22(pos), 1.0);
        }
    } else {
        // right
        if (channel[1] == 0) {
            fragColor.rgb = vec3(hash31(vec3(pos, time)));
        } else {
            fragColor.rgb = hash33(vec3(pos, time));
        }
    }
    fragColor.a = 1.0;
}
