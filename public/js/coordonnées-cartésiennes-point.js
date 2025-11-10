/**
 * Animation 1 : Point dans l'espace 3D
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { createTextLabel, createCoordinateSystem, createOrthographicCamera, resize } from './utils.js';

export function initPointAnimation(containerId) {
    // Scène
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Caméra
    const camera = createOrthographicCamera(600, 400);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    document.getElementById(containerId).appendChild(renderer.domElement);

    resize(renderer, camera, containerId);

    // Contrôles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Améliorer pour mobile
    controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
    };
    controls.enableZoom = true;
    controls.enablePan = true;

    // Repère
    createCoordinateSystem(scene);

    // Point noir
    const pointGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const point = new THREE.Mesh(pointGeometry, pointMaterial);
    scene.add(point);

    // Label M
    const pointLabel = createTextLabel('M', '#000000');
    scene.add(pointLabel);

    // Flèches au point M dans les 3 directions
    const arrowLength = 0.8;
    const arrowHeadLength = 0.2;
    const arrowHeadWidth = 0.15;
    
    // Flèche dans la direction X (rouge)
    const arrowX = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0), // direction
        new THREE.Vector3(0, 0, 0), // origine (sera mise à jour)
        arrowLength,
        0x000000,
        arrowHeadLength,
        arrowHeadWidth
    );
    scene.add(arrowX);

    // Flèche dans la direction Y (vert)
    const arrowY = new THREE.ArrowHelper(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 0),
        arrowLength,
        0x000000,
        arrowHeadLength,
        arrowHeadWidth
    );
    scene.add(arrowY);

    // Flèche dans la direction Z (bleu)
    const arrowZ = new THREE.ArrowHelper(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, 0),
        arrowLength,
        0x000000,
        arrowHeadLength,
        arrowHeadWidth
    );
    scene.add(arrowZ);

    // Labels pour les flèches (notation vectorielle avec KaTeX)
    const labelEx = createMathLabel('\\vec{e}_x', '#000000', 60);
    scene.add(labelEx);

    const labelEy = createMathLabel('\\vec{e}_y', '#000000', 60);
    scene.add(labelEy);

    const labelEz = createMathLabel('\\vec{e}_z', '#000000', 60);
    scene.add(labelEz);

    // Lignes de projection en pointillés
    const lineMaterial = new THREE.LineDashedMaterial({
        color: 0x666666,
        dashSize: 0.1,
        gapSize: 0.05
    });

    // Ligne vers l'axe X (projection sur plan YZ)
    const lineToX = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
        lineMaterial
    );
    lineToX.computeLineDistances();
    scene.add(lineToX);

    const pointLabelX = createTextLabel('x', '#000000');
    scene.add(pointLabelX);

    // Ligne vers l'axe X (projection sur plan YZ)
    const lineToPlanXY = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
        lineMaterial
    );
    lineToPlanXY.computeLineDistances();
    scene.add(lineToPlanXY);

    // Ligne vers l'axe Y (projection sur plan XZ)
    const lineToY = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
        lineMaterial
    );
    lineToY.computeLineDistances();
    scene.add(lineToY);

    const pointLabelY = createTextLabel('y', '#000000');
    scene.add(pointLabelY);

    // Ligne vers l'axe Z (projection sur plan XY)
    const lineToZ = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
        lineMaterial
    );
    lineToZ.computeLineDistances();
    scene.add(lineToZ);

    const pointLabelZ = createTextLabel('z', '#000000');
    scene.add(pointLabelZ);

    // Paramètres pour lil-gui
    const params = {
        x: 1.0,
        y: 2.0,
        z: 2.0
    };

    // Fonction pour mettre à jour le point
    function updatePoint() {
        point.position.set(params.x, params.y, params.z);
        pointLabel.position.set(params.x, params.y + 0.4, params.z + 0.4);
        pointLabelX.position.set(params.x, -0.3, 0.3);
        pointLabelY.position.set(0, params.y + 0.3, 0.3);
        pointLabelZ.position.set(0.3, -0.3, params.z);

        // Mise à jour des positions des flèches
        arrowX.position.set(params.x, params.y, params.z);
        arrowY.position.set(params.x, params.y, params.z);
        arrowZ.position.set(params.x, params.y, params.z);

        // Mise à jour des positions des labels des flèches
        labelEx.position.set(params.x + arrowLength + 0.4, params.y, params.z);
        labelEy.position.set(params.x, params.y + arrowLength + 0.4, params.z);
        labelEz.position.set(params.x, params.y, params.z + arrowLength + 0.4);

        // Mise à jour des lignes de projection
        // Ligne vers projection sur axe X (de M vers (x, 0, 0))
        lineToX.geometry.setFromPoints([
            new THREE.Vector3(params.x, params.y, 0),
            new THREE.Vector3(params.x, 0, 0)
        ]);
        lineToX.computeLineDistances();

        // Ligne vers projection sur axe Y (de M vers (0, y, 0))
        lineToY.geometry.setFromPoints([
            new THREE.Vector3(params.x, params.y, 0),
            new THREE.Vector3(0, params.y, 0)
        ]);
        lineToY.computeLineDistances();

        // Ligne vers projection sur axe Y (de M vers (0, y, 0))
        lineToPlanXY.geometry.setFromPoints([
            new THREE.Vector3(params.x, params.y, params.z),
            new THREE.Vector3(params.x, params.y, 0)
        ]);
        lineToPlanXY.computeLineDistances();

        // Ligne vers projection sur axe Z (de M vers (0, 0, z))
        lineToZ.geometry.setFromPoints([
            new THREE.Vector3(params.x, params.y, params.z),
            new THREE.Vector3(0, 0, params.z)
        ]);
        lineToZ.computeLineDistances();
    }

    // Création de l'interface GUI
    const gui = new GUI({ title: 'Coordonnées du point M', autoPlace: false });

    const container = document.getElementById(containerId);
    container.style.position = 'relative';

    // Ajouter la GUI directement dans le conteneur du canvas
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.top = '10px';
    gui.domElement.style.right = '10px';
    gui.domElement.style.zIndex = '100';
    container.appendChild(gui.domElement);

    gui.add(params, 'x', -5, 5, 0.1).name('X').onChange(updatePoint);
    gui.add(params, 'y', -5, 5, 0.1).name('Y').onChange(updatePoint);
    gui.add(params, 'z', -5, 5, 0.1).name('Z').onChange(updatePoint);

    // Initialisation
    updatePoint();

    // Boucle d'animation
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // Retourner les objets pour le redimensionnement
    return { 
        camera, 
        renderer,
        resize: () => resize(renderer, camera, containerId)
    };
}
