import { CelestialRifle, DivineShotgun, HolyPistol, ArchangelCannon } from './Weapon.js';

/**
 * WeaponSystem - manages all weapons and weapon switching
 */
export class WeaponSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        this.weapons = [];
        this.currentWeaponIndex = 0;
        this.currentWeapon = null;
        
        this.init();
    }
    
    /**
     * Initialize the weapon system
     */
    init() {
        // Create all available weapons
        this.weapons = [
            new HolyPistol(this.gameEngine),
            new CelestialRifle(this.gameEngine),
            new DivineShotgun(this.gameEngine),
            new ArchangelCannon(this.gameEngine)
        ];
        
        // Set starting weapon
        this.switchToWeapon(0);
        
        console.log('Weapon system initialized with', this.weapons.length, 'weapons');
    }
    
    /**
     * Switch to weapon by index
     */
    switchToWeapon(index) {
        if (index < 0 || index >= this.weapons.length) {
            return false;
        }
        
        // Hide current weapon
        if (this.currentWeapon) {
            if (this.currentWeapon.weaponMesh) {
                this.currentWeapon.weaponMesh.visible = false;
            }
        }
        
        // Switch to new weapon
        this.currentWeaponIndex = index;
        this.currentWeapon = this.weapons[index];
        
        // Show new weapon
        if (this.currentWeapon.weaponMesh) {
            this.currentWeapon.weaponMesh.visible = true;
        }
        
        // Update UI
        this.currentWeapon.updateAmmoUI();
        
        console.log('Switched to', this.currentWeapon.name);
        return true;
    }
    
    /**
     * Switch to next weapon
     */
    nextWeapon() {
        const nextIndex = (this.currentWeaponIndex + 1) % this.weapons.length;
        return this.switchToWeapon(nextIndex);
    }
    
    /**
     * Switch to previous weapon
     */
    previousWeapon() {
        const prevIndex = (this.currentWeaponIndex - 1 + this.weapons.length) % this.weapons.length;
        return this.switchToWeapon(prevIndex);
    }
    
    /**
     * Fire current weapon
     */
    fire() {
        if (this.currentWeapon) {
            return this.currentWeapon.fire();
        }
        return false;
    }
    
    /**
     * Reload current weapon
     */
    reload() {
        if (this.currentWeapon) {
            return this.currentWeapon.reload();
        }
        return false;
    }
    
    /**
     * Get current weapon status
     */
    getCurrentWeaponStatus() {
        if (this.currentWeapon) {
            return this.currentWeapon.getStatus();
        }
        return null;
    }
    
    /**
     * Check if current weapon can fire
     */
    canFire() {
        if (this.currentWeapon) {
            return this.currentWeapon.canFire();
        }
        return false;
    }
    
    /**
     * Get weapon by index
     */
    getWeapon(index) {
        if (index >= 0 && index < this.weapons.length) {
            return this.weapons[index];
        }
        return null;
    }
    
    /**
     * Get all weapons
     */
    getAllWeapons() {
        return this.weapons.map(weapon => weapon.getStatus());
    }
    
    /**
     * Cleanup weapon system
     */
    dispose() {
        this.weapons.forEach(weapon => weapon.dispose());
        this.weapons = [];
        this.currentWeapon = null;
        
        console.log('Weapon system disposed');
    }
}