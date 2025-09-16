import { GameEngine } from './engine/GameEngine.js';
import { Player } from './player/Player.js';
import { Environment } from './environment/Environment.js';
import { WeaponSystem } from './weapons/WeaponSystem.js';
import { FallenAngel, DarkSpirit, CorruptedGuardian } from './enemies/Enemy.js';

/**
 * Main Game class - coordinates all game systems
 */
class MoodGame {
    constructor() {
        this.engine = null;
        this.player = null;
        this.environment = null;
        this.weaponSystem = null;
        this.enemies = [];
        
        // Game state
        this.score = 0;
        this.enemiesKilled = 0;
        this.gameStartTime = 0;
        this.level = 1;
        
        // Spawning
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 5000; // 5 seconds
        this.maxEnemies = 8;
        
        this.init();
    }
    
    /**
     * Initialize the game
     */
    init() {
        this.setupLoadingScreen();
        this.setupMenuSystem();
        this.initializeGame();
    }
    
    /**
     * Setup loading screen
     */
    setupLoadingScreen() {
        // Simulate loading time
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
        }, 3000);
    }
    
    /**
     * Setup menu system event handlers
     */
    setupMenuSystem() {
        // Start game button
        const startBtn = document.getElementById('start-game');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startGame();
            });
        }
        
        // Resume game button
        const resumeBtn = document.getElementById('resume-game');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                this.resumeGame();
            });
        }
        
        // Restart game button
        const restartBtn = document.getElementById('restart-game');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.restartGame();
            });
        }
        
        // Exit to menu button
        const exitBtn = document.getElementById('exit-game');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                this.exitToMenu();
            });
        }
        
        // Controls button
        const controlsBtn = document.getElementById('controls');
        if (controlsBtn) {
            controlsBtn.addEventListener('click', () => {
                this.showControls();
            });
        }
        
        // Close controls button
        const closeControlsBtn = document.getElementById('close-controls');
        if (closeControlsBtn) {
            closeControlsBtn.addEventListener('click', () => {
                this.hideControls();
            });
        }
        
        // Play again button
        const playAgainBtn = document.getElementById('play-again');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                this.restartGame();
            });
        }
        
        // Main menu button
        const mainMenuBtn = document.getElementById('main-menu-btn');
        if (mainMenuBtn) {
            mainMenuBtn.addEventListener('click', () => {
                this.exitToMenu();
            });
        }
    }
    
    /**
     * Initialize game systems
     */
    initializeGame() {
        console.log('Initializing Mood game...');
        
        // Create game engine first
        this.engine = new GameEngine();
        
        // Wait for engine to be fully ready before creating other systems
        this.engine.waitForReady().then(() => {
            // Verify physics world is available
            if (!this.engine.world) {
                console.error('Physics world not initialized in GameEngine');
                return;
            }
            
            console.log('GameEngine is ready, creating game systems...');
            console.log('Physics world:', this.engine.world); // Debug log
            
            // Create environment first (needed for spawn points)
            this.environment = new Environment(this.engine);
            this.engine.addGameObject('environment', this.environment);
            
            // Create player after environment
            this.player = new Player(this.engine);
            this.engine.addGameObject('player', this.player);
            
            // Create weapon system
            this.weaponSystem = new WeaponSystem(this.engine);
            this.engine.addGameObject('weaponSystem', this.weaponSystem);
            
            // Override engine weapon methods
            this.engine.triggerShoot = () => this.weaponSystem.fire();
            this.engine.triggerReload = () => this.weaponSystem.reload();
            this.engine.switchWeapon = (index) => this.weaponSystem.switchToWeapon(index);
            
            // Add continuous fire support
            this.setupContinuousFire();
            
            console.log('Game initialized successfully');
        }); // End of waitForReady promise
    }
    
    /**
     * Setup continuous fire when mouse is held down
     */
    setupContinuousFire() {
        let firing = false;
        let fireInterval;
        
        document.addEventListener('mousedown', (event) => {
            if (event.button === 0 && this.engine.gameState === 'playing') {
                firing = true;
                this.weaponSystem.fire(); // Immediate fire
                
                fireInterval = setInterval(() => {
                    if (firing && this.weaponSystem.canFire()) {
                        this.weaponSystem.fire();
                    }
                }, 100); // Check every 100ms
            }
        });
        
        document.addEventListener('mouseup', (event) => {
            if (event.button === 0) {
                firing = false;
                if (fireInterval) {
                    clearInterval(fireInterval);
                }
            }
        });
    }
    
    /**
     * Start the game
     */
    startGame() {
        console.log('Starting Mood game...');
        
        // Hide menu
        document.getElementById('main-menu').style.display = 'none';
        
        // Reset game state
        this.score = 0;
        this.enemiesKilled = 0;
        this.level = 1;
        this.gameStartTime = Date.now();
        
        // Clear existing enemies
        this.clearEnemies();
        
        // Reset player
        if (this.player) {
            this.player.respawn();
        }
        
        // Start engine
        this.engine.startGame();
        
        // Start enemy spawning
        this.startEnemySpawning();
        
        console.log('Game started!');
    }
    
    /**
     * Resume the game from pause
     */
    resumeGame() {
        document.getElementById('pause-menu').style.display = 'none';
        this.engine.resumeGame();
    }
    
    /**
     * Restart the game
     */
    restartGame() {
        // Hide all menus
        document.getElementById('pause-menu').style.display = 'none';
        document.getElementById('game-over').style.display = 'none';
        
        // Reset and start
        this.startGame();
    }
    
    /**
     * Exit to main menu
     */
    exitToMenu() {
        // Stop game
        this.engine.stopGame();
        
        // Clear enemies
        this.clearEnemies();
        
        // Hide all menus except main menu
        document.getElementById('pause-menu').style.display = 'none';
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('main-menu').style.display = 'flex';
    }
    
    /**
     * Show controls help
     */
    showControls() {
        document.getElementById('controls-help').style.display = 'flex';
    }
    
    /**
     * Hide controls help
     */
    hideControls() {
        document.getElementById('controls-help').style.display = 'none';
    }
    
    /**
     * Start enemy spawning system
     */
    startEnemySpawning() {
        this.enemySpawnTimer = 0;
        
        // Delay spawning until environment is ready
        const checkEnvironment = () => {
            if (this.environment && this.engine.world && this.engine.world.add) {
                console.log('Environment and physics world ready, spawning enemies...');
                
                // Add additional delay to ensure everything is fully initialized
                setTimeout(() => {
                    // Spawn initial enemies
                    this.spawnInitialEnemies();
                    
                    // Add spawn update to engine
                    this.engine.addGameObject('enemySpawner', {
                        update: (deltaTime) => this.updateEnemySpawning(deltaTime)
                    });
                }, 500); // 500ms delay to ensure everything is ready
            } else {
                console.log('Waiting for environment and physics world...');
                // Check again in 100ms
                setTimeout(checkEnvironment, 100);
            }
        };
        
        checkEnvironment();
    }
    
    /**
     * Spawn initial enemies
     */
    spawnInitialEnemies() {
        if (!this.environment) {
            console.warn('Environment not ready for enemy spawning');
            return;
        }
        
        const spawnPoints = this.environment.getEnemySpawnPoints();
        const initialEnemyCount = Math.min(3, spawnPoints.length);
        
        for (let i = 0; i < initialEnemyCount; i++) {
            const spawnPoint = spawnPoints[i];
            this.spawnRandomEnemy(spawnPoint);
        }
    }
    
    /**
     * Update enemy spawning
     */
    updateEnemySpawning(deltaTime) {
        this.enemySpawnTimer += deltaTime * 1000;
        
        if (this.enemySpawnTimer >= this.enemySpawnInterval && 
            this.enemies.length < this.maxEnemies &&
            this.environment) {
            
            const spawnPoints = this.environment.getEnemySpawnPoints();
            const randomSpawnPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
            
            this.spawnRandomEnemy(randomSpawnPoint);
            this.enemySpawnTimer = 0;
        }
        
        // Clean up dead enemies
        this.cleanupDeadEnemies();
    }
    
    /**
     * Spawn a random enemy type
     */
    spawnRandomEnemy(position) {
        const enemyTypes = [FallenAngel, DarkSpirit, CorruptedGuardian];
        const weights = [0.4, 0.4, 0.2]; // 40% fallen angel, 40% dark spirit, 20% corrupted guardian
        
        const random = Math.random();
        let cumulativeWeight = 0;
        let selectedType = enemyTypes[0];
        
        for (let i = 0; i < enemyTypes.length; i++) {
            cumulativeWeight += weights[i];
            if (random <= cumulativeWeight) {
                selectedType = enemyTypes[i];
                break;
            }
        }
        
        const enemy = new selectedType(this.engine, position);
        
        // Ensure enemy has access to physics world
        if (!enemy.world) {
            console.warn('Enemy created without physics world access, attempting fix...');
            enemy.world = this.engine.world;
            // Retry physics body creation if needed
            if (!enemy.body && enemy.createPhysicsBody) {
                enemy.createPhysicsBody();
            }
        }
        
        this.enemies.push(enemy);
        
        // Add enemy update to engine
        this.engine.addGameObject(`enemy_${this.enemies.length}`, enemy);
        
        console.log(`Spawned ${enemy.constructor.name} at`, position);
    }
    
    /**
     * Clean up dead enemies
     */
    cleanupDeadEnemies() {
        this.enemies = this.enemies.filter(enemy => {
            if (!enemy.isAlive) {
                this.enemiesKilled++;
                this.score += 100; // Points per enemy
                this.updateScoreDisplay();
                
                // Remove from engine
                this.engine.removeGameObject(`enemy_${this.enemies.indexOf(enemy) + 1}`);
                
                return false;
            }
            return true;
        });
    }
    
    /**
     * Clear all enemies
     */
    clearEnemies() {
        this.enemies.forEach((enemy, index) => {
            enemy.dispose();
            this.engine.removeGameObject(`enemy_${index + 1}`);
        });
        this.enemies = [];
    }
    
    /**
     * Update score display
     */
    updateScoreDisplay() {
        // This could be expanded to show score in game UI
        console.log(`Score: ${this.score}, Enemies Killed: ${this.enemiesKilled}`);
    }
    
    /**
     * Handle game over
     */
    gameOver(victory = false) {
        this.engine.gameState = 'gameOver';
        
        const gameOverTitle = document.getElementById('game-over-title');
        const gameOverMessage = document.getElementById('game-over-message');
        const finalScore = document.getElementById('final-score');
        const enemiesDefeated = document.getElementById('enemies-defeated');
        
        if (victory) {
            gameOverTitle.textContent = 'DIVINE VICTORY';
            gameOverMessage.textContent = 'You have cleansed heaven of darkness!';
        } else {
            gameOverTitle.textContent = 'FALLEN ANGEL';
            gameOverMessage.textContent = 'Darkness has consumed heaven...';
        }
        
        if (finalScore) finalScore.textContent = this.score;
        if (enemiesDefeated) enemiesDefeated.textContent = this.enemiesKilled;
        
        document.getElementById('game-over').style.display = 'flex';
        document.exitPointerLock();
    }
    
    /**
     * Main game update loop (called by engine)
     */
    update(deltaTime) {
        // Check for pause
        if (this.engine.gameState === 'paused') {
            document.getElementById('pause-menu').style.display = 'flex';
        } else {
            document.getElementById('pause-menu').style.display = 'none';
        }
        
        // Check win condition (no enemies and high score)
        if (this.enemies.length === 0 && this.enemiesKilled >= 20) {
            this.gameOver(true);
        }
    }
    
    /**
     * Cleanup game resources
     */
    dispose() {
        if (this.engine) {
            this.engine.dispose();
        }
        
        this.clearEnemies();
        
        console.log('Game disposed');
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing MOOD - Heavenly Combat...');
    
    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Create and start the game
    window.moodGame = new MoodGame();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.moodGame) {
        window.moodGame.dispose();
    }
});

export default MoodGame;