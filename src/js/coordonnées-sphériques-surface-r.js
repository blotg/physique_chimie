import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { createCoordinateSystem, Animation, sphericalToCartesian } from './utils.js';

const segments = 60;

// Fonction pour créer un élément de surface sphérique à r constant
function createSphericalSurfaceElement(r, theta, phi, dtheta, dphi) {
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

    // Face à r constant (surface sphérique) - arêtes courbes en theta et phi
    const face = [];
    for (let i = 0; i <= segments; i++) {
        const th = thetaRad + (dthetaRad * i) / segments;
        for (let j = 0; j <= segments; j++) {
            const ph = phiRad + (dphiRad * j) / segments;
            const pos = sphericalToCartesian(r, th, ph);
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

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
}

// Fonction pour créer les arêtes de la surface sphérique
function createSphericalSurfaceEdges(r, theta, phi, dtheta, dphi) {
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

    // 4 arêtes de la surface sphérique

    // 2 arêtes en theta (theta varie, r et phi constants)
    for (const ph of [phiRad, phiRad + dphiRad]) {
        const curve = new THREE.CatmullRomCurve3(
            Array.from({ length: segments + 1 }, (_, i) => {
                const th = thetaRad + (dthetaRad * i) / segments;
                return sphericalToCartesian(r, th, ph);
            })
        );
        points.push(curve);
    }

    // 2 arêtes en phi (phi varie, r et theta constants)
    for (const th of [thetaRad, thetaRad + dthetaRad]) {
        const curve = new THREE.CatmullRomCurve3(
            Array.from({ length: segments + 1 }, (_, i) => {
                const ph = phiRad + (dphiRad * i) / segments;
                return sphericalToCartesian(r, th, ph);
            })
        );
        points.push(curve);
    }

    return points;
}

export function initAnimation(containerId) {
    const container = document.getElementById(containerId);
    const animation = new Animation(container);

    createCoordinateSystem(animation.scene);

    // Élément de surface sphérique
    const surfaceMaterial = new THREE.MeshPhongMaterial({
        color: 0x667eea,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    const surfaceElement = new THREE.Mesh(new THREE.BufferGeometry(), surfaceMaterial);
    animation.scene.add(surfaceElement);

    // Groupe pour les arêtes
    const edgesGroup = new THREE.Group();
    animation.scene.add(edgesGroup);

    // Flèche pour l'orientation de la surface (normale)
    const arrowHelper = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0), // direction (sera mise à jour)
        new THREE.Vector3(0, 0, 0), // origine (sera mise à jour)
        1.0, // longueur
        0x000000, // couleur noire
        0.3, // longueur de la tête
        0.2  // largeur de la tête
    );
    animation.scene.add(arrowHelper);

    // Paramètres pour lil-gui (coordonnées sphériques)
    const params = {
        r: 3.0,
        theta: 45,  // en degrés
        phi: 30,    // en degrés
        dtheta: 45, // en degrés
        dphi: 60    // en degrés
    };

    // Création de l'interface GUI
    const gui = new GUI({ title: 'Surface sphérique (r constant)' });
    container.appendChild(gui.domElement);

    const positionFolder = gui.addFolder('Position');
    positionFolder.add(params, 'r', 0.1, 5, 0.1).name('r').onChange(updateSurface);
    positionFolder.add(params, 'theta', 0, 180, 1).name('θ (degrés)').onChange(updateSurface);
    positionFolder.add(params, 'phi', 0, 360, 1).name('φ (degrés)').onChange(updateSurface);
    positionFolder.open();

    const dimensionsFolder = gui.addFolder('Différentiels');
    dimensionsFolder.add(params, 'dtheta', 1, 180, 1).name('dθ (degrés)').onChange(updateSurface);
    dimensionsFolder.add(params, 'dphi', 1, 360, 1).name('dφ (degrés)').onChange(updateSurface);
    dimensionsFolder.open();

    // Fonction de mise à jour
    function updateSurface() {
        // Dispose avant de créer
        surfaceElement.geometry.dispose();
        
        // Supprimer les anciennes arêtes
        while (edgesGroup.children.length > 0) {
            const edge = edgesGroup.children[0];
            edge.geometry.dispose();
            edge.material.dispose();
            edgesGroup.remove(edge);
        }
        
        const geometry = createSphericalSurfaceElement(
            params.r, params.theta, params.phi,
            params.dtheta, params.dphi
        );
        const edgeCurves = createSphericalSurfaceEdges(
            params.r, params.theta, params.phi,
            params.dtheta, params.dphi
        );
        
        surfaceElement.geometry = geometry;
        
        // Créer une ligne pour chaque arête
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        edgeCurves.forEach(curve => {
            const points = curve.getPoints(segments);
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, edgeMaterial);
            edgesGroup.add(line);
        });

        // Calculer le centre de la surface et la normale
        const thetaRad = params.theta * Math.PI / 180;
        const phiRad = params.phi * Math.PI / 180;
        const dthetaRad = params.dtheta * Math.PI / 180;
        const dphiRad = params.dphi * Math.PI / 180;
        
        const thetaCenter = thetaRad + dthetaRad / 2;
        const phiCenter = phiRad + dphiRad / 2;
        
        const centerPos = sphericalToCartesian(params.r, thetaCenter, phiCenter);
        
        // La normale à une surface sphérique à r constant pointe radialement vers l'extérieur
        // Elle est simplement le vecteur radial unitaire e_r
        const normal = new THREE.Vector3(
            Math.sin(thetaCenter) * Math.cos(phiCenter),
            Math.sin(thetaCenter) * Math.sin(phiCenter),
            Math.cos(thetaCenter)
        ).normalize();
        
        // Mettre à jour la flèche
        arrowHelper.position.copy(centerPos);
        arrowHelper.setDirection(normal);
    }

    // Initialisation
    updateSurface();

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
