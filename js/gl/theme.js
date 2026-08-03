/* ============================================================
   gl/theme.js — CSS custom properties are the single source of
   truth for colour. Shaders read from here, never hard-code.
   Change --accent in theme.css and the 3D follows.
   ============================================================ */
import * as THREE from "three";

var css = getComputedStyle(document.documentElement);

function token(name, fallback) {
  var v = css.getPropertyValue(name).trim();
  return new THREE.Color(v || fallback);
}

export var PALETTE = {
  bg: token("--bg", "#0B0B0C"),
  surface1: token("--surface-1", "#111113"),
  surface3: token("--surface-3", "#1F1F22"),
  accent: token("--accent", "#E0A458"),
  text: token("--text", "#F3F2EF"),
};

/** accent, pushed cooler/darker — used for the far side of gradients */
export var ACCENT_DEEP = PALETTE.accent.clone().multiplyScalar(0.32);
