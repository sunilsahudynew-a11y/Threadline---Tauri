import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface HeroThreeCanvasProps {
  className?: string;
  interactive?: boolean;
}

export const HeroThreeCanvas: React.FC<HeroThreeCanvasProps> = ({
  className = '',
  interactive = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setIsSupported(false);
        return;
      }
    } catch {
      setIsSupported(false);
      return;
    }

    let animationFrameId: number;
    let width = container.clientWidth || 800;
    let height = container.clientHeight || 450;

    // 1. Scene setup
    const scene = new THREE.Scene();
    // Warm, paper-like fog for deep optical falloff
    scene.fog = new THREE.FogExp2(0xfaf6ee, 0.038);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 14);

    // 3. Renderer with optimal anti-aliasing & device pixel ratio
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0); // transparent background
    container.appendChild(renderer.domElement);

    // 4. Lighting: Soft editorial photographic light
    const ambientLight = new THREE.AmbientLight(0xfffbf2, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e6, 1.8);
    keyLight.position.set(5, 8, 7);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xe08d79, 1.4); // subtle terracotta rim
    rimLight.position.set(-6, -4, -3);
    scene.add(rimLight);

    // 5. Mesh: Floating Undulating Manuscript Ribbon
    const ribbonSegmentsX = 64;
    const ribbonSegmentsY = 24;
    const ribbonGeo = new THREE.PlaneGeometry(16, 5.5, ribbonSegmentsX, ribbonSegmentsY);

    // Save initial vertex coordinates for procedural displacement
    const posAttr = ribbonGeo.attributes.position;
    const originalPositions = new Float32Array(posAttr.array.length);
    for (let i = 0; i < posAttr.array.length; i++) {
      originalPositions[i] = posAttr.array[i];
    }

    // Warm vellum paper material
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0xf6f0e2,
      roughness: 0.72,
      metalness: 0.08,
      side: THREE.DoubleSide,
      flatShading: false
    });

    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbonMesh.rotation.x = -Math.PI * 0.14;
    ribbonMesh.rotation.z = Math.PI * 0.04;
    scene.add(ribbonMesh);

    // Elegant delicate wireframe mesh overlay (like ruled drafting lines)
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0xb54b32,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const wireframeMesh = new THREE.Mesh(ribbonGeo, wireframeMat);
    wireframeMesh.position.z = 0.01;
    ribbonMesh.add(wireframeMesh);

    // 6. Sculptural Accent: Delicate Narrative Orbit Ring & Focal Marker
    const ringGeo = new THREE.TorusGeometry(3.6, 0.02, 16, 120);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xb54b32,
      metalness: 0.6,
      roughness: 0.35,
      transparent: true,
      opacity: 0.65
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI * 0.35;
    ringMesh.rotation.y = Math.PI * 0.15;
    scene.add(ringMesh);

    // Focal bead orbiting the ring
    const beadGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const beadMat = new THREE.MeshStandardMaterial({
      color: 0xb54b32,
      emissive: 0x8a3824,
      emissiveIntensity: 0.6,
      roughness: 0.2
    });
    const beadMesh = new THREE.Mesh(beadGeo, beadMat);
    scene.add(beadMesh);

    // 7. Constellation of Narrative Nodes (Floating Scene Particles)
    const particleCount = 48;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 20;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
      particleSizes[i] = Math.random() * 2.5 + 1.2;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Particle Material
    const particleMat = new THREE.PointsMaterial({
      color: 0xb54b32,
      size: 0.16,
      transparent: true,
      opacity: 0.5,
      blending: THREE.NormalBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 7. Interactive Mouse Coordinates with smooth Damped LERP
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const rect = container.getBoundingClientRect();
      const relX = clientX - rect.left;
      const relY = clientY - rect.top;

      targetMouseX = (relX / rect.width - 0.5) * 2;
      targetMouseY = -(relY / rect.height - 0.5) * 2;
      setIsInteracting(true);
    };

    const handlePointerLeave = () => {
      targetMouseX = 0;
      targetMouseY = 0;
      setIsInteracting(false);
    };

    if (interactive) {
      window.addEventListener('mousemove', handlePointerMove, { passive: true });
      container.addEventListener('mouseleave', handlePointerLeave);
      container.addEventListener('touchmove', handlePointerMove, { passive: true });
      container.addEventListener('touchend', handlePointerLeave);
    }

    // 8. Responsive Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = entry.contentRect.width || 800;
        height = entry.contentRect.height || 450;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    resizeObserver.observe(container);

    // 9. Animation Loop
    let clock = new THREE.Clock();
    let isTabVisible = true;

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isTabVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth damping lerp for mouse interaction
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Dynamic vertex wave animation on manuscript ribbon
      const pos = ribbonGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = originalPositions[i * 3 + 0];
        const v = originalPositions[i * 3 + 1];

        // Complex harmonic wave: primary gentle swell + secondary ripple + mouse influence
        const wave1 = Math.sin(u * 0.45 + elapsedTime * 1.1) * 0.75;
        const wave2 = Math.cos(v * 0.7 + elapsedTime * 0.8) * 0.35;
        const wave3 = Math.sin((u + v) * 0.3 + elapsedTime * 1.5) * 0.2;
        const mouseRipple = Math.sin(u * 0.8 + mouseX * 2.5) * mouseY * 0.4;

        pos.setZ(i, wave1 + wave2 + wave3 + mouseRipple);
      }
      pos.needsUpdate = true;
      ribbonGeo.computeVertexNormals();

      // Subtle scene tilt following mouse
      ribbonMesh.rotation.y = mouseX * 0.25 + Math.sin(elapsedTime * 0.2) * 0.04;
      ribbonMesh.rotation.x = -Math.PI * 0.14 - mouseY * 0.2 + Math.cos(elapsedTime * 0.25) * 0.03;
      ribbonMesh.position.y = Math.sin(elapsedTime * 0.6) * 0.25;

      // Gently rotate particle field
      particleSystem.rotation.y = elapsedTime * 0.03 + mouseX * 0.1;
      particleSystem.rotation.x = elapsedTime * 0.015 - mouseY * 0.1;

      // Animate narrative ring and orbiting focus bead
      ringMesh.rotation.z = elapsedTime * 0.15;
      const beadAngle = elapsedTime * 0.45;
      beadMesh.position.x = Math.cos(beadAngle) * 3.6;
      beadMesh.position.y = Math.sin(beadAngle) * Math.cos(Math.PI * 0.35) * 3.6;
      beadMesh.position.z = Math.sin(beadAngle) * Math.sin(Math.PI * 0.35) * 3.6;

      renderer.render(scene, camera);
    };

    animate();

    // 10. Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (interactive) {
        window.removeEventListener('mousemove', handlePointerMove);
        container.removeEventListener('mouseleave', handlePointerLeave);
        container.removeEventListener('touchmove', handlePointerMove);
        container.removeEventListener('touchend', handlePointerLeave);
      }
      resizeObserver.disconnect();

      // Dispose Three resources cleanly
      ribbonGeo.dispose();
      ribbonMat.dispose();
      wireframeMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      beadGeo.dispose();
      beadMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  if (!isSupported) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <div className="w-48 h-48 rounded-full border border-[#B54B32]/20 bg-[#F1EAD9]/40 animate-pulse" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none cursor-grab active:cursor-grabbing overflow-hidden pointer-events-auto ${className}`}
      aria-hidden="true"
    >
      {/* Subtle interaction cue in corner */}
      <div
        className={`absolute bottom-3 right-4 z-10 pointer-events-none transition-opacity duration-300 ${
          isInteracting ? 'opacity-30' : 'opacity-70'
        }`}
      >
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF6EE]/85 backdrop-blur-xs border border-[rgba(34,30,24,0.12)] text-[10px] font-mono text-[#7A705F]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B54B32] animate-pulse" />
          <span>Interactive 3D narrative wave · move cursor</span>
        </span>
      </div>
    </div>
  );
};
