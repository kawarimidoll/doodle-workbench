#version 300 es
precision highp float;
precision highp int; // 32bit
out vec4 fragColor;
uniform vec2 u_resolution;
uniform float u_time;

const float PI = 3.1415926;

int channel;

void main() {
    vec2 pos = gl_FragCoord.xy / u_resolution.xy; // [0, 1]範囲に正規化
    pos *= vec2(32.0, 9.0); // 32:9のアスペクト比に変換

    uint[9] a = uint[]( // 2進数表示の符号なし整数の配列
            uint(u_time), // a[0]: 経過時間
            0xbu, // a[1]: 符号なし整数としての16進数のb
            9u, // a[2]: 符号なし整数としての10進数の9
            0xbu ^ 9u, // a[3]: 2つの整数のXOR
            0xffffffffu, // a[4]: 符号なし整数の最大値
            0xffffffffu + uint(u_time), // a[5]: オーバーフロー
            floatBitsToUint(floor(u_time)), // a[6]: 浮動小数点数を符号なし整数に変換
            floatBitsToUint(-floor(u_time)),
            floatBitsToUint(11.5625)
        );

    if (fract(pos.x) < 0.1) {
        // 縦区切り線
        if (floor(pos.x) == 1.0) {
            // 最上位ビット 符号を表す
            fragColor = vec4(1.0, 0.0, 0.0, 1.0);
        } else if (floor(pos.x) == 9.0) {
            // 9桁目 指数部と仮数部の区切り
            fragColor = vec4(0.0, 1.0, 0.0, 1.0);
        } else {
            fragColor = vec4(0.5);
        }
    } else if (fract(pos.y) < 0.1) {
        // 横区切り線
        fragColor = vec4(0.5);
    } else {
        // y座標に応じて配列の値を表示
        // 画面の下側が0、上側が8
        uint b = a[int(pos.y)];
        b = (b << uint(pos.x)) >> 31;
        fragColor = vec4(vec3(b), 1.0);
    }
}
