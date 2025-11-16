import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
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

    // Flèche dans la direction r (radiale dans le plan XY)
    const arrowR = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0), // direction
        new THREE.Vector3(0, 0, 0), // origine (sera mise à jour)
        arrowLength,
        0x000000,
        arrowHeadLength,
        arrowHeadWidth
    );
    animation.scene.add(arrowR);

    // Flèche dans la direction theta (tangentielle dans le plan XY)
    const arrowTheta = new THREE.ArrowHelper(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 0),
        arrowLength,
        0x000000,
        arrowHeadLength,
        arrowHeadWidth
    );
    animation.scene.add(arrowTheta);

    // Flèche dans la direction Z (verticale)
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
    const labelER = createKaTeXLabel('\\vec{e}_r');
    animation.scene.add(labelER);

    const labelETheta = createKaTeXLabel('\\vec{e}_\\theta');
    animation.scene.add(labelETheta);

    const labelEZ = createKaTeXLabel('\\vec{e}_z');
    animation.scene.add(labelEZ);

    // Lignes de projection en pointillés
    const lineMaterial = new THREE.LineDashedMaterial({
        color: 0x666666,
        dashSize: 0.1,
        gapSize: 0.05
    });

    // Ligne vers l'origine (projection dans le plan XY)
    const lineToOriginXY = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
        lineMaterial
    );
    lineToOriginXY.computeLineDistances();
    animation.scene.add(lineToOriginXY);

    const pointLabelR = createKaTeXLabel('r');
    animation.scene.add(pointLabelR);

    // Ligne verticale (projection sur l'axe Z)
    const lineVertical = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
        lineMaterial
    );
    lineVertical.computeLineDistances();
    animation.scene.add(lineVertical);

    const pointLabelZ = createKaTeXLabel('z');
    animation.scene.add(pointLabelZ);

    // Arc pour l'angle theta (dans le plan XY)
    const arcMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    const arcThetaGeometry = new THREE.BufferGeometry();
    const arcTheta = new THREE.Line(arcThetaGeometry, arcMaterial);
    animation.scene.add(arcTheta);
    // Flèche pour l'arc theta
    const arrowThetaCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.15, 16),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    animation.scene.add(arrowThetaCone);

    // Label pour theta
    const labelTheta = createKaTeXLabel('\\theta');
    animation.scene.add(labelTheta);


    // Création de l'interface GUI
    const gui = new GUI({ title: 'Coordonnées du point M' });
    const params = {
        r: 3.0,
        theta: 60.0,
        z: 2.0
    };

    container.appendChild(gui.domElement);

    gui.add(params, 'r', 0.1, 5, 0.1).name('r').onChange(update);
    gui.add(params, 'theta', 0, 360, 1).name('θ (degrés)').onChange(update);
    gui.add(params, 'z', -5, 5, 0.1).name('z').onChange(update);

    // Fonction pour mettre à jour
    function update() {
        // Conversion coordonnées cylindriques vers cartésiennes
        const x = params.r * Math.cos(THREE.MathUtils.degToRad(params.theta));
        const y = params.r * Math.sin(THREE.MathUtils.degToRad(params.theta));
        const z = params.z;

        // Vecteurs de base en coordonnées cylindriques
        const eR = new THREE.Vector3(
            Math.cos(THREE.MathUtils.degToRad(params.theta)),
            Math.sin(THREE.MathUtils.degToRad(params.theta)),
            0
        ).normalize();
        
        const eTheta = new THREE.Vector3(
            -Math.sin(THREE.MathUtils.degToRad(params.theta)),
            Math.cos(THREE.MathUtils.degToRad(params.theta)),
            0
        ).normalize();
        
        const eZ = new THREE.Vector3(0, 0, 1);

        point.position.set(x, y, z);
        pointLabel.position.set(x + 0.3, y - 0.3, z );

        // Mise à jour des positions des flèches
        arrowR.setDirection(eR);
        arrowR.position.set(x, y, z);
        arrowTheta.setDirection(eTheta);
        arrowTheta.position.set(x, y, z);
        arrowZ.setDirection(eZ);
        arrowZ.position.set(x, y, z);

        // Mise à jour des positions des labels des flèches
        labelER.position.set(x + eR.x*1.2, y + eR.y*1.2, z + eR.z*1.2);
        labelETheta.position.set(x + eTheta.x*1.2, y + eTheta.y*1.2, z + eTheta.z*1.2);
        labelEZ.position.set(x + eZ.x*1.2, y + eZ.y*1.2, z + eZ.z*1.2);

        // Mise à jour des lignes de projection
        // Ligne radiale dans le plan XY
        lineToOriginXY.geometry.setFromPoints([
            new THREE.Vector3(x, y, 0),
            new THREE.Vector3(0, 0, 0)
        ]);
        lineToOriginXY.computeLineDistances();

        pointLabelR.position.set(x/2 + 0.2, y/2 + 0.2, -0.3);

        // Ligne verticale
        lineVertical.geometry.setFromPoints([
            new THREE.Vector3(x, y, z),
            new THREE.Vector3(x, y, 0)
        ]);
        lineVertical.computeLineDistances();

        pointLabelZ.position.set(x + 0.3, y + 0.3, z/2);
        pointLabelZ.position.set(x + 0.3, y + 0.3, z/2);

        // Mise à jour de l'arc theta (dans le plan XY)
        const arcThetaRadius = Math.min(1.0, params.r * 0.5);
        const arcThetaPoints = [];
        const thetaRad = THREE.MathUtils.degToRad(params.theta);
        const segments = 32;
        
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * thetaRad;
            const px = arcThetaRadius * Math.cos(angle);
            const py = arcThetaRadius * Math.sin(angle);
            arcThetaPoints.push(new THREE.Vector3(px, py, 0));
        }
        arcThetaGeometry.setFromPoints(arcThetaPoints);
        // Position et orientation de la flèche theta
        if (arcThetaPoints.length >= 2) {
            const lastPoint = arcThetaPoints[arcThetaPoints.length - 1];
            const secondLastPoint = arcThetaPoints[arcThetaPoints.length - 2];
            arrowThetaCone.position.copy(lastPoint);
            
            const direction = new THREE.Vector3().subVectors(lastPoint, secondLastPoint).normalize();
            const quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
            arrowThetaCone.quaternion.copy(quaternion);
        }

        // Position du label theta
        const thetaMidAngle = thetaRad / 2;
        labelTheta.position.set(
            arcThetaRadius * 1.4 * Math.cos(thetaMidAngle),
            arcThetaRadius * 1.4 * Math.sin(thetaMidAngle),
            -0.2
        );
    }

    // Initialisation
    update();

    animation.animate();
}
