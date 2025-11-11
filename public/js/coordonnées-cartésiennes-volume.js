import * as THREE from 'https://esm.sh/three@0.164.1';
import { GUI } from 'https://esm.sh/three@0.164.1/examples/jsm/libs/lil-gui.module.min.js';
import { createKaTeXLabel, createCoordinateSystem, Animation } from './utils.js';

export function initCubeAnimation(containerId) {
    const container = document.getElementById(containerId);
    const animation = new Animation(container);

    createCoordinateSystem(animation.scene);

    // Cube
    let cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshPhongMaterial({
        color: 0x667eea,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    animation.scene.add(cube);

    // Arêtes du cube
    let edgesGeometry = new THREE.EdgesGeometry(cubeGeometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const cubeEdges = new THREE.LineSegments(edgesGeometry, edgeMaterial);
    animation.scene.add(cubeEdges);

    // Paramètres pour lil-gui
    const params = {
        x: 1.0,
        y: 3.0,
        z: 2.0,
        dx: 1.0,
        dy: 1.0,
        dz: 1.0
    };

    // Création de l'interface GUI
    const gui = new GUI({ title: 'Paramètres du cube' });
    container.appendChild(gui.domElement);

    const positionFolder = gui.addFolder('Position');
    positionFolder.add(params, 'x', -5, 5, 0.1).name('X').onChange(updateCube);
    positionFolder.add(params, 'y', -5, 5, 0.1).name('Y').onChange(updateCube);
    positionFolder.add(params, 'z', -5, 5, 0.1).name('Z').onChange(updateCube);
    positionFolder.open();

    const dimensionsFolder = gui.addFolder('Dimensions');
    dimensionsFolder.add(params, 'dx', 0.1, 5, 0.1).name('dx').onChange(updateCube);
    dimensionsFolder.add(params, 'dy', 0.1, 5, 0.1).name('dy').onChange(updateCube);
    dimensionsFolder.add(params, 'dz', 0.1, 5, 0.1).name('dz').onChange(updateCube);
    dimensionsFolder.open();

    // Fonction de mise à jour
    function updateCube() {
        // Dispose avant de créer
        cube.geometry.dispose();
        cubeEdges.geometry.dispose();
        
        cubeGeometry = new THREE.BoxGeometry(params.dx, params.dy, params.dz);
        edgesGeometry = new THREE.EdgesGeometry(cubeGeometry);
        
        cube.geometry = cubeGeometry;
        cubeEdges.geometry = edgesGeometry;
        
        const centerX = params.x + params.dx / 2;
        const centerY = params.y + params.dy / 2;
        const centerZ = params.z + params.dz / 2;
        cube.position.set(centerX, centerY, centerZ);
        cubeEdges.position.set(centerX, centerY, centerZ);
    }

    // Initialisation
    updateCube();

    // Boucle d'animation
    animation.animate();
    
    return {
        animation,
        dispose: () => {
            gui.destroy();
            animation.dispose();
        }
    };
}
