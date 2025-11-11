/**
 * Utilitaires réutilisables pour les animations Three.js
 */

import * as THREE from 'https://esm.sh/three@0.164.1';
import katex from 'https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.mjs';
import { CSS2DObject, CSS2DRenderer } from 'https://esm.sh/three@0.164.1/examples/jsm/renderers/CSS2DRenderer.js';
import { OrbitControls } from 'https://esm.sh/three@0.164.1/examples/jsm/controls/OrbitControls.js';

// Charger automatiquement le CSS KaTeX
if (typeof document !== 'undefined' && !document.querySelector('link[href*="katex"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
    document.head.appendChild(link);
}



export function createTextLabel(text, color = '#000000') {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 128;

    context.fillStyle = color;
    context.font = '80px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.5, 0.5, 1);

    return sprite;
}

export function createKaTeXLabel(latex, { color = '#000000', fontSize = '20px' } = {}) {
    const div = document.createElement('div');
    div.className = 'math-label';
    div.style.color = color;
    div.style.fontSize = fontSize;
    div.style.whiteSpace = 'nowrap';

    // Rendu KaTeX via module ESM importé ci-dessus
    try {
        katex.render(latex, div, { throwOnError: false, displayMode: false });
    } catch (_e) {
        // Fallback très simple
        div.textContent = latex;
    }

    const obj = new CSS2DObject(div);
    return obj;
}

export function createCoordinateSystem(scene, length = 5) {
    const arrowHeadLength = 0.2;
    const arrowHeadWidth = 0.15;
    const arrowX = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 0, 0),
        length,
        0x000000,
        arrowHeadLength,
        arrowHeadWidth
    );
    scene.add(arrowX);

    const labelX = createKaTeXLabel('x');
    labelX.position.set(length + 0.4, 0, 0);
    scene.add(labelX);

    const arrowY = new THREE.ArrowHelper(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 0),
        length,
        0x000000,
        arrowHeadLength,
        arrowHeadWidth
    );
    scene.add(arrowY);

    const labelY = createKaTeXLabel('y');
    labelY.position.set(0, length + 0.4, 0);
    scene.add(labelY);

    const arrowZ = new THREE.ArrowHelper(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, 0),
        length,
        0x000000,
        arrowHeadLength,
        arrowHeadWidth
    );
    scene.add(arrowZ);

    const labelZ = createKaTeXLabel('z');
    labelZ.position.set(0, 0, length + 0.4);
    scene.add(labelZ);
}


export class Animation {
    constructor(container, aspect = 4 / 3, frustumSize = 10) {
        this.container = container;
        this.aspect = aspect;
        this.frustumSize = frustumSize;
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);

        // Caméra
        this.camera = new THREE.OrthographicCamera(
            -1,// Dummy values, will be resized later
            1,
            1,
            -1,
            0.1,
            1000
        );
        this.camera.position.set(8, 8, 4);
        this.camera.up.set(0, 0, 1); // Z vertical

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.container.appendChild(this.renderer.domElement);

        // Label renderer
        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0';
        this.labelRenderer.domElement.style.left = '0';
        this.labelRenderer.domElement.style.pointerEvents = 'none';
        this.container.appendChild(this.labelRenderer.domElement);

        // Contrôles
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.2;
        // Améliorer pour mobile
        this.controls.touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
        };
        this.controls.enableZoom = true;
        this.controls.enablePan = true;

        new ResizeObserver(() => this.resize()).observe(container);

        this.resize();
    }
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);
    }
    resize() {
        const width = this.container.clientWidth;
        const height = width / this.aspect;
        this.container.height = height;

        this.renderer.setSize(width, height);
        this.labelRenderer.setSize(width, height);

        this.camera.left = this.frustumSize * this.aspect / -2;
        this.camera.right = this.frustumSize * this.aspect / 2;
        this.camera.top = this.frustumSize * 1.3 / 2;
        this.camera.bottom = this.frustumSize * 0.7 / -2;
        this.camera.updateProjectionMatrix();
    }
};