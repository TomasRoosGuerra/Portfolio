/* ============================================================
   gl/layers/gradient.js — full-screen fluid background.

   Descendant of the old js/shader-bg.js: same domain-warped FBM,
   recoloured to the site's one-accent system (near-black + amber)
   and driven by the shared core state instead of its own loop.
   ============================================================ */
import * as THREE from "three";
import { COMMON, SIMPLEX_2D, FBM_2D } from "../noise.js";
import { PALETTE, ACCENT_DEEP } from "../theme.js";

var FRAG =
  COMMON +
  SIMPLEX_2D +
  FBM_2D +
  /* glsl */ `
uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;
uniform float uProgress;
uniform float uQuality;
uniform vec3  uBg;
uniform vec3  uDeep;
uniform vec3  uAccent;

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  uv.y = 1.0 - uv.y;                 // y=0 at top

  float t = uTime * 0.085;           // slow, dreamlike
  vec2  mo = uMouse * 0.055;

  // Domain-warp chain: uv -> q -> r -> f. Low frequencies on
  // purpose — big soft pools, not marbling.
  vec2 q = vec2(
    fbm2(uv * 1.25 + mo + t * 1.1),
    fbm2(uv * 1.25 + vec2(5.2, 1.3) + mo + t)
  );
  vec2 r = vec2(
    fbm2(uv * 1.25 + 1.6 * q + vec2(1.7, 9.2) + mo * 1.3 + t * 0.8),
    fbm2(uv * 1.25 + 1.6 * q + vec2(8.3, 2.8) + t * 0.75)
  );
  float f = 0.5 + 0.5 * fbm2(uv * 0.9 + 2.2 * r + t * 0.6);

  // Secondary band — dropped on low-tier devices
  float f2 = 0.5 + 0.5 * snoise2(uv * 1.9 + vec2(-t * 1.3, t * 0.9) + uMouse * 0.045);
  f2 = mix(f, f2, step(0.6, uQuality));

  // Warm haze. Amber is far brighter than the violet this shader
  // grew from, so the mixes stay low or the page stops being black.
  // Scroll deepens the field so the hero form reads against it.
  float lift = 1.0 - uProgress * 0.45;

  vec3 col = uBg;
  col = mix(col, uDeep,   smoothstep(0.34, 0.72, f)  * 0.34 * lift);
  col = mix(col, uAccent, smoothstep(0.68, 0.96, f2) * 0.07 * lift);
  col = mix(col, uAccent, smoothstep(0.80, 1.00, f)  * 0.05 * lift);

  // Cursor warmth
  vec2  mp = uMouse * 0.5 + 0.5;
  float md = length(uv - mp);
  col += uAccent * exp(-md * md * 5.8) * 0.045 * lift;

  // Vignette focused on the hero title zone, then fade back to the
  // flat background at the top edge (behind the header) and bottom.
  // Pooled toward the right of the hero, where the form sits —
  // keeps the top-left clean behind the wordmark.
  vec2  fc = vec2(0.66, 0.40);
  float rd = 1.0 - smoothstep(0.0, 1.05, length((uv - fc) * vec2(1.15, 1.85)));
  float mask = (rd * 0.62 + 0.03)
             * smoothstep(0.0, 0.06, uv.y)
             * smoothstep(1.0, 0.74, uv.y);

  gl_FragColor = vec4(mix(uBg, col, mask), 1.0);
}
`;

var VERT = /* glsl */ `
void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

export function createGradient() {
  var uniforms = {
    uRes: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uProgress: { value: 0 },
    uQuality: { value: 1 },
    uBg: { value: PALETTE.bg },
    uDeep: { value: ACCENT_DEEP },
    uAccent: { value: PALETTE.accent },
  };

  var mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: uniforms,
      precision: "mediump",
      depthTest: false,
      depthWrite: false,
    })
  );
  mesh.frustumCulled = false;

  var scene = new THREE.Scene();
  scene.add(mesh);

  return {
    scene: scene,
    camera: new THREE.Camera(),

    resize: function (s) {
      uniforms.uRes.value.set(s.size.x * s.dpr, s.size.y * s.dpr);
      uniforms.uQuality.value = s.quality;
    },

    update: function (s) {
      uniforms.uTime.value = s.time;
      uniforms.uMouse.value.copy(s.pointer);
      uniforms.uProgress.value = s.progress;
    },

    dispose: function () {
      mesh.geometry.dispose();
      mesh.material.dispose();
    },
  };
}
