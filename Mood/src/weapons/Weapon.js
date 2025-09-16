import * as THREE from 'three';

/**
 * Base Weapon class - defines common weapon functionality
 */
export class Weapon {
    constructor(gameEngine, config) {
        this.gameEngine = gameEngine;
        this.scene = gameEngine.scene;
        this.camera = gameEngine.camera;
        
        // Weapon configuration
        this.name = config.name || 'Unknown Weapon';
        this.damage = config.damage || 10;
        this.maxAmmo = config.maxAmmo || 30;
        this.currentAmmo = this.maxAmmo;
        this.totalAmmo = config.totalAmmo || 120;
        this.fireRate = config.fireRate || 600; // rounds per minute
        this.reloadTime = config.reloadTime || 2000; // ms
        this.range = config.range || 100;
        this.spread = config.spread || 0.02;
        
        // Weapon state
        this.isReloading = false;
        this.lastFireTime = 0;
        this.fireInterval = 60000 / this.fireRate; // ms between shots
        
        // Visual components
        this.weaponMesh = null;
        this.muzzleFlash = null;
        
        // Audio (placeholder for now)
        this.fireSound = null;
        this.reloadSound = null;
        
        this.init();
    }
    
    /**
     * Initialize the weapon
     */
    init() {
        this.createWeaponModel();
        this.createMuzzleFlash();
        this.attachToCamera();
    }
    
    /**
     * Create the weapon 3D model (placeholder - will be overridden by specific weapons)
     */
    createWeaponModel() {
        // Basic weapon shape
        const weaponGroup = new THREE.Group();
        
        // Weapon body
        const bodyGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.4);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        weaponGroup.add(body);
        
