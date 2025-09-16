import * as THREE from 'three';
import * as CANNON from 'cannon-es';

/**
 * Environment class - creates the heavenly world with platforms, clouds, and structures
 */
export class Environment {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.scene = gameEngine.scene;
        this.world = gameEngine.world;
        
        // Environment objects
        this.platforms = [];
        this.clouds = [];
        this.structures = [];
        
        // Validate that physics world is available
        if (!this.world) {
            console.error('Physics world not available in Environment constructor');
            // Don't return - still create visual elements
        }
        
        this.init();
    }
    
    /**
     * Initialize the environment
     */
    init() {
        this.createGround();
        this.createPlatforms();
        this.createClouds();
        this.createHeavenlyStructures();
        this.createSkybox();
        this.addEnvironmentalEffects();
        
        console.log('Heaven environment created');
    }
    
    /**
     * Create the main ground/floor
     */
    createGround() {
        // Visual ground
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Physics ground - check if world is available
        if (this.world && this.world.add) {
            const groundShape = new CANNON.Plane();
            const groundBody = new CANNON.Body({ mass: 0 });
            groundBody.addShape(groundShape);
            groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
            this.world.add(groundBody);
        } else {
            console.error('Physics world not available for ground creation');
        }
    }
    
    /**
     * Create floating platforms throughout the level
     */
    createPlatforms() {
        const platformConfigs = [
            { x: 10, y: 2, z: 0, width: 8, depth: 8 },
            { x: -15, y: 4, z: 10, width: 6, depth: 6 },
            { x: 20, y: 6, z: -15, width: 10, depth: 4 },
            { x: -10, y: 3, z: -20, width: 5, depth: 12 },
            { x: 0, y: 8, z: 25, width: 12, depth: 8 },
            { x: 25, y: 5, z: 20, width: 6, depth: 6 },
            { x: -25, y: 7, z: -5, width: 8, depth: 8 },
        ];
        
        platformConfigs.forEach((config, index) => {
            this.createPlatform(config, index);
        });
    }
    
    /**
     * Create a single floating platform
     */
    createPlatform(config, index) {
        const { x, y, z, width, depth } = config;
        const height = 0.5;
        
        // Visual platform with golden material
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xffd700,
            emissive: 0x221100,
            shininess: 100
        });
        
        const platform = new THREE.Mesh(geometry, material);
        platform.position.set(x, y, z);
        platform.castShadow = true;
        platform.receiveShadow = true;
        this.scene.add(platform);
        
        // Physics platform
        const shape = new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2));
        const body = new CANNON.Body({ mass: 0 });
        body.addShape(shape);
        body.position.set(x, y, z);
        
        // Check if world is available before adding
        if (this.world && this.world.add) {
            this.world.add(body);
        } else {
            console.error('Physics world not available for platform creation');
        }
        
        // Add glowing edge effect
        const edgeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.3
        });
        const edgeGeometry = new THREE.BoxGeometry(width + 0.1, height + 0.1, depth + 0.1);
        const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
        edge.position.copy(platform.position);
        this.scene.add(edge);
        
        this.platforms.push({ mesh: platform, body, edge });
    }
    
    /**
     * Create floating clouds throughout the environment
     */
    createClouds() {
        const cloudCount = 20;
        
        for (let i = 0; i < cloudCount; i++) {
            this.createCloud();
        }
    }
    
    /**
     * Create a single cloud
     */
    createCloud() {
        const cloud = new THREE.Group();
        
        // Create cloud puffs
        const puffCount = Math.random() * 5 + 3;
        
        for (let i = 0; i < puffCount; i++) {
            const puffGeometry = new THREE.SphereGeometry(
                Math.random() * 2 + 1, // radius
                8, 8
            );
            const puffMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xffffff,
                transparent: true,
                opacity: 0.7
            });
            
            const puff = new THREE.Mesh(puffGeometry, puffMaterial);
            puff.position.set(
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 6
            );
            
            cloud.add(puff);
        }
        
        // Position cloud in the sky
        cloud.position.set(
            (Math.random() - 0.5) * 200,
            Math.random() * 20 + 15,
            (Math.random() - 0.5) * 200
        );
        
        // Add rotation for natural movement
        cloud.userData = {
            rotationSpeed: (Math.random() - 0.5) * 0.01,
            driftSpeed: new THREE.Vector3(
                (Math.random() - 0.5) * 0.1,
                0,
                (Math.random() - 0.5) * 0.1
            )
        };
        
        this.scene.add(cloud);
        this.clouds.push(cloud);
    }
    
    /**
     * Create heavenly structures like pillars and arches
     */
    createHeavenlyStructures() {
        // Create golden pillars
        this.createPillars();
        
        // Create arches
        this.createArches();
        
        // Create crystal formations
        this.createCrystals();
    }
    
    /**
     * Create golden pillars
     */
    createPillars() {
        const pillarPositions = [
            { x: 30, z: 0 },
            { x: -30, z: 0 },
            { x: 0, z: 30 },
            { x: 0, z: -30 },
            { x: 15, z: 15 },
            { x: -15, z: -15 },
        ];
        
        pillarPositions.forEach(pos => {
            const pillarGeometry = new THREE.CylinderGeometry(1, 1.5, 15, 8);
            const pillarMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xffd700,
                emissive: 0x442200,
                shininess: 100
            });
            
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(pos.x, 7.5, pos.z);
            pillar.castShadow = true;
            this.scene.add(pillar);
            
            // Add physics body
            const shape = new CANNON.Cylinder(1, 1.5, 15, 8);
            const body = new CANNON.Body({ mass: 0 });
            body.addShape(shape);
            body.position.set(pos.x, 7.5, pos.z);
            
            // Check if world is available before adding
            if (this.world && this.world.add) {
                this.world.add(body);
            } else {
                console.error('Physics world not available for structure creation');
            }
            
            this.structures.push({ mesh: pillar, body });
        });
    }
    
    /**
     * Create heavenly arches
     */
    createArches() {
        const archPositions = [
            { x: 40, z: 0, rotation: 0 },
            { x: -40, z: 0, rotation: Math.PI },
            { x: 0, z: 40, rotation: Math.PI / 2 },
            { x: 0, z: -40, rotation: -Math.PI / 2 },
        ];
        
        archPositions.forEach(pos => {
            const arch = this.createSingleArch();
            arch.position.set(pos.x, 0, pos.z);
            arch.rotation.y = pos.rotation;
            this.scene.add(arch);
        });
    }
    
    /**
     * Create a single arch structure
     */
    createSingleArch() {
        const arch = new THREE.Group();
        
        // Left pillar
        const leftPillar = new THREE.Mesh(
            new THREE.BoxGeometry(1, 10, 1),
            new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x111111 })
        );
        leftPillar.position.set(-3, 5, 0);
        leftPillar.castShadow = true;
        arch.add(leftPillar);
        
        // Right pillar
        const rightPillar = new THREE.Mesh(
            new THREE.BoxGeometry(1, 10, 1),
            new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x111111 })
        );
        rightPillar.position.set(3, 5, 0);
        rightPillar.castShadow = true;
        arch.add(rightPillar);
        
        // Arch top
        const archTop = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.5, 6, 8),
            new THREE.MeshPhongMaterial({ color: 0xffd700, emissive: 0x221100 })
        );
        archTop.rotation.z = Math.PI / 2;
        archTop.position.set(0, 9, 0);
        archTop.castShadow = true;
        arch.add(archTop);
        
        return arch;
    }
    
    /**
     * Create crystal formations
     */
    createCrystals() {
        const crystalCount = 15;
        
        for (let i = 0; i < crystalCount; i++) {
            const crystalGeometry = new THREE.ConeGeometry(
                Math.random() * 0.5 + 0.3,
                Math.random() * 3 + 2,
                6
            );
            const crystalMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x00ffff,
                transparent: true,
                opacity: 0.8,
                emissive: 0x004444
            });
            
            const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
            crystal.position.set(
                (Math.random() - 0.5) * 80,
                crystal.geometry.parameters.height / 2,
                (Math.random() - 0.5) * 80
            );
            crystal.rotation.y = Math.random() * Math.PI * 2;
            crystal.castShadow = true;
            
            this.scene.add(crystal);
            this.structures.push({ mesh: crystal });
        }
    }
    
    /**
     * Create skybox for the heavenly environment
     */
    createSkybox() {
        // Create a large sphere for the sky
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x87CEEB) },
                bottomColor: { value: new THREE.Color(0xffffff) },
                offset: { value: 50 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide
        });
        
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
    }
    
    /**
     * Add environmental effects like floating particles
     */
    addEnvironmentalEffects() {
        // Create floating light particles
        this.createLightParticles();
        
        // Add ambient sound triggers (placeholder for now)
        this.setupAmbientTriggers();
    }
    
    /**
     * Create floating light particles for atmosphere
     */
    createLightParticles() {
        const particleCount = 100;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = Math.random() * 50 + 5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
        }
        
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffd700,
            size: 0.5,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(particles);
        
        // Animate particles
        particles.userData = {
            update: (deltaTime) => {
                particles.rotation.y += deltaTime * 0.1;
                
                const positions = particles.geometry.attributes.position.array;
                for (let i = 0; i < positions.length; i += 3) {
                    positions[i + 1] += Math.sin(Date.now() * 0.001 + positions[i]) * 0.01;
                }
                particles.geometry.attributes.position.needsUpdate = true;
            }
        };
        
        this.gameEngine.addGameObject('lightParticles', particles);
    }
    
    /**
     * Setup ambient environmental triggers
     */
    setupAmbientTriggers() {
        // Placeholder for ambient sound zones
        // Will be implemented with audio system
    }
    
    /**
     * Update environment effects
     */
    update(deltaTime) {
        // Update cloud movement
        this.clouds.forEach(cloud => {
            cloud.rotation.y += cloud.userData.rotationSpeed;
            cloud.position.add(cloud.userData.driftSpeed);
            
            // Reset cloud position if it drifts too far
            if (cloud.position.length() > 150) {
                cloud.position.set(
                    (Math.random() - 0.5) * 200,
                    Math.random() * 20 + 15,
                    (Math.random() - 0.5) * 200
                );
            }
        });
    }
    
    /**
     * Get spawn points for enemies
     */
    getEnemySpawnPoints() {
        return [
            new THREE.Vector3(20, 2, 20),
            new THREE.Vector3(-20, 2, 20),
            new THREE.Vector3(20, 2, -20),
            new THREE.Vector3(-20, 2, -20),
            new THREE.Vector3(0, 2, 30),
            new THREE.Vector3(0, 2, -30),
            new THREE.Vector3(30, 2, 0),
            new THREE.Vector3(-30, 2, 0),
        ];
    }
    
    /**
     * Cleanup environment resources
     */
    dispose() {
        // Remove physics bodies
        this.platforms.forEach(platform => {
            if (platform.body) {
                this.world.remove(platform.body);
            }
        });
        
        this.structures.forEach(structure => {
            if (structure.body) {
                this.world.remove(structure.body);
            }
        });
        
        console.log('Environment disposed');
    }
}