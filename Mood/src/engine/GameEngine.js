import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Howl } from 'howler';

/**
 * Main Game Engine Class
 * Handles core game systems including 3D rendering, physics, and game loop
 */
export class GameEngine {
    constructor() {
        // Core Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        
        // Physics world
        this.world = null;
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        
        // Input handling
        this.keys = {};
        this.mouse = { x: 0, y: 0, deltaX: 0, deltaY: 0 };
        this.mouseButtons = { left: false, right: false };
        
        // Game objects
        this.gameObjects = new Map();
        this.updateList = [];
        
        // Performance monitoring
        this.stats = {
            fps: 0,
            frameCount: 0,
            lastTime: 0
        };
        
        this.init();
    }
    
    /**
     * Initialize the game engine
     */
    init() {
        this.setupRenderer();
        this.setupScene();
        this.setupCamera();
        this.setupPhysics();
        this.setupLighting();
        this.setupInputHandlers();
        this.setupResizeHandler();
        
        console.log('Game Engine initialized successfully');
    }
    
    /**
     * Check if the engine is fully initialized
     */
    isReady() {
        return this.scene !== null && 
               this.camera !== null && 
               this.renderer !== null && 
               this.world !== null;
    }
    
    /**
     * Wait for engine to be ready
     */
    waitForReady() {
        return new Promise((resolve) => {
            if (this.isReady()) {
                resolve(this);
                return;
            }
            
            const checkReady = () => {
                if (this.isReady()) {
                    resolve(this);
                } else {
                    setTimeout(checkReady, 10);
                }
            };
            checkReady();
        });
    }
    
    /**
     * Setup Three.js renderer with optimal settings
     */
    setupRenderer() {
        const canvas = document.getElementById('game-canvas');
        
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Enable shadows
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Set color space and tone mapping for better visuals
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        // Clear color (heavenly blue-white)
        this.renderer.setClearColor(0x87CEEB, 1.0);
        
        // Enable fog for atmospheric effect
        this.renderer.fog = true;
    }
    
    /**
     * Setup the main 3D scene
     */
    setupScene() {
        this.scene = new THREE.Scene();
        
        // Add atmospheric fog (heavenly mist)
        this.scene.fog = new THREE.Fog(0x87CEEB, 10, 200);
        
        // Background (heavenly sky)
        const loader = new THREE.CubeTextureLoader();
        // For now, use a simple gradient background
        this.scene.background = new THREE.Color(0x87CEEB);
    }
    