        // Barrel
        const barrelGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8);
        const barrelMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        barrel.rotation.z = Math.PI / 2;
        barrel.position.set(0.15, 0, 0);
        weaponGroup.add(barrel);
        
        this.weaponMesh = weaponGroup;
    }
    
    /**
     * Create muzzle flash effect
     */
    createMuzzleFlash() {
        const flashGeometry = new THREE.PlaneGeometry(0.05, 0.05);
        const flashMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending
        });
        
        this.muzzleFlash = new THREE.Mesh(flashGeometry, flashMaterial);
        this.muzzleFlash.position.set(0.3, 0, 0);
        this.weaponMesh.add(this.muzzleFlash);
    }
    
    /**
     * Attach weapon to camera for first-person view
     */
    attachToCamera() {
        if (this.weaponMesh) {
            this.weaponMesh.position.set(0.3, -0.2, -0.5);
            this.weaponMesh.rotation.y = 0.1;
            this.camera.add(this.weaponMesh);
        }
    }
    
    /**
     * Fire the weapon
     */
    fire() {
        const now = Date.now();
        
        // Check if weapon can fire
        if (this.isReloading || 
            this.currentAmmo <= 0 || 
            now - this.lastFireTime < this.fireInterval) {
            return false;
        }
        
        this.lastFireTime = now;
        this.currentAmmo--;
        
        // Perform raycast for hit detection
        this.performRaycast();
        
        // Visual effects
        this.showMuzzleFlash();
        this.weaponRecoil();
        
        // Update UI
        this.updateAmmoUI();
        
        // Play sound effect (placeholder)
        this.playFireSound();
        
        return true;
    }
    
    /**
     * Perform raycast to detect hits
     */
    performRaycast() {
        const raycaster = new THREE.Raycaster();
        
        // Get direction from camera
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        
        // Add weapon spread
        direction.x += (Math.random() - 0.5) * this.spread;
        direction.y += (Math.random() - 0.5) * this.spread;
        direction.normalize();
        
        // Set up raycaster
        raycaster.set(this.camera.position, direction);
        raycaster.far = this.range;
        
        // Check for intersections with enemies
        const enemies = this.gameEngine.getGameObject('enemies') || [];
        const intersects = raycaster.intersectObjects(enemies.map(e => e.mesh));
        
        if (intersects.length > 0) {
            const hit = intersects[0];
            this.handleHit(hit);
        }
        
        // Create bullet trail effect
        this.createBulletTrail(this.camera.position, direction);
    }
    
    /**
     * Handle hit on target
     */
    handleHit(hit) {
        // Create hit effect
        this.createHitEffect(hit.point);
        
        // Deal damage to enemy (if hit object has takeDamage method)
        if (hit.object.userData && hit.object.userData.enemy) {
            hit.object.userData.enemy.takeDamage(this.damage);
        }
    }
    
    /**
     * Create bullet trail effect
     */
    createBulletTrail(startPos, direction) {
        const endPos = startPos.clone().add(direction.multiplyScalar(this.range));
        
        const trailGeometry = new THREE.BufferGeometry().setFromPoints([startPos, endPos]);
        const trailMaterial = new THREE.LineBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.8
        });
        
        const trail = new THREE.Line(trailGeometry, trailMaterial);
        this.scene.add(trail);
        
        // Remove trail after short duration
        setTimeout(() => {
            this.scene.remove(trail);
        }, 50);
    }
    
    /**
     * Create hit effect at impact point
     */
    createHitEffect(position) {
        const sparkCount = 10;
        const sparks = new THREE.Group();
        
        for (let i = 0; i < sparkCount; i++) {
            const sparkGeometry = new THREE.SphereGeometry(0.02, 4, 4);
            const sparkMaterial = new THREE.MeshBasicMaterial({
                color: 0xffd700,
                transparent: true,
                opacity: 1
            });
            
            const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
            spark.position.copy(position);
            spark.position.add(new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2
            ));
            
            sparks.add(spark);
        }
        
        this.scene.add(sparks);
        
        // Animate and remove sparks
        let opacity = 1;
        const fadeOut = () => {
            opacity -= 0.05;
            sparks.children.forEach(spark => {
                spark.material.opacity = opacity;
                spark.position.y += 0.01;
            });
            
            if (opacity > 0) {
                requestAnimationFrame(fadeOut);
            } else {
                this.scene.remove(sparks);
            }
        };
        fadeOut();
    }
    
    /**
     * Show muzzle flash effect
     */
    showMuzzleFlash() {
        if (!this.muzzleFlash) return;
        
        this.muzzleFlash.material.opacity = 1;
        this.muzzleFlash.scale.setScalar(Math.random() * 0.5 + 0.5);
        this.muzzleFlash.rotation.z = Math.random() * Math.PI * 2;
        
        // Fade out quickly
        setTimeout(() => {
            this.muzzleFlash.material.opacity = 0;
        }, 50);
    }
    
    /**
     * Apply weapon recoil effect
     */
    weaponRecoil() {
        if (!this.weaponMesh) return;
        
        const originalPosition = this.weaponMesh.position.clone();
        
        // Quick recoil back
        this.weaponMesh.position.z += 0.05;
        this.weaponMesh.rotation.x -= 0.1;
        
        // Return to normal position
        setTimeout(() => {
            this.weaponMesh.position.copy(originalPosition);
            this.weaponMesh.rotation.x = 0;
        }, 100);
    }
    
    /**
     * Reload the weapon
     */
    reload() {
        if (this.isReloading || this.currentAmmo === this.maxAmmo || this.totalAmmo <= 0) {
            return false;
        }
        
        this.isReloading = true;
        
        // Play reload animation (placeholder)
        this.playReloadAnimation();
        
        // Play reload sound (placeholder)
        this.playReloadSound();
        
        setTimeout(() => {
            const ammoNeeded = this.maxAmmo - this.currentAmmo;
            const ammoToReload = Math.min(ammoNeeded, this.totalAmmo);
            
            this.currentAmmo += ammoToReload;
            this.totalAmmo -= ammoToReload;
            
            this.isReloading = false;
            this.updateAmmoUI();
        }, this.reloadTime);
        
        return true;
    }
    
    /**
     * Play reload animation
     */
    playReloadAnimation() {
        if (!this.weaponMesh) return;
        
        const originalRotation = this.weaponMesh.rotation.clone();
        
        // Simple reload animation - weapon goes down and comes back up
        this.weaponMesh.position.y -= 0.3;
        this.weaponMesh.rotation.x += 0.5;
        
        setTimeout(() => {
            this.weaponMesh.position.y += 0.3;
            this.weaponMesh.rotation.copy(originalRotation);
        }, this.reloadTime / 2);
    }
    
    /**
     * Update ammunition UI
     */
    updateAmmoUI() {
        const ammoCount = document.getElementById('ammo-count');
        const weaponName = document.getElementById('weapon-name');
        
        if (ammoCount) {
            ammoCount.textContent = this.currentAmmo;
            ammoCount.parentElement.innerHTML = `${this.currentAmmo} <span class="label">/ ${this.totalAmmo}</span>`;
        }
        
        if (weaponName) {
            weaponName.textContent = this.name;
        }
    }
    
    /**
     * Play fire sound effect
     */
    playFireSound() {
        // Placeholder for audio implementation
        console.log(`${this.name} fired`);
    }
    
    /**
     * Play reload sound effect
     */
    playReloadSound() {
        // Placeholder for audio implementation
        console.log(`${this.name} reloading`);
    }
    
    /**
     * Check if weapon can fire
     */
    canFire() {
        const now = Date.now();
        return !this.isReloading && 
               this.currentAmmo > 0 && 
               now - this.lastFireTime >= this.fireInterval;
    }
    
    /**
     * Get weapon status
     */
    getStatus() {
        return {
            name: this.name,
            currentAmmo: this.currentAmmo,
            totalAmmo: this.totalAmmo,
            isReloading: this.isReloading,
            canFire: this.canFire()
        };
    }
    
    /**
     * Cleanup weapon resources
     */
    dispose() {
        if (this.weaponMesh && this.weaponMesh.parent) {
            this.weaponMesh.parent.remove(this.weaponMesh);
        }
        
        console.log(`${this.name} disposed`);
    }
}

