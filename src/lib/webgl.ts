/**
 * WebGL layer — Three.js, loaded lazily.
 *
 * Three.js is heavy (~150KB gzip), so it must never sit in the boot bundle.
 * Screens that want a 3D moment call `loadThree()` inside an effect; the
 * library downloads only when (and if) that screen renders.
 *
 *   const THREE = await loadThree();
 *   const scene = new THREE.Scene();
 *
 * `supportsWebGL()` lets callers skip the download entirely on devices
 * without GL support and render a static fallback instead.
 */

export async function loadThree() {
  return import('three');
}

export function supportsWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}
