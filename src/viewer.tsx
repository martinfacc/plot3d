// components/Viewer.tsx
import { useEffect, useRef } from "react";
import * as THREE from "three";
import JSON5 from "json5";
import { OrbitControls } from "./orbit-controls";

function crearEtiqueta(texto: string, color: string) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo obtener el contexto del canvas");

  canvas.width = 256;
  canvas.height = 64;
  ctx.fillStyle = color;
  ctx.font = "48px sans-serif";
  ctx.fillText(texto, 10, 50);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(1.5, 0.5, 1);
  return sprite;
}

export default function Viewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null); // Ref para acceder a la escena desde fuera del useEffect

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xeeeeee);

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    if (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    const etiquetaX = crearEtiqueta("X", "#ff0000");
    etiquetaX.position.set(6, 0, 0);
    scene.add(etiquetaX);

    const etiquetaY = crearEtiqueta("Y", "#00ff00");
    etiquetaY.position.set(0, 6, 0);
    scene.add(etiquetaY);

    const etiquetaZ = crearEtiqueta("Z", "#0000ff");
    etiquetaZ.position.set(0, 0, 6);
    scene.add(etiquetaZ);

    let isMounted = true;
    function animate() {
      if (!isMounted) return;
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    };
    window.addEventListener("resize", handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  const handlePasteAndRender = async () => {
    try {
      const text = await navigator.clipboard.readText();
      let parsed: any;

      // Intento 1: JSON estándar
      try {
        return JSON.parse(text);
      } catch (e1) {
        // Intento 2: JSON relajado con JSON5
        try {
          parsed = JSON5.parse(text);
        } catch (e2) {
          throw new Error(
            "No se pudo parsear el texto del portapapeles como JSON."
          );
        }
      }

      if (
        Array.isArray(parsed) &&
        parsed.every(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            typeof item.x === "number" &&
            typeof item.y === "number" &&
            typeof item.z === "number"
        )
      ) {
        const spheres = parsed.map((pos) => {
          const sphereGeom = new THREE.SphereGeometry(0.2, 16, 16);
          const sphereMat = new THREE.MeshStandardMaterial({ color: 0x0077ff });
          const sphere = new THREE.Mesh(sphereGeom, sphereMat);
          sphere.position.set(pos.x, pos.y, pos.z);
          return sphere;
        });

        if (sceneRef.current) {
          spheres.forEach((s) => sceneRef.current!.add(s));
        }
      } else {
        alert(
          "El contenido del portapapeles no es válido. Debe ser un array de objetos con claves x, y, z numéricas."
        );
      }
    } catch (err) {
      alert("Error al leer o parsear el portapapeles.");
      console.error(err);
    }
  };

  return (
    <>
      <button
        onClick={handlePasteAndRender}
        style={{
          position: "absolute",
          top: 20,
          left: "50%",
          zIndex: 10,
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#4F46E5", // Indigo-600
          color: "white",
          border: "none",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
          cursor: "pointer",
        }}
      >
        Pegar y mostrar esferas
      </button>

      <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />
    </>
  );
}
