import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

export function initAnimation(containerId) {
    const container = document.getElementById(containerId);
    const clock = new THREE.Clock();

    // Create GUI and append to container to keep it local to the animation view if possible,
    // but lil-gui defaults to fixed position. We'll leave it as default for now.
    const gui = new GUI();
    // Ensure GUI is cleaned up if we were to navigate away (not strictly necessary for multi-page)
    
    const params = {
        f: 0.1,
        alpha: 90,
        R: 3,
        e: 1,
        h: 3,
        p: 0.4,
        Rext: 5,
        Nr: 1,
        Ns: 1,
        amplitude: 2,
        NVecteurs: 32,
        afficherBs: true,
        afficherBr: true,
    };

    gui.add(params, 'f', 0, 1);
    gui.add(params, 'alpha', -180, 180);

    container.appendChild(gui.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    // Calculate height based on aspect ratio (e.g., 16:9) to ensure visibility
    const aspect = 16 / 9;
    const width = container.clientWidth;
    const height = width / aspect;
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    function createVecteurs(N, decalage, couleur) {
        const result = [];
        for (let i = 0; i < N; i++) {
            const theta = i * 2 * Math.PI / N + decalage;
            const dir = new THREE.Vector3(Math.cos(theta), Math.sin(theta), 0);
            dir.normalize();
            const origin = new THREE.Vector3((params.R + params.e / 2) * Math.cos(theta), (params.R + params.e / 2) * Math.sin(theta), 0);
            const fleche = new THREE.ArrowHelper(dir, origin, 1, couleur);
            fleche.originalDir = dir;
            
            // Accessing cone geometry might differ in versions, but assuming standard three.js behavior
            if (fleche.cone && fleche.cone.geometry) {
                fleche.cone.geometry.dispose();
                fleche.cone.geometry = new THREE.ConeGeometry(3, 1.5, 32);
                fleche.cone.geometry.translate(0, -0.5, 0);
            }

            result.push(fleche);
            scene.add(result.at(-1));
        }
        return result;
    }

    const COULEUR_BS = 0x00aa00;
    const COULEUR_BR = 0xff8800;

    const Bs = createVecteurs(params.NVecteurs, 0, COULEUR_BS);
    const Br = createVecteurs(params.NVecteurs, 0, COULEUR_BR);

    function setVisibility(listeVecteurs, visible) {
        listeVecteurs.forEach(element => { element.visible = visible; });
    }

    gui.add(params, 'afficherBs').name('Champ stator').onChange(valeur => setVisibility(Bs, valeur));
    gui.add(params, 'afficherBr').name('Champ rotor').onChange(valeur => setVisibility(Br, valeur));

    // Légende
    const legendDiv = document.createElement('div');
    legendDiv.style.position = 'absolute';
    legendDiv.style.top = '10px';
    legendDiv.style.left = '10px';
    legendDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    legendDiv.style.padding = '10px';
    legendDiv.style.borderRadius = '5px';
    legendDiv.style.fontFamily = 'sans-serif';
    legendDiv.style.fontSize = '14px';
    legendDiv.style.pointerEvents = 'none';
    legendDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';

    const itemBs = document.createElement('div');
    itemBs.style.display = 'flex';
    itemBs.style.alignItems = 'center';
    itemBs.style.marginBottom = '5px';
    const colorBs = document.createElement('span');
    colorBs.style.width = '15px';
    colorBs.style.height = '15px';
    colorBs.style.backgroundColor = '#00aa00';
    colorBs.style.marginRight = '8px';
    colorBs.style.borderRadius = '3px';
    colorBs.style.display = 'inline-block';
    itemBs.appendChild(colorBs);
    itemBs.appendChild(document.createTextNode('Champ stator (Bs)'));

    const itemBr = document.createElement('div');
    itemBr.style.display = 'flex';
    itemBr.style.alignItems = 'center';
    const colorBr = document.createElement('span');
    colorBr.style.width = '15px';
    colorBr.style.height = '15px';
    colorBr.style.backgroundColor = '#ff8800';
    colorBr.style.marginRight = '8px';
    colorBr.style.borderRadius = '3px';
    colorBr.style.display = 'inline-block';
    itemBr.appendChild(colorBr);
    itemBr.appendChild(document.createTextNode('Champ rotor (Br)'));

    legendDiv.appendChild(itemBs);
    legendDiv.appendChild(itemBr);
    container.style.position = 'relative'; // Ensure container is positioned
    container.appendChild(legendDiv);

    function rotorGeometry(R, h, p, Nr) {
        const shape = new THREE.Shape();
        shape.moveTo(0, R - p);
        for (let i = 0; i < 2 * Nr; i++) {
            shape.absarc(0, 0, R - p, Math.PI / 2 + 2 * Math.PI / (2 * Nr) * i, Math.PI / 2 + 2 * Math.PI / (2 * Nr) * i + p / (2 * (R - p)));
            shape.lineTo(R * Math.cos(Math.PI / 2 + 2 * Math.PI / (2 * Nr) * i + p / (2 * (R - p))), R * Math.sin(Math.PI / 2 + 2 * Math.PI / (2 * Nr) * i + p / (2 * (R - p))));
            shape.absarc(0, 0, R, Math.PI / 2 + 2 * Math.PI / (2 * Nr) * i + p / (2 * (R - p)), Math.PI / 2 + 2 * Math.PI / (2 * Nr) * (i + 1) - p / (2 * (R - p)));
            shape.lineTo((R - p) * Math.cos(Math.PI / 2 + 2 * Math.PI / (2 * Nr) * (i + 1) - p / (2 * (R - p))), (R - p) * Math.sin(Math.PI / 2 + 2 * Math.PI / (2 * Nr) * (i + 1) - p / (2 * (R - p))));
            shape.absarc(0, 0, R - p, Math.PI / 2 + 2 * Math.PI / (2 * Nr) * (i + 1), Math.PI / 2 + 2 * Math.PI / (2 * Nr) * (i + 1) + p / (2 * (R - p)));
        }
        return new THREE.ExtrudeGeometry(shape, { depth: h, curveSegments: 40 });
    }

    function statorGeometry(R, e, h, p, Ns, Rext) {
        const hole = new THREE.Shape();
        hole.moveTo(0, R + p);
        for (let i = 0; i < 4 * Ns; i++) {
            hole.absarc(0, 0, R + e + p, Math.PI / 2 + 2 * Math.PI / (4 * Ns) * i, Math.PI / 2 + 2 * Math.PI / (4 * Ns) * i + p / (2 * (R - p)));
            hole.lineTo((R + e) * Math.cos(Math.PI / 2 + 2 * Math.PI / (4 * Ns) * i + p / (2 * (R - p))), (R + e) * Math.sin(Math.PI / 2 + 2 * Math.PI / (4 * Ns) * i + p / (2 * (R - p))));
            hole.absarc(0, 0, R + e, Math.PI / 2 + 2 * Math.PI / (4 * Ns) * i + p / (2 * (R - p)), Math.PI / 2 + 2 * Math.PI / (4 * Ns) * (i + 1) - p / (2 * (R - p)));
            hole.lineTo((R + e + p) * Math.cos(Math.PI / 2 + 2 * Math.PI / (4 * Ns) * (i + 1) - p / (2 * (R - p))), (R + e + p) * Math.sin(Math.PI / 2 + 2 * Math.PI / (4 * Ns) * (i + 1) - p / (2 * (R - p))));
            hole.absarc(0, 0, R + e + p, Math.PI / 2 + 2 * Math.PI / (4 * Ns) * (i + 1), Math.PI / 2 + 2 * Math.PI / (4 * Ns) * (i + 1) + p / (2 * (R - p)));
        }
        const shape = new THREE.Shape();
        shape.moveTo(0, Rext);
        shape.absarc(0, 0, Rext, 0, 2 * Math.PI);
        shape.holes.push(hole);
        return new THREE.ExtrudeGeometry(shape, { depth: h, curveSegments: 100 });
    }

    const material = new THREE.MeshStandardMaterial({ color: 0x3582fd, roughness: 1, metalness: 0.5 });

    const rotor = new THREE.Mesh(rotorGeometry(params.R, params.h, params.p, params.Nr), material);
    rotor.translateZ(-3.5);
    scene.add(rotor);

    const stator = new THREE.Mesh(statorGeometry(params.R, params.e, params.h, params.p, params.Ns, params.Rext), material);
    stator.translateZ(-3.5);
    scene.add(stator);

    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(0, 10, 10);
    light.target.position.set(0, 0, 0);
    scene.add(light);
    scene.add(light.target);

    const ambiantLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambiantLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);

    let t = 0;

    function animate() {
        requestAnimationFrame(animate);

        const dt = clock.getDelta() * params.f;
        t += dt;
        const omega = 2 * Math.PI;

        Bs.forEach((fleche, index) => {
            const theta = index * 2 * Math.PI / params.NVecteurs;
            const x = params.amplitude * Math.cos(theta - omega * t);
            if (x < 0) {
                const xDir = fleche.originalDir.clone();
                xDir.negate();
                fleche.setDirection(xDir);
            } else {
                fleche.setDirection(fleche.originalDir);
            }
            fleche.setLength(Math.abs(x));
        });

        Br.forEach((fleche, index) => {
            const theta = index * 2 * Math.PI / params.NVecteurs;
            const x = params.amplitude * Math.cos(theta - omega * t + params.alpha * Math.PI / 180);
            if (x < 0) {
                const xDir = fleche.originalDir.clone();
                xDir.negate();
                fleche.setDirection(xDir);
            } else {
                fleche.setDirection(fleche.originalDir);
            }
            fleche.setLength(Math.abs(x));
        });

        rotor.quaternion.identity();
        rotor.rotateZ(t * omega - params.alpha * Math.PI / 180);

        controls.update();

        renderer.render(scene, camera);
    }

    animate();

    const resizeObserver = new ResizeObserver(() => {
        const width = container.clientWidth;
        const height = width / aspect;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
    resizeObserver.observe(container);
}
