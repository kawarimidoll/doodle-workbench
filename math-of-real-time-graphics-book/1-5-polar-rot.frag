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
vec3 polarTexture(vec2 st) {
    float time = 0.2 * u_time;
    vec3 circ = vec3(polarToCartesian(vec2(time, 0.5)) + 0.5, 1.0);
    vec3[3] col3 = vec3[](
            // swizzleで色を作成
            circ.rgb, circ.gbr, circ.brg
        );
    // 偏角の範囲は[-PI, PI)なので、[0,2)に変換
    st.s = st.s / PI + 1.0;

    st.s += time; // 時間で回転

    // 偏角をインデックスに変換
    int index = int(st.s);

    // 赤-青-赤の補間
    // グラデーションをつなげるためには始点と終点の色を一致させる必要がある
    vec3 col = mix(col3[index % 2], col3[(index + 1) % 2], fract(st.s));

    // 動径に沿って中心のcol3[2]に向かって補間
    // これがないと中央でグラデーションが繋がらない
    return mix(col3[2], col, st.t);
}

void main() {
    vec2 pos = gl_FragCoord.xy / u_resolution; // [0, 1]範囲に正規化
    pos = 2.0 * pos.xy - vec2(1.0); // [-1, 1]範囲に変換

    pos = cartesianToPolar(pos); // デカルト座標から極座標に変換

    fragColor = vec4(polarTexture(pos), 1.0);
}
