#version 300 es
// GLSLのバージョンを指定 ES3.0
// バージョン指定は最初の行に書く必要がある（コメントよりも先）

// 精度を指定 highpは高精度
precision highp float;

// 出力変数を定義
out vec4 fragColor;

// 画面の解像度
uniform vec2 u_resolution;

void main(){
    // 座標を正規化
    // gl_FragCoordはglsl-canvasのフラグメント座標
    // 左下が(0,0)で右上が(1,1)になるように正規化
    vec2 pos = gl_FragCoord.xy / u_resolution;
    fragColor = vec4(1.0, pos, 1.0);
}