/**
 * Celestial Rifle - Basic automatic weapon
 */
export class CelestialRifle extends Weapon {
    constructor(gameEngine) {
        super(gameEngine, {
            name: 'Celestial Rifle',
            damage: 15,
            maxAmmo: 30,
            totalAmmo: 150,
            fireRate: 600,
            reloadTime: 2000,
            range: 100,
            spread: 0.02
        });
    }
    
    createWeaponModel() {
        const weaponGroup = new THREE.Group();
        
        // Main body
        const bodyGeometry = new THREE.BoxGeometry(0.08, 0.04, 0.5);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffd700,
            emissive: 0x221100
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        weaponGroup.add(body);
        
        // Barrel
        const barrelGeometry = new THREE.CylinderGeometry(0.008, 0.008, 0.4, 8);
        const barrelMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        barrel.rotation.z = Math.PI / 2;
        barrel.position.set(0.2, 0.01, 0);
        weaponGroup.add(barrel);
        
        // Stock
        const stockGeometry = new THREE.BoxGeometry(0.06, 0.03, 0.15);
        const stockMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const stock = new THREE.Mesh(stockGeometry, stockMaterial);
        stock.position.set(-0.2, -0.01, 0);
        weaponGroup.add(stock);
        
        this.weaponMesh = weaponGroup;
    }
}

/**
 * Divine Shotgun - High damage, close range
 */
export class DivineShotgun extends Weapon {
    constructor(gameEngine) {
        super(gameEngine, {
            name: 'Divine Shotgun',
            damage: 8, // per pellet
            maxAmmo: 8,
            totalAmmo: 32,
            fireRate: 120,
            reloadTime: 3000,
            range: 30,
            spread: 0.1
        });
        
        this.pelletsPerShot = 8;
    }
    
    createWeaponModel() {
        const weaponGroup = new THREE.Group();
        
        // Main body
        const bodyGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.4);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4169E1,
            emissive: 0x001122
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        weaponGroup.add(body);
        
        // Double barrel
        const barrel1Geometry = new THREE.CylinderGeometry(0.012, 0.012, 0.3, 8);
        const barrelMaterial = new THREE.MeshPhongMaterial({ color: 0x2F4F4F });
        
        const barrel1 = new THREE.Mesh(barrel1Geometry, barrelMaterial);
        barrel1.rotation.z = Math.PI / 2;
        barrel1.position.set(0.15, 0.015, 0);
        weaponGroup.add(barrel1);
        
        const barrel2 = new THREE.Mesh(barrel1Geometry, barrelMaterial);
        barrel2.rotation.z = Math.PI / 2;
        barrel2.position.set(0.15, -0.015, 0);
        weaponGroup.add(barrel2);
        
        this.weaponMesh = weaponGroup;
    }
    
    performRaycast() {
        // Fire multiple pellets
        for (let i = 0; i < this.pelletsPerShot; i++) {
            const raycaster = new THREE.Raycaster();
            
            const direction = new THREE.Vector3();
            this.camera.getWorldDirection(direction);
            
            // Add significant spread for shotgun
            direction.x += (Math.random() - 0.5) * this.spread;
            direction.y += (Math.random() - 0.5) * this.spread;
            direction.normalize();
            
            raycaster.set(this.camera.position, direction);
            raycaster.far = this.range;
            
            const enemies = this.gameEngine.getGameObject('enemies') || [];
            const intersects = raycaster.intersectObjects(enemies.map(e => e.mesh));
            
            if (intersects.length > 0) {
                const hit = intersects[0];
                this.handleHit(hit);
            }
            
            this.createBulletTrail(this.camera.position, direction);
        }
    }
}

