/*!
 * Cinematic WebGL fluid-gradient background
 * Simplex noise + domain warping + mouse interaction
 */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ─── Vertex shader ────────────────────────────────────────────
  var VERT = [
    'attribute vec2 a_pos;',
    'void main(){gl_Position=vec4(a_pos,0.0,1.0);}'
  ].join('\n');

  // ─── Fragment shader ──────────────────────────────────────────
  var FRAG = [
    'precision mediump float;',
    'uniform vec2  u_res;',
    'uniform float u_time;',
    'uniform vec2  u_mouse;', // smoothed, –1..1

    // Simplex 2-D (Stefan Gustavson / IQ)
    'vec3 _p(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);}',
    'float sn(vec2 v){',
    '  const vec4 C=vec4(0.211324865405187,0.366025403784439,',
    '                   -0.577350269189626,0.024390243902439);',
    '  vec2 i=floor(v+dot(v,C.yy));',
    '  vec2 x0=v-i+dot(i,C.xx);',
    '  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);',
    '  vec4 x12=x0.xyxy+C.xxzz;',
    '  x12.xy-=i1;',
    '  i=mod(i,289.0);',
    '  vec3 p=_p(_p(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));',
    '  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);',
    '  m=m*m;m=m*m;',
    '  vec3 x=2.0*fract(p*C.www)-1.0;',
    '  vec3 h=abs(x)-0.5;',
    '  vec3 a0=x-floor(x+0.5);',
    '  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);',
    '  vec3 g;',
    '  g.x =a0.x *x0.x +h.x *x0.y;',
    '  g.yz=a0.yz*x12.xz+h.yz*x12.yw;',
    '  return 130.0*dot(m,g);',
    '}',

    // 2-octave FBM with rotation for detail variation
    'mat2 _rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}',
    'float fbm(vec2 p){',
    '  float v=0.0,a=0.52;',
    '  mat2 R=_rot(0.5);',
    '  for(int i=0;i<2;i++){v+=a*sn(p);p=R*p*2.1+vec2(17.8,43.2);a*=0.48;}',
    '  return v;',
    '}',

    'void main(){',
    '  vec2 uv=gl_FragCoord.xy/u_res;',
    '  uv.y=1.0-uv.y;',           // flip: y=0 at top

    '  float t=u_time*0.095;',    // slow, dreamlike pace

    // Domain-warp chain: uv → q → r → f
    // Adds organic, ever-morphing fluid character
    '  vec2 mo=u_mouse*0.055;',
    '  vec2 q=vec2(',
    '    fbm(uv*2.1+vec2(0.0,0.0)+mo+t*1.1),',
    '    fbm(uv*2.1+vec2(5.2,1.3)+mo+t*1.0)',
    '  );',
    '  vec2 r=vec2(',
    '    fbm(uv*2.1+1.6*q+vec2(1.7,9.2)+mo*1.3+t*0.8),',
    '    fbm(uv*2.1+1.6*q+vec2(8.3,2.8)+t*0.75)',
    '  );',
    '  float f=0.5+0.5*fbm(uv*1.5+2.2*r+t*0.6);',

    // Secondary layer — different frequency for richer transitions
    '  float f2=0.5+0.5*sn(uv*3.2+vec2(-t*1.3,t*0.9)+u_mouse*0.045);',

    // Gaussian mouse proximity glow
    '  vec2 mp=u_mouse*0.5+0.5;',
    '  float md=length(uv-mp);',
    '  float mg=exp(-md*md*5.8);',

    // ── Palette ──────────────────────────────────────
    // deep black, rich violet, electric cobalt, hot magenta, arctic teal
    '  vec3 bk=vec3(0.043,0.043,0.047);',  // #0B0B0C  site bg
    '  vec3 vi=vec3(0.165,0.043,0.545);',  // deep violet
    '  vec3 co=vec3(0.063,0.176,0.706);',  // cobalt blue
    '  vec3 mg2=vec3(0.773,0.051,0.416);', // hot magenta
    '  vec3 te=vec3(0.031,0.569,0.788);',  // arctic teal

    '  vec3 col=bk;',
    '  col=mix(col,vi, smoothstep(0.28,0.62,f )*0.92);',
    '  col=mix(col,co, smoothstep(0.40,0.70,f2)*0.78);',
    '  col=mix(col,mg2,smoothstep(0.54,0.84,f )*0.56);',
    '  col=mix(col,te, smoothstep(0.60,0.88,f2)*0.42);',

    // Mouse glow — violet point light at cursor
    '  col+=vec3(0.22,0.06,0.58)*mg*0.48;',

    // Radial vignette — focus brightness at upper-centre (hero title zone)
    '  vec2 fc=vec2(0.5,0.18);',
    '  float rd=1.0-smoothstep(0.0,1.05,length((uv-fc)*vec2(1.15,1.85)));',
    '  col*=rd*rd*0.88+0.06;',

    // Vertical fade — pure black at top edge (behind header) and bottom
    '  float vf=smoothstep(0.0,0.065,uv.y)*smoothstep(1.0,0.76,uv.y);',
    '  col*=vf;',

    '  gl_FragColor=vec4(col,1.0);',
    '}'
  ].join('\n');

  // ─── Helpers ─────────────────────────────────────────────────
  function mkShader(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[shader-bg]', gl.getShaderInfoLog(s));
      gl.deleteShader(s); return null;
    }
    return s;
  }

  // ─── Init ────────────────────────────────────────────────────
  function init() {
    var canvas = document.createElement('canvas');
    canvas.id = 'shader-bg';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText =
      'position:fixed;inset:0;width:100%;height:100%;' +
      'z-index:-1;pointer-events:none;display:block;';
    document.body.insertBefore(canvas, document.body.firstChild);

    var gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false }) ||
             canvas.getContext('experimental-webgl', { antialias: false, alpha: false, depth: false });
    if (!gl) { canvas.remove(); return; }

    var vs = mkShader(gl, gl.VERTEX_SHADER,   VERT);
    var fs = mkShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { canvas.remove(); return; }

    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('[shader-bg]', gl.getProgramInfoLog(prog));
      canvas.remove(); return;
    }
    gl.useProgram(prog);

    // Full-screen quad (two triangles)
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),
      gl.STATIC_DRAW);
    var aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    var uRes   = gl.getUniformLocation(prog, 'u_res');
    var uTime  = gl.getUniformLocation(prog, 'u_time');
    var uMouse = gl.getUniformLocation(prog, 'u_mouse');

    // Target and smoothed mouse in –1..1 space
    var tx = 0, ty = 0, sx = 0, sy = 0;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var w   = Math.min(Math.round(window.innerWidth  * dpr), 2560);
      var h   = Math.min(Math.round(window.innerHeight * dpr), 1600);
      canvas.width  = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }

    window.addEventListener('resize', resize, { passive: true });

    window.addEventListener('mousemove', function (e) {
      tx =  (e.clientX / window.innerWidth)  * 2.0 - 1.0;
      ty = -(e.clientY / window.innerHeight) * 2.0 + 1.0; // y-up
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
      var t = e.touches[0];
      tx =  (t.clientX / window.innerWidth)  * 2.0 - 1.0;
      ty = -(t.clientY / window.innerHeight) * 2.0 + 1.0;
    }, { passive: true });

    resize();

    var t0 = performance.now();
    var elapsed = 0;
    var raf;

    function frame(now) {
      elapsed = (now - t0) * 0.001;

      // Exponential smooth — slow enough to feel weighty
      sx += (tx - sx) * 0.032;
      sy += (ty - sy) * 0.032;

      gl.uniform2f(uRes,   canvas.width, canvas.height);
      gl.uniform1f(uTime,  elapsed);
      gl.uniform2f(uMouse, sx, sy);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      raf = requestAnimationFrame(frame);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        t0 = performance.now() - elapsed * 1000;
        raf = requestAnimationFrame(frame);
      }
    });

    raf = requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
