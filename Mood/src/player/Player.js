import * as THREE from 'three';
import * as CANNON from 'cannon-es';

/**
 * Player class - handles first-person character controls, physics, and health
 */
export class Player {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // Player stats
        this.health = 100;
        this.maxHealth = 100;
        this.speed = 5;
        this.sprintMultiplier = 1.5;
        this.jumpForce = 7;
        this.isAlive = true;
        
        // Movement state
        this.velocity = new THREE.Vector3();
        this.isGrounded = false;
        this.isMoving = false;
        this.isSprinting = false;
        
        // Physics body
        this.body = null;
        this.bodyHeight = 1.8;
        this.bodyRadius = 0.3;
        
        // Camera reference
        this.camera = gameEngine.camera;
        
        // Input state
        this.keys = gameEngine.keys;
        
        // Bob effect for walking
        this.bobTimer = 0;
        this.bobAmount = 0.02;
        this.bobSpeed = 10;
        this.initialCameraY = this.camera.position.y;
        
        this.init();
    }
    
    /**
     * Initialize the player
     */
    init() {
        // Delay physics body creation to ensure world is ready
        setTimeout(() => {
            this.createPhysicsBody();
            this.setupCollisionDetection();
            console.log('Player initialized');
        }, 50);
    }
    
    /**
     * Create physics body for collision detection
     */
    createPhysicsBody() {
        if (!this.gameEngine.world) {
            console.error('Physics world not available');
            return;
        }
        
        // Create a capsule-like body using a cylinder
        const shape = new CANNON.Cylinder(this.bodyRadius, this.bodyRadius, this.bodyHeight, 8);
        this.body = new CANNON.Body({ 
            mass: 70, // Average human weight in kg
            material: this.gameEngine.world.defaultContactMaterial.materials[0]
        });
        this.body.addShape(shape);
        
        // Set initial position
        this.body.position.set(0, this.bodyHeight / 2, 0);
        
        // Prevent the body from tipping over
        this.body.fixedRotation = true;
        this.body.updateMassProperties();
        
        // Add to physics world - check if world is available
        if (this.gameEngine.world && this.gameEngine.world.add) {
            this.gameEngine.world.add(this.body);
            console.log('Player physics body added to world successfully');
        } else {
            console.error('Physics world not available for player body creation');
            // Retry after a short delay
            setTimeout(() => {
                if (this.gameEngine.world && this.gameEngine.world.add) {
                    this.gameEngine.world.add(this.body);
                    console.log('Player physics body added to world on retry');
                } else {
                    console.error('Physics world still not available for player after retry');
                }
            }, 100);
        }
    }
    
    /**
     * Setup collision detection for ground checking
     */
    setupCollisionDetection() {
        this.body.addEventListener('collide', (event) => {
            const contact = event.contact;
            const other = event.target === this.body ? event.body : event.target;
            
            // Check if we're colliding with ground (normal pointing up)
            if (contact.ni.y > 0.5 || contact.ni.y < -0.5) {
                this.isGrounded = true;
            }
        });
    }
    
    /**
     * Update player logic each frame
     */
    update(deltaTime) {
        if (!this.isAlive || !this.body) return;
        
        this.handleMovement(deltaTime);
        this.updateCameraPosition();
        this.updateHeadBob(deltaTime);
        this.checkGrounded();
        
        // Reset grounded state (will be set again if still touching ground)
        this.isGrounded = false;
    }
    
    /**
     * Handle player movement input
     */
    handleMovement(deltaTime) {
        if (!this.body) {
            console.warn('Player movement called but no physics body available');
            return;
        }
        
        const moveVector = new THREE.Vector3();
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();
        
        // Get camera direction
        this.camera.getWorldDirection(forward);
        right.crossVectors(forward, this.camera.up).normalize();
        
        // Remove vertical component for ground movement
        forward.y = 0;
        forward.normalize();
        
        this.isMoving = false;
        this.isSprinting = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
        
        // Debug: Log key presses occasionally
        if (this.keys['KeyW'] || this.keys['KeyA'] || this.keys['KeyS'] || this.keys['KeyD']) {
            if (Math.random() < 0.01) { // Log 1% of the time to avoid spam
                console.log('Movement keys detected:', {
                    W: this.keys['KeyW'],
                    A: this.keys['KeyA'], 
                    S: this.keys['KeyS'],
                    D: this.keys['KeyD']
                });
            }
        }
        
        // Forward/Backward movement
        if (this.keys['KeyW']) {
            moveVector.add(forward);
            this.isMoving = true;
        }
        if (this.keys['KeyS']) {
            moveVector.sub(forward);
            this.isMoving = true;
        }
        
        // Left/Right movement
        if (this.keys['KeyA']) {
            moveVector.sub(right);
            this.isMoving = true;
        }
        if (this.keys['KeyD']) {
            moveVector.add(right);
            this.isMoving = true;
        }
        
        // Normalize diagonal movement
        if (moveVector.length() > 0) {
            moveVector.normalize();
            
            // Apply speed
            let currentSpeed = this.speed;
            if (this.isSprinting) {
                currentSpeed *= this.sprintMultiplier;
            }
            
            moveVector.multiplyScalar(currentSpeed);
            
            // Apply movement to physics body
            this.body.velocity.x = moveVector.x;
            this.body.velocity.z = moveVector.z;
        } else {
            // Stop horizontal movement when no input
            this.body.velocity.x = 0;
            this.body.velocity.z = 0;
        }
        
        // Jumping
        if (this.keys['Space'] && this.isGrounded) {
            this.body.velocity.y = this.jumpForce;
        }
    }
    
    /**
     * Update camera position to follow physics body
     */
    updateCameraPosition() {
        if (!this.body) return;
        
        // Follow the physics body
        this.camera.position.x = this.body.position.x;
        this.camera.position.z = this.body.position.z;
        
        // Set camera height relative to body
        const targetY = this.body.position.y + (this.bodyHeight / 2) + 0.5;
        this.camera.position.y = targetY;
    }
    
    /**
     * Update head bobbing effect while walking
     */
    updateHeadBob(deltaTime) {
        if (this.isMoving && this.isGrounded) {
            this.bobTimer += deltaTime * this.bobSpeed;
            if (this.isSprinting) {
                this.bobTimer += deltaTime * this.bobSpeed * 0.5; // Faster bob when sprinting
            }
            
            // Apply bobbing to camera
            const bobOffset = Math.sin(this.bobTimer) * this.bobAmount;
            this.camera.position.y += bobOffset;
        } else {
            // Gradually stop bobbing
            this.bobTimer = 0;
        }
    }
    
    /**
     * Check if player is on ground
     */
    checkGrounded() {
        if (!this.gameEngine.world || !this.body) return;
        
        // Raycast downward to check for ground
        const rayStart = new CANNON.Vec3(
            this.body.position.x,
            this.body.position.y,
            this.body.position.z
        );
        const rayEnd = new CANNON.Vec3(
            this.body.position.x,
            this.body.position.y - (this.bodyHeight / 2 + 0.1),
            this.body.position.z
        );
        
        const result = new CANNON.RaycastResult();
        this.gameEngine.world.raycastClosest(rayStart, rayEnd, {}, result);
        
        if (result.hasHit) {
            this.isGrounded = true;
        }
    }
    
    /**
     * Take damage
     */
    takeDamage(amount) {
        if (!this.isAlive) return;
        
        this.health -= amount;
        this.health = Math.max(0, this.health);
        
        // Update UI
        this.updateHealthUI();
        
        // Apply damage effect
        this.triggerDamageEffect();
        
        // Check if player died
        if (this.health <= 0) {
            this.die();
        }
    }
    
    /**
     * Heal the player
     */
    heal(amount) {
        if (!this.isAlive) return;
        
        this.health += amount;
        this.health = Math.min(this.maxHealth, this.health);
        
        // Update UI
        this.updateHealthUI();
    }
    
    /**
     * Update health UI elements
     */
    updateHealthUI() {
        const healthFill = document.getElementById('health-fill');
        const healthText = document.getElementById('health-text');
        
        if (healthFill) {
            const healthPercent = (this.health / this.maxHealth) * 100;
            healthFill.style.width = `${healthPercent}%`;
            
            // Change color based on health level
            if (healthPercent > 60) {
                healthFill.style.background = 'linear-gradient(90deg, #44ff44, #ffaa00)';
            } else if (healthPercent > 30) {
                healthFill.style.background = 'linear-gradient(90deg, #ffaa00, #ff4444)';
            } else {
                healthFill.style.background = '#ff4444';
                healthFill.classList.add('pulse');
            }
        }
        
        if (healthText) {
            healthText.textContent = Math.ceil(this.health);
        }
    }
    
    /**
     * Trigger visual damage effect
     */
    triggerDamageEffect() {
        // Create damage overlay if it doesn't exist
        let damageOverlay = document.getElementById('damage-overlay');
        if (!damageOverlay) {
            damageOverlay = document.createElement('div');
            damageOverlay.id = 'damage-overlay';
            damageOverlay.className = 'damage-overlay';
            document.getElementById('game-ui').appendChild(damageOverlay);
        }
        
        // Show damage effect
        damageOverlay.classList.add('active');
        
        // Camera shake effect
        this.cameraShake();
        
        // Remove effect after short duration
        setTimeout(() => {
            damageOverlay.classList.remove('active');
        }, 200);
    }
    
    /**
     * Camera shake effect for damage
     */
    cameraShake() {
        const originalPosition = this.camera.position.clone();
        const shakeIntensity = 0.05;
        const shakeDuration = 200; // ms
        const shakeStart = Date.now();
        
        const shake = () => {
            const elapsed = Date.now() - shakeStart;
            if (elapsed < shakeDuration) {
                const progress = elapsed / shakeDuration;
                const intensity = shakeIntensity * (1 - progress);
                
                this.camera.position.x = originalPosition.x + (Math.random() - 0.5) * intensity;
                this.camera.position.z = originalPosition.z + (Math.random() - 0.5) * intensity;
                
                requestAnimationFrame(shake);
            } else {
                this.camera.position.copy(originalPosition);
            }
        };
        
        shake();
    }
    
    /**
     * Handle player death
     */
    die() {
        this.isAlive = false;
        console.log('Player died');
        
        // Trigger game over
        setTimeout(() => {
            this.gameEngine.gameState = 'gameOver';
            document.getElementById('game-over-title').textContent = 'FALLEN ANGEL';
            document.getElementById('game-over-message').textContent = 'Darkness has consumed heaven...';
            document.getElementById('game-over').style.display = 'flex';
            document.exitPointerLock();
        }, 1000);
    }
    
    /**
     * Respawn the player
     */
    respawn() {
        this.health = this.maxHealth;
        this.isAlive = true;
        
        // Reset position
        this.body.position.set(0, this.bodyHeight / 2, 0);
        this.body.velocity.set(0, 0, 0);
        
        // Update UI
        this.updateHealthUI();
        
        console.log('Player respawned');
    }
    
    /**
     * Get player position
     */
    getPosition() {
        return this.body ? this.body.position : new THREE.Vector3(0, 0, 0);
    }
    
    /**
     * Get player forward direction
     */
    getForwardDirection() {
        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward);
        return forward;
    }
    
    /**
     * Cleanup player resources
     */
    dispose() {
        if (this.body) {
            this.gameEngine.world.remove(this.body);
        }
        
        // Remove damage overlay
        const damageOverlay = document.getElementById('damage-overlay');
        if (damageOverlay) {
            damageOverlay.remove();
        }
        
        console.log('Player disposed');
    }
}