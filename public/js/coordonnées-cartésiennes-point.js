import * as THREE from 'https://esm.sh/three@0.164.1';
import { GUI } from 'https://esm.sh/three@0.164.1/examples/jsm/libs/lil-gui.module.min.js';
import { createKaTeXLabel, createCoordinateSystem, Animation } from './utils.js';

export function initPointAnimation(containerId) {
    const container = document.getElementById(containerId);
    const animation = new Animation(container);

    // Repère
    createCoordinateSystem(animation.scene);

    // Point noir
    const pointGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const point = new THREE.Mesh(pointGeometry, pointMaterial);
    animation.scene.add(point);

    // Label M
    const pointLabel = createKaTeXLabel('M');
    animation.scene.add(pointLabel);

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
    animation.scene.add(arrowX);

    // Flèche dans la direction Y (vert)
    const arrowY = new THREE.ArrowHelper(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 0),
        arrowLength,
        0x000000,
        arrowHeadLength,
        arrowHeadWidth
    );
    animation.scene.add(arrowY);

    // Flèche dans la direction Z (bleu)
    const arrowZ = new THREE.ArrowHelper(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, 0),
        arrowLength,
        0x000000,
        arrowHeadLength,
        arrowHeadWidth
    );
    animation.scene.add(arrowZ);

    // Labels pour les flèches (KaTeX)
    const labelEx = createKaTeXLabel('\\vec{e}_x');
    animation.scene.add(labelEx);

    const labelEy = createKaTeXLabel('\\vec{e}_y');
    animation.scene.add(labelEy);

    const labelEz = createKaTeXLabel('\\vec{e}_z');
    animation.scene.add(labelEz);

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
    animation.scene.add(lineToX);

    const pointLabelX = createKaTeXLabel('x');
    animation.scene.add(pointLabelX);

    // Ligne vers l'axe X (projection sur plan YZ)
    const lineToPlanXY = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
        lineMaterial
    );
    lineToPlanXY.computeLineDistances();
    animation.scene.add(lineToPlanXY);

    // Ligne vers l'axe Y (projection sur plan XZ)
    const lineToY = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
        lineMaterial
    );
    lineToY.computeLineDistances();
    animation.scene.add(lineToY);

    const pointLabelY = createKaTeXLabel('y');
    animation.scene.add(pointLabelY);

    // Ligne vers l'axe Z (projection sur plan XY)
    const lineToZ = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
        lineMaterial
    );
    lineToZ.computeLineDistances();
    animation.scene.add(lineToZ);

    const pointLabelZ = createKaTeXLabel('z');
    animation.scene.add(pointLabelZ);

    // Création de l'interface GUI
    const gui = new GUI({ title: 'Coordonnées du point M' });
    const params = {
        x: 1.0,
        y: 2.0,
        z: 2.0
    };

    container.appendChild(gui.domElement);

    gui.add(params, 'x', -5, 5, 0.1).name('x').onChange(update);
    gui.add(params, 'y', -5, 5, 0.1).name('y').onChange(update);
    gui.add(params, 'z', -5, 5, 0.1).name('z').onChange(update);

    // Fonction pour mettre à jour
    function update() {
        point.position.set(params.x, params.y, params.z);
        pointLabel.position.set(params.x, params.y + 0.4, params.z + 0.4);
        pointLabelX.position.set(params.x, 0, 0.4);
        pointLabelY.position.set(0, params.y, 0.4);
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
        lineToX.geometry.setFromPoints([
            new THREE.Vector3(params.x, params.y, 0),
            new THREE.Vector3(params.x, 0, 0)
        ]);
        lineToX.computeLineDistances();

        lineToY.geometry.setFromPoints([
            new THREE.Vector3(params.x, params.y, 0),
            new THREE.Vector3(0, params.y, 0)
        ]);
        lineToY.computeLineDistances();

        lineToPlanXY.geometry.setFromPoints([
            new THREE.Vector3(params.x, params.y, params.z),
            new THREE.Vector3(params.x, params.y, 0)
        ]);
        lineToPlanXY.computeLineDistances();

        lineToZ.geometry.setFromPoints([
            new THREE.Vector3(params.x, params.y, params.z),
            new THREE.Vector3(0, 0, params.z)
        ]);
        lineToZ.computeLineDistances();
    }

    // Initialisation
    update();

    animation.animate();
}
