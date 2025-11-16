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

const segments = 60;

// Fonction pour créer un élément de surface à z constant
function createCylindricalSurfaceElement(r, theta, z, dr, dtheta) {
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

    // Face à z constant (plan horizontal) - arêtes droites en r, courbes en theta
    const face = [];
    for (let i = 0; i <= segments; i++) {
        const th = thetaRad + (dthetaRad * i) / segments;
        for (let j = 0; j <= segments; j++) {
            const radius = r + (dr * j) / segments;
            const pos = cylindricalToCartesian(radius, th, z);
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

// Fonction pour créer les arêtes de la surface à z constant
function createCylindricalSurfaceEdges(r, theta, z, dr, dtheta) {
    const points = [];

    // Conversion en radians
    const thetaRad = theta * Math.PI / 180;
    const dthetaRad = dtheta * Math.PI / 180;

    // 4 arêtes de la surface horizontale

    // 2 arêtes radiales (r varie, theta et z constants)
    for (const th of [thetaRad, thetaRad + dthetaRad]) {
        const curve = new THREE.CatmullRomCurve3(
            Array.from({ length: segments + 1 }, (_, i) => {
                const radius = r + (dr * i) / segments;
                return cylindricalToCartesian(radius, th, z);
            })
        );
        points.push(curve);
    }

    // 2 arêtes en theta (theta varie, r et z constants)
    for (const radius of [r, r + dr]) {
        const curve = new THREE.CatmullRomCurve3(
            Array.from({ length: segments + 1 }, (_, i) => {
                const th = thetaRad + (dthetaRad * i) / segments;
                return cylindricalToCartesian(radius, th, z);
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

    // Élément de surface à z constant
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
        new THREE.Vector3(0, 0, 1), // direction (sera mise à jour)
        new THREE.Vector3(0, 0, 0), // origine (sera mise à jour)
        1.0, // longueur
        0x000000, // couleur noire
        0.3, // longueur de la tête
        0.2  // largeur de la tête
    );
    animation.scene.add(arrowHelper);

    // Paramètres pour lil-gui (coordonnées cylindriques)
    const params = {
        r: 1.5,
        theta: 30,  // en degrés
        z: 1.0,
        dr: 1.0,
        dtheta: 60 // en degrés
    };

    // Création de l'interface GUI
    const gui = new GUI({ title: 'Surface à z constant' });
    container.appendChild(gui.domElement);

    const positionFolder = gui.addFolder('Position');
    positionFolder.add(params, 'r', 0.1, 5, 0.1).name('r').onChange(updateSurface);
    positionFolder.add(params, 'theta', 0, 360, 1).name('θ (degrés)').onChange(updateSurface);
    positionFolder.add(params, 'z', -5, 5, 0.1).name('z').onChange(updateSurface);
    positionFolder.open();

    const dimensionsFolder = gui.addFolder('Différentiels');
    dimensionsFolder.add(params, 'dr', 0.1, 3, 0.1).name('dr').onChange(updateSurface);
    dimensionsFolder.add(params, 'dtheta', 1, 360, 1).name('dθ (degrés)').onChange(updateSurface);
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
        
        const geometry = createCylindricalSurfaceElement(
            params.r, params.theta, params.z,
            params.dr, params.dtheta
        );
        const edgeCurves = createCylindricalSurfaceEdges(
            params.r, params.theta, params.z,
            params.dr, params.dtheta
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
        const dthetaRad = params.dtheta * Math.PI / 180;
        const thetaCenter = thetaRad + dthetaRad / 2;
        const rCenter = params.r + params.dr / 2;
        
        const centerPos = cylindricalToCartesian(rCenter, thetaCenter, params.z);
        
        // La normale à une surface à z constant pointe verticalement (vers le haut)
        const normal = new THREE.Vector3(0, 0, 1);
        
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
