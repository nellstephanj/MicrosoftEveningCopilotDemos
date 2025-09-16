import * as THREE from 'three';
import * as CANNON from 'cannon-es';

/**
 * Base Enemy class
 */
export class Enemy {
    constructor(gameEngine, config) {
        this.gameEngine = gameEngine;
        this.scene = gameEngine.scene;
        this.world = gameEngine.world;
        
        // Enemy stats
        this.health = config.health || 50;
        this.maxHealth = this.health;
        this.damage = config.damage || 10;
        this.speed = config.speed || 2;
        this.attackRange = config.attackRange || 3;
        this.detectionRange = config.detectionRange || 15;
        
        // State
        this.isAlive = true;
        this.isAttacking = false;
        this.lastAttackTime = 0;
        this.attackCooldown = config.attackCooldown || 1000;
        
        // 3D components
        this.mesh = null;
        this.body = null;
        
        // AI state
        this.state = 'idle'; // idle, chasing, attacking, dead
        this.target = null;
        this.targetPosition = new THREE.Vector3();
        
        this.init();
    }
    
    init() {
        this.createMesh();
        this.createPhysicsBody();
    }
    
    createMesh() {
        // Basic enemy shape - will be overridden by specific enemy types
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0x8B0000 });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.userData.enemy = this; // Reference for hit detection
        
        this.scene.add(this.mesh);
    }
    
    createPhysicsBody() {
        const shape = new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5));
        this.body = new CANNON.Body({ mass: 50 });
        this.body.addShape(shape);
        this.body.fixedRotation = true;
        
        // Add to physics world - check if world is available
        if (this.world && this.world.add) {
            this.world.add(this.body);
            console.log('Enemy physics body added to world successfully');
        } else {
            console.error('Physics world not available for enemy body creation');
            // Retry up to 5 times with increasing delays
            let retryCount = 0;
            const maxRetries = 5;
            
            const retryPhysicsBody = () => {
                retryCount++;
                setTimeout(() => {
                    if (this.world && this.world.add) {
                        this.world.add(this.body);
                        console.log(`Enemy physics body added to world on retry ${retryCount}`);
                    } else if (retryCount < maxRetries) {
                        retryPhysicsBody();
                    } else {
                        console.error('Physics world still not available for enemy after all retries');
                    }
                }, 100 * retryCount); // Increasing delay
            };
            
            retryPhysicsBody();
        }
    }
    
    update(deltaTime) {
        if (!this.isAlive) return;
        
        this.updateAI(deltaTime);
        this.updatePhysics();
    }
    
    updateAI(deltaTime) {
        const player = this.gameEngine.getGameObject('player');
        if (!player) return;
        
        const playerPosition = player.getPosition();
        const distance = this.body.position.distanceTo(playerPosition);
        
        switch(this.state) {
            case 'idle':
                if (distance <= this.detectionRange) {
                    this.state = 'chasing';
                    this.target = player;
                }
                break;
                
            case 'chasing':
                if (distance <= this.attackRange) {
                    this.state = 'attacking';
                } else if (distance > this.detectionRange * 1.5) {
                    this.state = 'idle';
                    this.target = null;
                } else {
                    this.moveTowards(playerPosition, deltaTime);
                }
                break;
                
            case 'attacking':
                if (distance > this.attackRange) {
                    this.state = 'chasing';
                } else {
                    this.attack();
                }
                break;
        }
    }
    
    moveTowards(targetPosition, deltaTime) {
        const direction = new THREE.Vector3()
            .subVectors(targetPosition, this.body.position)
            .normalize();
        
        direction.y = 0; // Keep movement horizontal
        
        this.body.velocity.x = direction.x * this.speed;
        this.body.velocity.z = direction.z * this.speed;
        
        // Rotate to face target
        const angle = Math.atan2(direction.x, direction.z);
        this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angle);
    }
    
    attack() {
        const now = Date.now();
        if (now - this.lastAttackTime < this.attackCooldown) return;
        
        this.lastAttackTime = now;
        this.isAttacking = true;
        
        // Deal damage to player
        const player = this.gameEngine.getGameObject('player');
        if (player) {
            player.takeDamage(this.damage);
        }
        
        // Attack animation
        this.playAttackAnimation();
        
        setTimeout(() => {
            this.isAttacking = false;
        }, 500);
    }
    
    playAttackAnimation() {
        if (!this.mesh) return;
        
        const originalScale = this.mesh.scale.clone();
        this.mesh.scale.multiplyScalar(1.2);
        
        setTimeout(() => {
            this.mesh.scale.copy(originalScale);
        }, 200);
    }
    
    updatePhysics() {
        if (this.mesh && this.body) {
            this.mesh.position.copy(this.body.position);
            this.mesh.quaternion.copy(this.body.quaternion);
        }
    }
    
    takeDamage(amount) {
        if (!this.isAlive) return;
        
        this.health -= amount;
        this.health = Math.max(0, this.health);
        
        // Damage effect
        this.showDamageEffect();
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    showDamageEffect() {
        if (!this.mesh) return;
        
        const originalColor = this.mesh.material.color.clone();
        this.mesh.material.color.setHex(0xffffff);
        
        setTimeout(() => {
            this.mesh.material.color.copy(originalColor);
        }, 100);
    }
    
    die() {
        this.isAlive = false;
        this.state = 'dead';
        
        // Death animation
        this.playDeathAnimation();
        
        // Remove from world after animation
        setTimeout(() => {
            this.dispose();
        }, 1000);
    }
    
    playDeathAnimation() {
        if (!this.mesh) return;
        
        // Fall over animation
        this.mesh.rotation.z = Math.PI / 2;
        this.mesh.material.transparent = true;
        
        let opacity = 1;
        const fadeOut = () => {
            opacity -= 0.01;
            this.mesh.material.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(fadeOut);
            }
        };
        fadeOut();
    }
    
    setPosition(x, y, z) {
        if (this.body) {
            this.body.position.set(x, y, z);
        }
        if (this.mesh) {
            this.mesh.position.set(x, y, z);
        }
    }
    
    dispose() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
        }
        if (this.body) {
            this.world.remove(this.body);
        }
    }
}

