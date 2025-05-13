#version 300 es
precision highp float;
precision highp int; // 32bit
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
int channel;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;
    fragColor = vec4(st, abs(sin(u_time)), 1.0);
}
