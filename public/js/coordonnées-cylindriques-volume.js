import * as THREE from 'https://esm.sh/three@0.164.1';
import { GUI } from 'https://esm.sh/three@0.164.1/examples/jsm/libs/lil-gui.module.min.js';
import { createKaTeXLabel, createCoordinateSystem, Animation } from './utils.js';

// Fonction pour convertir coordonnées cylindriques en cartésiennes
function cylindricalToCartesian(r, theta, z) {
    return new THREE.Vector3(
        r * Math.cos(theta),
        r * Math.sin(theta),
        z
    );
}

// Fonction pour créer un élément de volume cylindrique
function createCylindricalVolumeElement(r, theta, z, dr, dtheta, dz, segments = 20) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];

    // Conversion en radians
    const thetaRad = theta * Math.PI / 180;
    const dthetaRad = dtheta * Math.PI / 180;

    let vertexIndex = 0;

    function addVertex(x, y, z) {
        vertices.push(x, y, z);
        return vertexIndex++;
    }

    // Faces à theta constant (plans méridiens) - arêtes droites en r et z
    for (const thetaStep of [thetaRad, thetaRad + dthetaRad]) {
        const face = [];
        for (let i = 0; i <= segments; i++) {
            const radius = r + (dr * i) / segments;
            for (let j = 0; j <= segments; j++) {
                const zPos = z + (dz * j) / segments;
                const pos = cylindricalToCartesian(radius, thetaStep, zPos);
                face.push(addVertex(pos.x, pos.y, pos.z));
            }
        }
        // Créer les triangles
        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < segments; j++) {
                const a = face[i * (segments + 1) + j];
                const b = face[i * (segments + 1) + j + 1];
                const c = face[(i + 1) * (segments + 1) + j + 1];
                const d = face[(i + 1) * (segments + 1) + j];
                indices.push(a, b, c, a, c, d);
            }
        }
    }

    // Faces à z constant (plans horizontaux) - arêtes droites en r, courbes en theta
    for (const zStep of [z, z + dz]) {
        const face = [];
        for (let i = 0; i <= segments; i++) {
            const th = thetaRad + (dthetaRad * i) / segments;
            for (let j = 0; j <= segments; j++) {
                const radius = r + (dr * j) / segments;
                const pos = cylindricalToCartesian(radius, th, zStep);
                face.push(addVertex(pos.x, pos.y, pos.z));
            }
        }
        // Créer les triangles
        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < segments; j++) {
                const a = face[i * (segments + 1) + j];
                const b = face[i * (segments + 1) + j + 1];
                const c = face[(i + 1) * (segments + 1) + j + 1];
                const d = face[(i + 1) * (segments + 1) + j];
                indices.push(a, b, c, a, c, d);
            }
        }
    }

    // Faces à r constant (cylindres) - arêtes courbes en theta, droites en z
    for (const rStep of [r, r + dr]) {
        const face = [];
        for (let i = 0; i <= segments; i++) {
            const th = thetaRad + (dthetaRad * i) / segments;
            for (let j = 0; j <= segments; j++) {
                const zPos = z + (dz * j) / segments;
                const pos = cylindricalToCartesian(rStep, th, zPos);
                face.push(addVertex(pos.x, pos.y, pos.z));
            }
        }
        // Créer les triangles
        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < segments; j++) {
                const a = face[i * (segments + 1) + j];
                const b = face[i * (segments + 1) + j + 1];
                const c = face[(i + 1) * (segments + 1) + j + 1];
                const d = face[(i + 1) * (segments + 1) + j];
                indices.push(a, b, c, a, c, d);
            }
        }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
}

