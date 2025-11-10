/**
 * Animation 2 : Cube paramétrable
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { createCoordinateSystem, createOrthographicCamera, resize } from './utils.js';

export function initCubeAnimation(containerId) {
    // Scène
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = createOrthographicCamera();

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    document.getElementById(containerId).appendChild(renderer.domElement);

    resize(renderer, camera, containerId);

    // Contrôles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Repère
    createCoordinateSystem(scene);

    // Lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Cube
    let cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshPhongMaterial({
        color: 0x667eea,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    scene.add(cube);

    // Arêtes du cube
    let edgesGeometry = new THREE.EdgesGeometry(cubeGeometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const cubeEdges = new THREE.LineSegments(edgesGeometry, edgeMaterial);
    scene.add(cubeEdges);

    // Paramètres pour lil-gui
    const params = {
        x: 1.0,
        y: 3.0,
        z: 2.0,
        dx: 1.0,
        dy: 1.0,
        dz: 1.0
    };

    // Fonction de mise à jour
    function updateCube() {
        // Recréer la géométrie
        scene.remove(cube);
        scene.remove(cubeEdges);

        cubeGeometry = new THREE.BoxGeometry(params.dx, params.dy, params.dz);
        cube.geometry.dispose();
        cube.geometry = cubeGeometry;
        scene.add(cube);

        edgesGeometry = new THREE.EdgesGeometry(cubeGeometry);
        cubeEdges.geometry.dispose();
        cubeEdges.geometry = edgesGeometry;
        scene.add(cubeEdges);

        // Positionner (x,y,z = coin du cube)
        const centerX = params.x + params.dx / 2;
        const centerY = params.y + params.dy / 2;
        const centerZ = params.z + params.dz / 2;
        cube.position.set(centerX, centerY, centerZ);
        cubeEdges.position.set(centerX, centerY, centerZ);
    }

    // Création de l'interface GUI
    const gui = new GUI({ title: 'Paramètres du cube' });
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.top = '10px';
    gui.domElement.style.right = '10px';
    
    const container = document.getElementById(containerId);
    container.style.position = 'relative';
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

    // Initialisation
    updateCube();

    // Boucle d'animation
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // Retourner les objets pour le redimensionnement
    return { camera, renderer };
}
