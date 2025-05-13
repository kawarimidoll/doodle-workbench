#version 300 es
precision highp float;
precision highp int; // 32bit
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
int channel;

void main() {
    vec2 st = u_mouse.xy / u_resolution;
    fragColor = vec4(st, 1.0, 1.0);
}
