import * as THREE from 'https://esm.sh/three@0.164.1';
import { GUI } from 'https://esm.sh/three@0.164.1/examples/jsm/libs/lil-gui.module.min.js';
import { createKaTeXLabel, createCoordinateSystem, Animation } from './utils.js';

export function initAnimation(containerId) {
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
    const arrowR = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0), // direction
        new THREE.Vector3(0, 0, 0), // origine (sera mise à jour)
        arrowLength,
        0x000000,
        arrowHeadLength,
        arrowHeadWidth
    );
    animation.scene.add(arrowR);

    // Flèche dans la direction Y (vert)
    const arrowTheta = new THREE.ArrowHelper(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 0),
        arrowLength,
        0x000000,
        arrowHeadLength,
        arrowHeadWidth
    );
    animation.scene.add(arrowTheta);

    // Flèche dans la direction Z (bleu)
    const arrowPhi = new THREE.ArrowHelper(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, 0),
        arrowLength,
        0x000000,
        arrowHeadLength,
        arrowHeadWidth
    );
    animation.scene.add(arrowPhi);

    // Labels pour les flèches (KaTeX)
    const labelER = createKaTeXLabel('\\vec{e}_r');
    animation.scene.add(labelER);

    const labelETheta = createKaTeXLabel('\\vec{e}_\\theta');
    animation.scene.add(labelETheta);

    const labelEPhi = createKaTeXLabel('\\vec{e}_\\phi');
    animation.scene.add(labelEPhi);

    // Lignes de projection en pointillés
    const lineMaterial = new THREE.LineDashedMaterial({
        color: 0x666666,
        dashSize: 0.1,
        gapSize: 0.05
    });

    // Ligne vers l'axe X (projection sur plan YZ)
    const lineToOrigin = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
        lineMaterial
    );
    lineToOrigin.computeLineDistances();
    animation.scene.add(lineToOrigin);

    const pointLabelR = createKaTeXLabel('r');
    animation.scene.add(pointLabelR);

    const lineToPlanXY = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
        lineMaterial
    );
    lineToPlanXY.computeLineDistances();
    animation.scene.add(lineToPlanXY);

    const lineToOriginXY = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
        lineMaterial
    );
    lineToOriginXY.computeLineDistances();
    animation.scene.add(lineToOriginXY);


    // Création de l'interface GUI
    const gui = new GUI({ title: 'Coordonnées du point M' });
    const params = {
        r: 4.0,
        theta: 50.0,
        phi: 50.0
    };

    container.appendChild(gui.domElement);

    gui.add(params, 'r', 0.1, 5, 0.1).name('r').onChange(update);
    gui.add(params, 'theta', 0, 180, 0.1).name('θ').onChange(update);
    gui.add(params, 'phi', 0, 360, 0.1).name('φ').onChange(update);

    // Fonction pour mettre à jour
    function update() {
        const x = params.r * Math.sin(THREE.MathUtils.degToRad(params.theta)) * Math.cos(THREE.MathUtils.degToRad(params.phi));
        const y = params.r * Math.sin(THREE.MathUtils.degToRad(params.theta)) * Math.sin(THREE.MathUtils.degToRad(params.phi));
        const z = params.r * Math.cos(THREE.MathUtils.degToRad(params.theta));

        const eR = new THREE.Vector3(x, y, z).normalize();
        const eTheta = new THREE.Vector3(
            Math.cos(THREE.MathUtils.degToRad(params.theta)) * Math.cos(THREE.MathUtils.degToRad(params.phi)),
            Math.cos(THREE.MathUtils.degToRad(params.theta)) * Math.sin(THREE.MathUtils.degToRad(params.phi)),
            -Math.sin(THREE.MathUtils.degToRad(params.theta))
        ).normalize();
        const ePhi = new THREE.Vector3(
            -Math.sin(THREE.MathUtils.degToRad(params.phi)),
            Math.cos(THREE.MathUtils.degToRad(params.phi)),
            0
        ).normalize();

        point.position.set(x, y, z);
        pointLabel.position.set(x, y-0.4, z + 0.4);
        pointLabelR.position.set(x/2+0.1, y/2+0.1, z/2-0.3);

        // Mise à jour des positions des flèches
        arrowR.setDirection(eR);
        arrowR.position.set(x, y, z);
        arrowTheta.setDirection(eTheta);
        arrowTheta.position.set(x, y, z);
        arrowPhi.setDirection(ePhi);
        arrowPhi.position.set(x, y, z);

        // Mise à jour des positions des labels des flèches
        labelER.position.set(x + eR.x*1.2, y + eR.y*1.2, z + eR.z*1.2);
        labelETheta.position.set(x + eTheta.x*1.2, y + eTheta.y*1.2, z + eTheta.z*1.2);
        labelEPhi.position.set(x + ePhi.x*1.2, y + ePhi.y*1.2, z + ePhi.z*1.2);

        // Mise à jour des lignes de projection
        lineToOrigin.geometry.setFromPoints([
            new THREE.Vector3(x, y, z),
            new THREE.Vector3(0, 0, 0)
        ]);
        lineToOrigin.computeLineDistances();

        lineToOriginXY.geometry.setFromPoints([
            new THREE.Vector3(x, y, 0),
            new THREE.Vector3(0, 0, 0)
        ]);
        lineToOriginXY.computeLineDistances();

        lineToPlanXY.geometry.setFromPoints([
            new THREE.Vector3(x, y, z),
            new THREE.Vector3(x, y, 0)
        ]);
        lineToPlanXY.computeLineDistances();
    }

    // Initialisation
    update();

    animation.animate();
}
