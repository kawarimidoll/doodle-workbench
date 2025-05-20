#version 300 es
precision highp float;
precision highp int; // 32bit
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
int channel;

float LINE_WIDTH = 0.01;

// Plot a line on Y using a value between 0.0-1.0
float plot(vec2 st) {
    return smoothstep(LINE_WIDTH, 0.0, abs(st.y - st.x));
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;

    float y = st.x;

    vec3 color = vec3(y);

    // Plot a line
    float pct = plot(st);
    color = (1.0 - pct) * color + pct * vec3(0.0, 1.0, 0.0);

    fragColor = vec4(color, 1.0);
}