/**
 * Fallen Angel - Flying enemy with ranged attacks
 */
export class FallenAngel extends Enemy {
    constructor(gameEngine, position) {
        super(gameEngine, {
            health: 75,
            damage: 15,
            speed: 3,
            attackRange: 10,
            detectionRange: 20,
            attackCooldown: 2000
        });
        
        this.canFly = true;
        this.hoverHeight = 5;
        this.projectiles = [];
        
        if (position) {
            this.setPosition(position.x, position.y + this.hoverHeight, position.z);
        }
    }
    
    createMesh() {
        const group = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4B0082,
            emissive: 0x220022
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        group.add(body);
        
        // Wings
        const wingGeometry = new THREE.PlaneGeometry(2, 1);
        const wingMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2F2F2F,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(-1, 0.5, 0);
        leftWing.rotation.z = 0.3;
        group.add(leftWing);
        
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.set(1, 0.5, 0);
        rightWing.rotation.z = -0.3;
        group.add(rightWing);
        
        // Eyes (glowing)
        const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000
        });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.2, 0.8, 0.4);
        group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.2, 0.8, 0.4);
        group.add(rightEye);
        
        this.mesh = group;
        this.mesh.castShadow = true;
        this.mesh.userData.enemy = this;
        
        this.scene.add(this.mesh);
    }
    
    attack() {
        const now = Date.now();
        if (now - this.lastAttackTime < this.attackCooldown) return;
        
        this.lastAttackTime = now;
        this.isAttacking = true;
        
        // Fire dark energy projectile
        this.fireProjectile();
        
        setTimeout(() => {
            this.isAttacking = false;
        }, 500);
    }
    
    fireProjectile() {
        const player = this.gameEngine.getGameObject('player');
        if (!player) return;
        
        const direction = new THREE.Vector3()
            .subVectors(player.getPosition(), this.body.position)
            .normalize();
        
        const projectileGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const projectileMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8B0000,
            emissive: 0x4B0000
        });
        
        const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
        projectile.position.copy(this.mesh.position);
        
        projectile.userData = {
            velocity: direction.multiplyScalar(20),
            damage: this.damage,
            life: 3000 // 3 seconds
        };
        
        this.scene.add(projectile);
        this.projectiles.push(projectile);
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Update projectiles
        this.updateProjectiles(deltaTime);
        
        // Hover effect
        if (this.mesh) {
            this.mesh.position.y += Math.sin(Date.now() * 0.003) * 0.02;
        }
    }
    
    updateProjectiles(deltaTime) {
        this.projectiles = this.projectiles.filter(projectile => {
            if (!projectile.parent) return false;
            
            // Move projectile
            projectile.position.add(
                projectile.userData.velocity.clone().multiplyScalar(deltaTime)
            );
            
            // Check collision with player
            const player = this.gameEngine.getGameObject('player');
            if (player) {
                const distance = projectile.position.distanceTo(player.getPosition());
                if (distance < 1) {
                    player.takeDamage(projectile.userData.damage);
                    this.scene.remove(projectile);
                    return false;
                }
            }
            
            // Remove old projectiles
            projectile.userData.life -= deltaTime * 1000;
            if (projectile.userData.life <= 0) {
                this.scene.remove(projectile);
                return false;
            }
            
            return true;
        });
    }
}

