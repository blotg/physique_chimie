/**
 * Utilitaires réutilisables pour les animations Three.js
 */

import * as THREE from 'three';

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

/**
 * Crée un axe avec flèche et label
 */
export function createAxisWithArrow(scene, direction, length, color, labelText) {
    const end = new THREE.Vector3().copy(direction).multiplyScalar(length);
    
    // Ligne de l'axe
    const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        end
    ]);
    const material = new THREE.LineBasicMaterial({ color });
    const axis = new THREE.Line(geometry, material);
    scene.add(axis);
    
    // Flèche
    const arrow = new THREE.ConeGeometry(0.1, 0.3, 8);
    const arrowMesh = new THREE.Mesh(arrow, new THREE.MeshBasicMaterial({ color }));
    arrowMesh.position.copy(end);
    
    // Orienter la flèche selon la direction
    if (direction.x !== 0) {
        arrowMesh.rotation.z = -Math.PI / 2;
    } else if (direction.z !== 0) {
        arrowMesh.rotation.x = Math.PI / 2;
    }
    scene.add(arrowMesh);
    
    // Label
    const label = createTextLabel(labelText, color);
    const labelPos = new THREE.Vector3().copy(direction).multiplyScalar(length + 0.5);
    label.position.copy(labelPos);
    scene.add(label);
}

/**
 * Crée le repère orthonormé (axes X, Y, Z)
 */
export function createCoordinateSystem(scene, length = 5) {
    createAxisWithArrow(scene, new THREE.Vector3(1, 0, 0), length, 0x000000, 'x');
    createAxisWithArrow(scene, new THREE.Vector3(0, 1, 0), length, 0x000000, 'y');
    createAxisWithArrow(scene, new THREE.Vector3(0, 0, 1), length, 0x000000, 'z');
}

/**
 * Crée une caméra orthographique avec Z vers le haut
 */
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

/**
 * Met à jour une caméra orthographique lors du redimensionnement
 */
export function resizeOrthographicCamera(camera, width, height, frustumSize = 10) {
    const aspect = width / height;
    camera.left = frustumSize * aspect / -2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize * 1.3 / 2;
    camera.bottom = frustumSize * 0.7 / -2;
    camera.updateProjectionMatrix();
}

export function resize(renderer, camera, containerId) {
    const aspect = 4/3;
    const container = document.getElementById(containerId);
    const width = container.clientWidth;
    const height = width/aspect;
    container.height = height;

    renderer.setSize(width, height);
    resizeOrthographicCamera(camera, width, height);
}