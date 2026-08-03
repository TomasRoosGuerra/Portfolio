/* ============================================================
   gl/layers/blob.js — the hero form.

   A noise-displaced icosahedron: dark body, amber fresnel rim.
   Scroll progress drives displacement amplitude, frequency and
   the camera dolly; the pointer adds a small parallax tilt.

   Geometry detail and displacement octaves scale with the tier
   quality scalar handed down by gl/core.
   ============================================================ */
import * as THREE from "three";
import { COMMON, SIMPLEX_3D } from "../noise.js";
import { PALETTE, ACCENT_DEEP } from "../theme.js";

var VERT =
  COMMON +
  SIMPLEX_3D +
  /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uFreq;

varying vec3  vNormal;
varying vec3  vView;
varying float vDisp;

// Two rotated octaves — enough to read as "liquid", cheap per vertex.
float field(vec3 p){
  float n  = snoise3(p * uFreq + vec3(0.0, uTime * 0.16, 0.0));
  float n2 = snoise3(p * uFreq * 2.03 + vec3(uTime * 0.11, 0.0, 4.7));
  return n * 0.72 + n2 * 0.28;
}

vec3 displace(vec3 p){
  return p * (1.0 + uAmp * field(p));
}

// Any vector not parallel to n, for building a tangent frame.
vec3 orthoTo(vec3 n){
  return abs(n.x) > abs(n.z) ? vec3(-n.y, n.x, 0.0) : vec3(0.0, -n.z, n.y);
}

void main(){
  vec3 n  = normalize(normal);
  vec3 t1 = normalize(orthoTo(n));
  vec3 t2 = normalize(cross(n, t1));

  // Recompute the normal from the displaced surface, or lighting
  // rides the original sphere and the form looks flat.
  float e  = 0.035;
  vec3  p0 = displace(position);
  vec3  p1 = displace(position + t1 * e);
  vec3  p2 = displace(position + t2 * e);

  vNormal = normalize(normalMatrix * normalize(cross(p1 - p0, p2 - p0)));
  vDisp   = length(p0) - 1.0;

  vec4 mv = modelViewMatrix * vec4(p0, 1.0);
  vView   = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

var FRAG = /* glsl */ `
uniform vec3  uBg;
uniform vec3  uDeep;
uniform vec3  uAccent;
uniform float uProgress;

varying vec3  vNormal;
varying vec3  vView;
varying float vDisp;

void main(){
  vec3 n = normalize(vNormal);

  // Body stays essentially background — the form is read as a
  // silhouette, not as a lit orange mass.
  vec3 col = mix(uBg, uDeep * 0.3, smoothstep(-0.3, 0.4, vDisp));

  // Single key light, high and to the right of the viewer. Tight
  // exponent so only the crests catch it.
  float key = max(dot(n, normalize(vec3(0.45, 0.78, 0.55))), 0.0);
  col += uAccent * pow(key, 6.0) * 0.10;

  // Fresnel rim — the only loud element, and it lives on the edge.
  float fres = pow(1.0 - max(dot(n, normalize(vView)), 0.0), 3.4);
  /* Kept below the body text in luminance — copy passes over the
     form and stays readable. */
  col += uAccent * fres * (0.45 + 0.22 * uProgress);

  gl_FragColor = vec4(col, 1.0);
}
`;

export function createBlob(state) {
  /* detail 3 (1280 tris) low → 5 (20480 tris) high */
  var detail = Math.round(3 + state.quality * 2);

  var uniforms = {
    uTime: { value: 0 },
    uAmp: { value: 0.18 },
    uFreq: { value: 1.35 },
    uProgress: { value: 0 },
    uBg: { value: PALETTE.bg },
    uDeep: { value: ACCENT_DEEP },
    uAccent: { value: PALETTE.accent },
  };

  var mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1, detail),
    new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: uniforms,
      precision: "mediump",
    })
  );

  var scene = new THREE.Scene();
  scene.add(mesh);

  var FOV = 38;
  var REST_Z = 5.2;
  var camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 0, REST_Z);

  /* Half-extents of the frame at z=0, in world units. Placing the
     form as a fraction of these keeps the same composition on a
     13" laptop and a 32" display — world coordinates alone do not. */
  function halfExtents(aspect) {
    var h = Math.tan((FOV * Math.PI) / 360) * REST_Z;
    return { h: h, w: h * aspect };
  }

  /* Held at the right edge, partly outside the frame, so it never
     sits behind the body copy. Centred and low once the layout
     stacks and the copy moves below the portrait. */
  var wide = true;

  return {
    scene: scene,
    camera: camera,

    resize: function (s) {
      camera.aspect = s.size.x / s.size.y;
      camera.updateProjectionMatrix();

      /* 901px is where the hero pin turns on in theme.css — keep the
         two breakpoints identical or the composition desyncs. */
      wide = s.size.x >= 901;
      var f = halfExtents(camera.aspect);

      /* Wide: held just off the right edge, clear of the copy.
         Narrow: dropped to the bottom-right, below the text block. */
      mesh.position.x = f.w * (wide ? 0.74 : 0.95);
      mesh.position.y = wide ? 0.05 : -f.h * 0.78;
      mesh.scale.setScalar(wide ? 0.92 : 0.46);
    },

    update: function (s) {
      var p = s.progress;

      uniforms.uTime.value = s.time;
      uniforms.uProgress.value = p;
      /* Calm at rest, unruly as you scroll through the hero. */
      uniforms.uAmp.value = 0.21 + p * 0.24;
      uniforms.uFreq.value = 1.05 + p * 1.25;

      /* Continuous slow spin + pointer parallax tilt. */
      mesh.rotation.y = s.time * 0.075 + s.pointer.x * 0.22;
      mesh.rotation.x = Math.sin(s.time * 0.11) * 0.14 - s.pointer.y * 0.16;

      /* Dolly in while tracking away from the form, so it swells and
         drifts further off the right edge rather than sliding across
         the copy. Camera always looks straight ahead. */
      camera.position.z = 5.2 - p * 1.0;
      camera.position.x = -p * 0.55;
      camera.position.y = -p * 0.35;
      camera.lookAt(camera.position.x, camera.position.y, 0);
    },

    dispose: function () {
      mesh.geometry.dispose();
      mesh.material.dispose();
    },
  };
}