/**
 * Dark Spirit - Fast melee enemy
 */
export class DarkSpirit extends Enemy {
    constructor(gameEngine, position) {
        super(gameEngine, {
            health: 40,
            damage: 20,
            speed: 5,
            attackRange: 2,
            detectionRange: 12,
            attackCooldown: 800
        });
        
        if (position) {
            this.setPosition(position.x, position.y, position.z);
        }
    }
    
    createMesh() {
        const group = new THREE.Group();
        
        // Main body (shadowy)
        const bodyGeometry = new THREE.ConeGeometry(0.5, 2, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x1a1a1a,
            transparent: true,
            opacity: 0.8,
            emissive: 0x330033
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        group.add(body);
        
        // Glowing core
        const coreGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const coreMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x9932cc,
            emissive: 0x9932cc
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.position.y = 0.5;
        group.add(core);
        
        this.mesh = group;
        this.mesh.castShadow = true;
        this.mesh.userData.enemy = this;
        
        this.scene.add(this.mesh);
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Floating/bobbing effect
        if (this.mesh) {
            this.mesh.position.y = this.body.position.y + Math.sin(Date.now() * 0.005) * 0.1;
        }
    }
}

/**
 * Corrupted Guardian - Heavy tank enemy
 */
export class CorruptedGuardian extends Enemy {
    constructor(gameEngine, position) {
        super(gameEngine, {
            health: 150,
            damage: 30,
            speed: 1.5,
            attackRange: 4,
            detectionRange: 18,
            attackCooldown: 1500
        });
        
        if (position) {
            this.setPosition(position.x, position.y, position.z);
        }
    }
    
    createMesh() {
        const group = new THREE.Group();
        
        // Large body
        const bodyGeometry = new THREE.BoxGeometry(2, 3, 2);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8B4513,
            emissive: 0x2B1813
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        group.add(body);
        
        // Armor plates
        const armorGeometry = new THREE.BoxGeometry(2.2, 0.5, 2.2);
        const armorMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x696969,
            metalness: 0.8,
            roughness: 0.2
        });
        
        for (let i = 0; i < 3; i++) {
            const armor = new THREE.Mesh(armorGeometry, armorMaterial);
            armor.position.y = -1 + i * 1;
            group.add(armor);
        }
        
        // Glowing weak points
        const weakPointGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const weakPointMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff4500,
            emissive: 0xff4500
        });
        
        const weakPoint1 = new THREE.Mesh(weakPointGeometry, weakPointMaterial);
        weakPoint1.position.set(0, 0.5, 1.1);
        group.add(weakPoint1);
        
        const weakPoint2 = new THREE.Mesh(weakPointGeometry, weakPointMaterial);
        weakPoint2.position.set(0, -0.5, 1.1);
        group.add(weakPoint2);
        
        this.mesh = group;
        this.mesh.castShadow = true;
        this.mesh.userData.enemy = this;
        
        this.scene.add(this.mesh);
    }
    
    createPhysicsBody() {
        const shape = new CANNON.Box(new CANNON.Vec3(1, 1.5, 1));
        this.body = new CANNON.Body({ mass: 200 });
        this.body.addShape(shape);
        this.body.fixedRotation = true;
        
        this.world.add(this.body);
    }
}