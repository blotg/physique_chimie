import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { createCoordinateSystem, Animation, sphericalToCartesian } from './utils.js';

const segments = 60;

// Fonction pour créer un élément de volume sphérique
function createSphericalVolumeElement(r, theta, phi, dr, dtheta, dphi) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];

    // Conversion en radians
    const thetaRad = theta * Math.PI / 180;
    const phiRad = phi * Math.PI / 180;
    const dthetaRad = dtheta * Math.PI / 180;
    const dphiRad = dphi * Math.PI / 180;

    let vertexIndex = 0;

    function addVertex(x, y, z) {
        vertices.push(x, y, z);
        return vertexIndex++;
    }

    // Faces à phi constant (plans méridiens) - arêtes droites en r et theta
    for (const phiStep of [phiRad, phiRad + dphiRad]) {
        const face = [];
        for (let i = 0; i <= segments; i++) {
            const th = thetaRad + (dthetaRad * i) / segments;
            for (let j = 0; j <= segments; j++) {
                const rho = r + (dr * j) / segments;
                const pos = sphericalToCartesian(rho, th, phiStep);
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

    // Faces à theta constant (cônes) - arêtes courbes en phi, droites en r
    for (const thetaStep of [thetaRad, thetaRad + dthetaRad]) {
        const face = [];
        for (let i = 0; i <= segments; i++) {
            const ph = phiRad + (dphiRad * i) / segments;
            for (let j = 0; j <= segments; j++) {
                const rho = r + (dr * j) / segments;
                const pos = sphericalToCartesian(rho, thetaStep, ph);
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

    // Faces à r constant (sphères) - arêtes courbes en theta et phi
    for (const rStep of [r, r + dr]) {
        const face = [];
        for (let i = 0; i <= segments; i++) {
            const th = thetaRad + (dthetaRad * i) / segments;
            for (let j = 0; j <= segments; j++) {
                const ph = phiRad + (dphiRad * j) / segments;
                const pos = sphericalToCartesian(rStep, th, ph);
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

// Fonction pour créer les arêtes du volume sphérique
function createSphericalVolumeEdges(r, theta, phi, dr, dtheta, dphi) {
    const points = [];

    // Conversion en radians
    const thetaRad = theta * Math.PI / 180;
    const phiRad = phi * Math.PI / 180;
    const dthetaRad = dtheta * Math.PI / 180;
    const dphiRad = dphi * Math.PI / 180;

    function sphericalToCartesian(rho, th, ph) {
        return new THREE.Vector3(
            rho * Math.sin(th) * Math.cos(ph),
            rho * Math.sin(th) * Math.sin(ph),
            rho * Math.cos(th)
        );
    }

    // 12 arêtes du volume sphérique - chaque arête est une ligne séparée

    // 4 arêtes radiales (r varie, theta et phi constants)
    for (const th of [thetaRad, thetaRad + dthetaRad]) {
        for (const ph of [phiRad, phiRad + dphiRad]) {
            const curve = new THREE.CatmullRomCurve3(
                Array.from({ length: segments + 1 }, (_, i) => {
                    const rho = r + (dr * i) / segments;
                    return sphericalToCartesian(rho, th, ph);
                })
            );
            points.push(curve);
        }
    }

    // 4 arêtes en theta (theta varie, r et phi constants)
    for (const rho of [r, r + dr]) {
        for (const ph of [phiRad, phiRad + dphiRad]) {
            const curve = new THREE.CatmullRomCurve3(
                Array.from({ length: segments + 1 }, (_, i) => {
                    const th = thetaRad + (dthetaRad * i) / segments;
                    return sphericalToCartesian(rho, th, ph);
                })
            );
            points.push(curve);
        }
    }

    // 4 arêtes en phi (phi varie, r et theta constants)
    for (const rho of [r, r + dr]) {
        for (const th of [thetaRad, thetaRad + dthetaRad]) {
            const curve = new THREE.CatmullRomCurve3(
                Array.from({ length: segments + 1 }, (_, i) => {
                    const ph = phiRad + (dphiRad * i) / segments;
                    return sphericalToCartesian(rho, th, ph);
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

    // Élément de volume sphérique
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

    // Paramètres pour lil-gui (coordonnées sphériques)
    const params = {
        r: 2.0,
        theta: 45,  // en degrés
        phi: 30,    // en degrés
        dr: 0.5,
        dtheta: 30, // en degrés
        dphi: 30    // en degrés
    };

    // Création de l'interface GUI
    const gui = new GUI({ title: 'Paramètres sphériques' });
    container.appendChild(gui.domElement);

    const positionFolder = gui.addFolder('Position');
    positionFolder.add(params, 'r', 0.1, 5, 0.1).name('r').onChange(updateVolume);
    positionFolder.add(params, 'theta', 0, 180, 1).name('θ (degrés)').onChange(updateVolume);
    positionFolder.add(params, 'phi', 0, 360, 1).name('φ (degrés)').onChange(updateVolume);
    positionFolder.open();

    const dimensionsFolder = gui.addFolder('Différentiels');
    dimensionsFolder.add(params, 'dr', 0.1, 2, 0.1).name('dr').onChange(updateVolume);
    dimensionsFolder.add(params, 'dtheta', 1, 180, 1).name('dθ (degrés)').onChange(updateVolume);
    dimensionsFolder.add(params, 'dphi', 1, 360, 1).name('dφ (degrés)').onChange(updateVolume);
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
        
        const geometry = createSphericalVolumeElement(
            params.r, params.theta, params.phi,
            params.dr, params.dtheta, params.dphi
        );
        const edgeCurves = createSphericalVolumeEdges(
            params.r, params.theta, params.phi,
            params.dr, params.dtheta, params.dphi
        );
        
        volumeElement.geometry = geometry;
        
        // Créer une ligne pour chaque arête
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        edgeCurves.forEach(curve => {
            const points = curve.getPoints(segments);
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
