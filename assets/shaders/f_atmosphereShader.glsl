varying vec3 vertexNormal;
void main() {
    float intensity = pow(0.5 - dot(vertexNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    gl_FragColor = vec4(0.49f, 0.14f, 0.14f, 1.0f) * intensity;
}