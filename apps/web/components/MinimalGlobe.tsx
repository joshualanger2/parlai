'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function MinimalGlobe() {
    const mountRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.z = 10;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        renderer.setSize(
            mountRef.current.clientWidth,
            mountRef.current.clientHeight
        );
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0);
        mountRef.current.appendChild(renderer.domElement);

        // === Orbit Controls for drag-to-rotate ===
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = false;
        controls.rotateSpeed = 0.3;

        // === Lighting ===
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(5, 3, 5);
        scene.add(directionalLight);

        // === Globe Group ===
        const globeGroup = new THREE.Group();
        scene.add(globeGroup);

        // Glow
        const glow = new THREE.Mesh(
            new THREE.SphereGeometry(5.1, 64, 64),
            new THREE.MeshBasicMaterial({
                color: new THREE.Color('lightblue'),
                transparent: true,
                opacity: 0.15
            })
        );
        globeGroup.add(glow);

        // Outer white globe
        const globe = new THREE.Mesh(
            new THREE.SphereGeometry(5, 64, 64),
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.85,
                roughness: 1,
                metalness: 0
            })
        );
        globeGroup.add(globe);

        // Inner blur shell to soften far side
        const innerShadow = new THREE.Mesh(
            new THREE.SphereGeometry(4.95, 64, 64),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.4,
                side: THREE.BackSide,
                depthWrite: false
            })
        );
        globeGroup.add(innerShadow);

        // Load and render GeoJSON outline
        fetch('/custom.geo.json')
            .then(res => res.json())
            .then(geojson => {
                geojson.features.forEach((feature: any) => {
                    const geometry = feature.geometry;
                    const coords =
                        geometry.type === 'Polygon'
                            ? [geometry.coordinates]
                            : geometry.coordinates;

                    coords.forEach((polygon: any[][]) => {
                        polygon.forEach((ring: any[]) => {
                            const points: THREE.Vector3[] = ring.map(
                                ([lng, lat]: [number, number]) => {
                                    const { x, y, z } = latLngToSphereCoords(
                                        lat,
                                        lng,
                                        5.02
                                    );
                                    return new THREE.Vector3(x, y, z);
                                }
                            );

                            const lineGeometry =
                                new THREE.BufferGeometry().setFromPoints(
                                    points
                                );
                            const lineMaterial = new THREE.LineBasicMaterial({
                                color: 0x000000
                            });
                            const line = new THREE.Line(
                                lineGeometry,
                                lineMaterial
                            );
                            globeGroup.add(line);
                        });
                    });
                });
            });

        // Animate
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Resize Handling
        const handleResize = () => {
            if (!mountRef.current) return;
            const { clientWidth, clientHeight } = mountRef.current;
            renderer.setSize(clientWidth, clientHeight);
            camera.aspect = clientWidth / clientHeight;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            mountRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div
            ref={mountRef}
            style={{
                width: '100vw',
                height: '100vh',
                background: 'white',
                overflow: 'hidden'
            }}
        />
    );
}

function latLngToSphereCoords(lat: number, lng: number, radius: number) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = -(lng + 180) * (Math.PI / 180); // flipped for correct orientation

    return {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.cos(phi),
        z: radius * Math.sin(phi) * Math.sin(theta)
    };
}