/**
 * Holy Pistol - Accurate sidearm
 */
export class HolyPistol extends Weapon {
    constructor(gameEngine) {
        super(gameEngine, {
            name: 'Holy Pistol',
            damage: 20,
            maxAmmo: 12,
            totalAmmo: 60,
            fireRate: 300,
            reloadTime: 1500,
            range: 50,
            spread: 0.01
        });
    }
    
    createWeaponModel() {
        const weaponGroup = new THREE.Group();
        
        // Main body
        const bodyGeometry = new THREE.BoxGeometry(0.06, 0.04, 0.2);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xC0C0C0,
            emissive: 0x111111
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        weaponGroup.add(body);
        
        // Barrel
        const barrelGeometry = new THREE.CylinderGeometry(0.006, 0.006, 0.15, 8);
        const barrelMaterial = new THREE.MeshPhongMaterial({ color: 0x696969 });
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        barrel.rotation.z = Math.PI / 2;
        barrel.position.set(0.1, 0.01, 0);
        weaponGroup.add(barrel);
        
        // Grip
        const gripGeometry = new THREE.BoxGeometry(0.04, 0.08, 0.03);
        const gripMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const grip = new THREE.Mesh(gripGeometry, gripMaterial);
        grip.position.set(-0.05, -0.04, 0);
        weaponGroup.add(grip);
        
        this.weaponMesh = weaponGroup;
    }
}

/**
 * Archangel Cannon - Heavy weapon with explosive rounds
 */
export class ArchangelCannon extends Weapon {
    constructor(gameEngine) {
        super(gameEngine, {
            name: 'Archangel Cannon',
            damage: 50,
            maxAmmo: 5,
            totalAmmo: 20,
            fireRate: 60,
            reloadTime: 4000,
            range: 150,
            spread: 0.005
        });
    }
    
    createWeaponModel() {
        const weaponGroup = new THREE.Group();
        
        // Main body
        const bodyGeometry = new THREE.BoxGeometry(0.15, 0.08, 0.6);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFF6347,
            emissive: 0x220000
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        weaponGroup.add(body);
        
        // Large barrel
        const barrelGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8);
        const barrelMaterial = new THREE.MeshPhongMaterial({ color: 0x2F2F2F });
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        barrel.rotation.z = Math.PI / 2;
        barrel.position.set(0.25, 0.02, 0);
        weaponGroup.add(barrel);
        
        // Support
        const supportGeometry = new THREE.BoxGeometry(0.03, 0.15, 0.03);
        const supportMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
        const support = new THREE.Mesh(supportGeometry, supportMaterial);
        support.position.set(0.1, -0.1, 0);
        weaponGroup.add(support);
        
        this.weaponMesh = weaponGroup;
    }
    
    handleHit(hit) {
        // Create explosion effect
        this.createExplosion(hit.point);
        
        // Damage enemies in radius
        this.damageInRadius(hit.point, 5);
    }
    
    createExplosion(position) {
        const explosionGroup = new THREE.Group();
        
        // Central explosion
        const explosionGeometry = new THREE.SphereGeometry(2, 8, 8);
        const explosionMaterial = new THREE.MeshBasicMaterial({
            color: 0xffa500,
            transparent: true,
            opacity: 0.8
        });
        const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
        explosion.position.copy(position);
        explosionGroup.add(explosion);
        
        this.scene.add(explosionGroup);
        
        // Animate explosion
        let scale = 0.1;
        let opacity = 0.8;
        const animate = () => {
            scale += 0.3;
            opacity -= 0.05;
            
            explosion.scale.setScalar(scale);
            explosion.material.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(explosionGroup);
            }
        };
        animate();
    }
    
    damageInRadius(center, radius) {
        const enemies = this.gameEngine.getGameObject('enemies') || [];
        
        enemies.forEach(enemy => {
            const distance = enemy.position.distanceTo(center);
            if (distance <= radius) {
                const damage = this.damage * (1 - distance / radius);
                enemy.takeDamage(damage);
            }
        });
    }
}