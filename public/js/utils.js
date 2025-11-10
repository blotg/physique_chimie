/**
 * Utilitaires réutilisables pour les animations Three.js
 */

import * as THREE from 'three';
import katex from 'https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.mjs';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

/**
 * Crée un sprite de texte pour les labels
 */
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

export function createOrthographicCamera() {
    const camera = new THREE.OrthographicCamera(
        -1,
        1,
        1,
        -1,
        0.1,
        1000
    );
    camera.position.set(8, 8, 4);
    camera.up.set(0, 0, 1); // Z vertical
    return camera;
}

export function resizeOrthographicCamera(camera, width, height, frustumSize = 10) {
    const aspect = width / height;
    camera.left = frustumSize * aspect / -2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize * 1.3 / 2;
    camera.bottom = frustumSize * 0.7 / -2;
    camera.updateProjectionMatrix();
}

export function resize(renderer, camera, containerId, aspect = 4 / 3) {
    const container = document.getElementById(containerId);
    const width = container.clientWidth;
    const height = width / aspect;
    container.height = height;

    renderer.setSize(width, height);
    resizeOrthographicCamera(camera, width, height);
}