    /**
     * Setup first-person camera
     */
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75, // field of view
            window.innerWidth / window.innerHeight, // aspect ratio
            0.1, // near clipping plane
            1000 // far clipping plane
        );
        
        // Initial camera position (player spawn point)
        this.camera.position.set(0, 1.8, 0); // 1.8m height for eye level
        this.camera.rotation.order = 'YXZ'; // Prevent gimbal lock
    }
    
    /**
     * Setup Cannon.js physics world
     */
    setupPhysics() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0); // Earth-like gravity
        this.world.broadphase = new CANNON.NaiveBroadphase(); // Simple collision detection
        
        // Create default materials
        this.defaultMaterial = new CANNON.Material('default');
        this.defaultContactMaterial = new CANNON.ContactMaterial(
            this.defaultMaterial,
            this.defaultMaterial,
            {
                friction: 0.4,
                restitution: 0.3,
            }
        );
        this.world.addContactMaterial(this.defaultContactMaterial);
        this.world.defaultContactMaterial = this.defaultContactMaterial;
    }
    
    /**
     * Setup heavenly lighting system
     */
    setupLighting() {
        // Ambient light (soft heavenly glow)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        // Directional light (divine sunlight)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        
        // Configure shadow camera
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        
        this.scene.add(directionalLight);
        
        // Point lights for dynamic lighting effects
        const pointLight1 = new THREE.PointLight(0xffd700, 0.5, 30);
        pointLight1.position.set(10, 5, 10);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xffd700, 0.5, 30);
        pointLight2.position.set(-10, 5, -10);
        this.scene.add(pointLight2);
    }
    
    /**
     * Setup input event handlers
     */
    setupInputHandlers() {
        // Keyboard events
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            this.handleKeyDown(event);
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
            this.handleKeyUp(event);
        });
        
        // Mouse events
        document.addEventListener('mousemove', (event) => {
            this.handleMouseMove(event);
        });
        
        document.addEventListener('mousedown', (event) => {
            this.handleMouseDown(event);
        });
        
        document.addEventListener('mouseup', (event) => {
            this.handleMouseUp(event);
        });
        
        // Pointer lock for first-person controls
        document.addEventListener('click', () => {
            if (this.gameState === 'playing') {
                this.requestPointerLock();
            }
        });
        
        // Pointer lock change events
        document.addEventListener('pointerlockchange', () => {
            this.handlePointerLockChange();
        });
    }
    
    /**
     * Setup window resize handler
     */
    setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    /**
     * Handle keyboard key down events
     */
    handleKeyDown(event) {
        switch(event.code) {
            case 'Escape':
                this.togglePause();
                break;
            case 'KeyR':
                if (this.gameState === 'playing') {
                    this.triggerReload();
                }
                break;
            case 'Digit1':
            case 'Digit2':
            case 'Digit3':
            case 'Digit4':
                if (this.gameState === 'playing') {
                    const weaponIndex = parseInt(event.code.slice(-1)) - 1;
                    this.switchWeapon(weaponIndex);
                }
                break;
        }
    }
    
    /**
     * Handle keyboard key up events
     */
    handleKeyUp(event) {
        // Handle any key up specific logic here
    }
    
    /**
     * Handle mouse movement for camera controls
     */
    handleMouseMove(event) {
        if (document.pointerLockElement === this.renderer.domElement) {
            this.mouse.deltaX = event.movementX || 0;
            this.mouse.deltaY = event.movementY || 0;
            
            // Apply mouse sensitivity
            const sensitivity = 0.002;
            this.camera.rotation.y -= this.mouse.deltaX * sensitivity;
            this.camera.rotation.x -= this.mouse.deltaY * sensitivity;
            
            // Clamp vertical rotation to prevent flipping
            this.camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.camera.rotation.x));
        }
    }
    
    /**
     * Handle mouse button down events
     */
    handleMouseDown(event) {
        if (event.button === 0) { // Left click
            this.mouseButtons.left = true;
            if (this.gameState === 'playing') {
                this.triggerShoot();
            }
        } else if (event.button === 2) { // Right click
            this.mouseButtons.right = true;
        }
    }
    
    /**
     * Handle mouse button up events
     */
    handleMouseUp(event) {
        if (event.button === 0) {
            this.mouseButtons.left = false;
        } else if (event.button === 2) {
            this.mouseButtons.right = false;
        }
    }
    
    /**
     * Request pointer lock for first-person controls
     */
    requestPointerLock() {
        this.renderer.domElement.requestPointerLock();
    }
    
    /**
     * Handle pointer lock state changes
     */
    handlePointerLockChange() {
        if (document.pointerLockElement === this.renderer.domElement) {
            // Pointer is locked
        } else {
            // Pointer is unlocked
            if (this.gameState === 'playing') {
                this.pauseGame();
            }
        }
    }
    
    /**
     * Start the game
     */
    startGame() {
        this.gameState = 'playing';
        this.isRunning = true;
        this.isPaused = false;
        this.requestPointerLock();
        this.gameLoop();
        console.log('Game started');
    }
    
    /**
     * Pause the game
     */
    pauseGame() {
        this.isPaused = true;
        this.gameState = 'paused';
        document.exitPointerLock();
    }
    
    /**
     * Resume the game
     */
    resumeGame() {
        this.isPaused = false;
        this.gameState = 'playing';
        this.requestPointerLock();
    }
    
    /**
     * Toggle pause state
     */
    togglePause() {
        if (this.gameState === 'playing') {
            this.pauseGame();
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }
    
    /**
     * Stop the game
     */
    stopGame() {
        this.isRunning = false;
        this.isPaused = false;
        this.gameState = 'menu';
        document.exitPointerLock();
    }
    
    /**
     * Main game loop
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.gameLoop());
        
        if (this.isPaused) return;
        
        const deltaTime = this.clock.getDelta();
        
        // Update physics
        this.world.step(deltaTime);
        
        // Update all game objects
        this.updateGameObjects(deltaTime);
        
        // Update performance stats
        this.updateStats();
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Update all game objects
     */
    updateGameObjects(deltaTime) {
        for (const updateFn of this.updateList) {
            updateFn(deltaTime);
        }
    }
    
    /**
     * Update performance statistics
     */
    updateStats() {
        this.stats.frameCount++;
        const now = performance.now();
        
        if (now >= this.stats.lastTime + 1000) {
            this.stats.fps = Math.round((this.stats.frameCount * 1000) / (now - this.stats.lastTime));
            this.stats.frameCount = 0;
            this.stats.lastTime = now;
        }
    }
    
    /**
     * Add a game object to the engine
     */
    addGameObject(id, object) {
        this.gameObjects.set(id, object);
        
        if (object.mesh) {
            this.scene.add(object.mesh);
        }
        
        if (object.body) {
            this.world.add(object.body);
        }
        
        if (object.update) {
            this.updateList.push(object.update.bind(object));
        }
    }
    
    /**
     * Remove a game object from the engine
     */
    removeGameObject(id) {
        const object = this.gameObjects.get(id);
        if (!object) return;
        
        if (object.mesh) {
            this.scene.remove(object.mesh);
        }
        
        if (object.body) {
            this.world.remove(object.body);
        }
        
        if (object.update) {
            const index = this.updateList.findIndex(fn => fn === object.update.bind(object));
            if (index !== -1) {
                this.updateList.splice(index, 1);
            }
        }
        
        this.gameObjects.delete(id);
    }
    
    /**
     * Get a game object by ID
     */
    getGameObject(id) {
        return this.gameObjects.get(id);
    }
    
    // Placeholder methods for game-specific functionality
    triggerShoot() {
        // Will be implemented by weapon system
        console.log('Shoot triggered');
    }
    
    triggerReload() {
        // Will be implemented by weapon system
        console.log('Reload triggered');
    }
    
    switchWeapon(index) {
        // Will be implemented by weapon system
        console.log(`Switch to weapon ${index}`);
    }
    
    /**
     * Cleanup resources
     */
    dispose() {
        // Dispose of Three.js objects
        this.scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        
        // Clear physics world
        this.world.bodies.forEach(body => this.world.remove(body));
        
        // Clear game objects
        this.gameObjects.clear();
        this.updateList.length = 0;
        
        console.log('Game engine disposed');
    }
}