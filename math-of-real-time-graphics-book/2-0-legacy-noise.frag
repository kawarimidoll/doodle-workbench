#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 u_resolution;
uniform float u_time;

const float PI = 3.1415926;

int channel;

// sin関数の小数部の深いところを使用したノイズ関数
// 浮動小数点制度によって値が変動するほか、せっかく計算した整数部を捨てているので効率も悪い
// このアルゴリズムとマジックナンバーが乱数の制度を保証する根拠も乏しく、優秀とは言えない

float fractSin11(float x){
  return fract(1000.0 * sin(x));
}
float fractSin21(vec2 xy){
  // この数字はGLSLで伝統的に使われているマジックナンバーらしい
  return fract(sin(dot(xy, vec2(12.9898, 78.233)))*43758.5453123);
}

void main() {
  vec2 pos = gl_FragCoord.xy + floor(u_time * 60.0); // フラグメント座標を時間変動させる

  channel = int(2.0 * gl_FragCoord.x / u_resolution.x); // 0 or 1

  if (channel == 0) {
    // 左側：xによるノイズ
    fragColor = vec4(vec3(fractSin11(pos.x)), 1.0);
  } else {
    // 右側：xyによるノイズ
    fragColor = vec4(vec3(fractSin21(pos.xy / u_resolution.xy)), 1.0);
  }
}
