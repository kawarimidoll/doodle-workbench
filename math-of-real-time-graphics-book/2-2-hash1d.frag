#version 300 es
precision highp float;
precision highp int; // 32bit
out vec4 fragColor;
uniform vec2 u_resolution;
uniform float u_time;
uint k = 0x456789abu; // 算術積に使うための大きな桁数の定数
const uint UINT_MAX = 0xffffffffu; // 符号なし整数の最大値

// 任意の浮動小数点数を0から1の浮動小数点数に写すハッシュ関数
// 1. 浮動小数点数のビット列をfloatBitsToUintで符号なし整数に変換
// 2. 符号なし整数用のハッシュ関数を適用
// 3. 符号なし整数をUINT_MAXで割って0から1の範囲に正規化

// 符号なし整数のハッシュ関数
// SHIFTとXORを組み合わせて、ビット列をシャッフルする
uint uhash11(uint n) {
    n ^= (n << 1); // 左シフトしてXOR
    n ^= (n >> 1); // 右シフトしてXOR
    n *= k; // 算術積
    n ^= (n << 1); // 左シフトしてXOR
    return n * k; // 算術積
}

// 浮動小数点数のハッシュ関数
float hash11(float p) {
    uint n = floatBitsToUint(p); // 浮動小数点数のビット列を符号なし整数に変換
    return float(uhash11(n)) / float(UINT_MAX); // 値をhash化して0.0-1.0に正規化
}

void main() {
    vec2 pos = gl_FragCoord.xy + floor(60.0 * u_time); // フレーム数を加算
    fragColor = vec4(vec3(hash11(pos.x)), 1.0); // x座標をもとにnoiseを生成
}
