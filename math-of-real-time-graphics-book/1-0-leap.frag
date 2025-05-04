#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 u_resolution;

void main(){
    vec2 pos = gl_FragCoord.xy / u_resolution;
    vec3 red = vec3(1.0, 0.0, 0.0);
    vec3 blue = vec3(0.0, 0.0, 1.0);
    // mix関数を使って赤と青を線形補間
    // pos.xは0.0から1.0まで変化するので、0.0のときは赤、1.0のときは青
    vec3 mixed = mix(red, blue, pos.x);
    fragColor = vec4(mixed, 1.0);
}
