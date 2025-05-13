#version 300 es
precision highp float;
precision highp int; // 32bit
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
int channel;

void main() {
    fragColor = vec4(abs(sin(u_time)), 0.0, 0.0, 1.0);
}