// Fonction pour créer les arêtes du volume cylindrique
function createCylindricalVolumeEdges(r, theta, z, dr, dtheta, dz, segments = 20) {
    const points = [];

    // Conversion en radians
    const thetaRad = theta * Math.PI / 180;
    const dthetaRad = dtheta * Math.PI / 180;

    // 12 arêtes du volume cylindrique - chaque arête est une ligne séparée

    // 4 arêtes radiales (r varie, theta et z constants)
    for (const th of [thetaRad, thetaRad + dthetaRad]) {
        for (const zPos of [z, z + dz]) {
            const curve = new THREE.CatmullRomCurve3(
                Array.from({ length: segments + 1 }, (_, i) => {
                    const radius = r + (dr * i) / segments;
                    return cylindricalToCartesian(radius, th, zPos);
                })
            );
            points.push(curve);
        }
    }

    // 4 arêtes verticales (z varie, r et theta constants)
    for (const radius of [r, r + dr]) {
        for (const th of [thetaRad, thetaRad + dthetaRad]) {
            const curve = new THREE.CatmullRomCurve3(
                Array.from({ length: segments + 1 }, (_, i) => {
                    const zPos = z + (dz * i) / segments;
                    return cylindricalToCartesian(radius, th, zPos);
                })
            );
            points.push(curve);
        }
    }

    // 4 arêtes en theta (theta varie, r et z constants)
    for (const radius of [r, r + dr]) {
        for (const zPos of [z, z + dz]) {
            const curve = new THREE.CatmullRomCurve3(
                Array.from({ length: segments + 1 }, (_, i) => {
                    const th = thetaRad + (dthetaRad * i) / segments;
                    return cylindricalToCartesian(radius, th, zPos);
                })
            );
            points.push(curve);
        }
    }

    return points;
}

export function initAnimation(containerId) {
    const container = document.getElementById(containerId);
    const animation = new Animation(container);

    createCoordinateSystem(animation.scene);

    // Élément de volume cylindrique
    const volumeMaterial = new THREE.MeshPhongMaterial({
        color: 0x667eea,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    const volumeElement = new THREE.Mesh(new THREE.BufferGeometry(), volumeMaterial);
    animation.scene.add(volumeElement);

    // Groupe pour les arêtes
    const edgesGroup = new THREE.Group();
    animation.scene.add(edgesGroup);

    // Paramètres pour lil-gui (coordonnées cylindriques)
    const params = {
        r: 2.0,
        theta: 30,  // en degrés
        z: 1.0,
        dr: 0.5,
        dtheta: 30, // en degrés
        dz: 0.5
    };

    // Création de l'interface GUI
    const gui = new GUI({ title: 'Paramètres cylindriques' });
    container.appendChild(gui.domElement);

    const positionFolder = gui.addFolder('Position');
    positionFolder.add(params, 'r', 0.1, 5, 0.1).name('r').onChange(updateVolume);
    positionFolder.add(params, 'theta', 0, 360, 1).name('θ (degrés)').onChange(updateVolume);
    positionFolder.add(params, 'z', -5, 5, 0.1).name('z').onChange(updateVolume);
    positionFolder.open();

    const dimensionsFolder = gui.addFolder('Différentiels');
    dimensionsFolder.add(params, 'dr', 0.1, 2, 0.1).name('dr').onChange(updateVolume);
    dimensionsFolder.add(params, 'dtheta', 1, 360, 1).name('dθ (degrés)').onChange(updateVolume);
    dimensionsFolder.add(params, 'dz', 0.1, 2, 0.1).name('dz').onChange(updateVolume);
    dimensionsFolder.open();

    // Fonction de mise à jour
    function updateVolume() {
        // Dispose avant de créer
        volumeElement.geometry.dispose();
        
        // Supprimer les anciennes arêtes
        while (edgesGroup.children.length > 0) {
            const edge = edgesGroup.children[0];
            edge.geometry.dispose();
            edge.material.dispose();
            edgesGroup.remove(edge);
        }
        
        const geometry = createCylindricalVolumeElement(
            params.r, params.theta, params.z,
            params.dr, params.dtheta, params.dz
        );
        const edgeCurves = createCylindricalVolumeEdges(
            params.r, params.theta, params.z,
            params.dr, params.dtheta, params.dz
        );
        
        volumeElement.geometry = geometry;
        
        // Créer une ligne pour chaque arête
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        edgeCurves.forEach(curve => {
            const points = curve.getPoints(20);
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, edgeMaterial);
            edgesGroup.add(line);
        });
    }

    // Initialisation
    updateVolume();

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
