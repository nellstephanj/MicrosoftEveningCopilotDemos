// Game state variables
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let lives = 3;
let level = 1;

// Game objects
let frog;
let bugs = [];
let frogProjectiles = [];
let venomProjectiles = [];
let particles = [];
let powerUps = [];

// Game settings
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const FPS = 60;

// Timing variables
let lastBugSpawn = 0;
let bugSpawnRate = 2000; // milliseconds
let lastPowerUpSpawn = 0;
let powerUpSpawnRate = 15000; // milliseconds (15 seconds)
let difficultyIncrease = 0;

// Power-up state variables
let activePowerUps = [];
let rapidFireActive = false;
let shieldActive = false;
let multiShotActive = false;
let scoreBonusActive = false;

function setup() {
    let canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.parent('game-canvas');
    frameRate(FPS);
    
    console.log("Game setup complete");
    
    // Initialize game objects
    initializeGame();
}

function draw() {
    // River background
    drawBackground();
    
    if (gameState === 'playing') {
        updateGame();
        drawGame();
    } else if (gameState === 'start') {
        // Show start message on canvas
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(24);
        text("Press Start to Begin", CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
    } else if (gameState === 'gameOver') {
        // Show game over message on canvas
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(24);
        text("Game Over", CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
    }
}

function initializeGame() {
    console.log("Initializing game...");
    
    // Create frog player
    frog = new Frog(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80);
    console.log("Frog created at:", frog.x, frog.y);
    
    // Reset game variables
    bugs = [];
    frogProjectiles = [];
    venomProjectiles = [];
    particles = [];
    powerUps = [];
    activePowerUps = [];
    score = 0;
    lives = 3;
    level = 1;
    lastBugSpawn = 0;
    lastPowerUpSpawn = 0;
    rapidFireActive = false;
    shieldActive = false;
    multiShotActive = false;
    scoreBonusActive = false;
    
    updateUI();
    console.log("Game initialized successfully");
}

function updateGame() {
    // Update frog
    frog.update();
    
    // Spawn bugs
    if (millis() - lastBugSpawn > bugSpawnRate) {
        spawnBug();
        lastBugSpawn = millis();
    }
    
    // Spawn power-ups occasionally
    if (millis() - lastPowerUpSpawn > powerUpSpawnRate) {
        spawnPowerUp();
        lastPowerUpSpawn = millis();
    }
    
    // Update bugs
    for (let i = bugs.length - 1; i >= 0; i--) {
        bugs[i].update();
        
        // Remove bugs that are off screen
        if (bugs[i].y > CANVAS_HEIGHT + 50) {
            bugs.splice(i, 1);
            continue;
        }
        
        // Bug shooting venom
        if (bugs[i].shouldShoot()) {
            let venomType = bugs[i].venomType;
            venomProjectiles.push(new Projectile(bugs[i].x, bugs[i].y + 20, 0, 3, venomType));
        }
    }
    
    // Update projectiles
    updateProjectiles();
    
    // Update power-ups
    updatePowerUps();
    
    // Update particles
    updateParticles();
    
    // Update active power-up effects
    updateActivePowerUps();
    
    // Check collisions
    checkCollisions();
    
    // Increase difficulty over time
    increaseDifficulty();
    
    // Check game over conditions
    if (lives <= 0) {
        gameOver();
    }
}

function drawGame() {
    // Draw frog
    frog.draw();
    
    // Draw bugs
    for (let bug of bugs) {
        bug.draw();
    }
    
    // Draw projectiles
    for (let projectile of frogProjectiles) {
        projectile.draw();
    }
    
    for (let projectile of venomProjectiles) {
        projectile.draw();
    }
    
    // Draw particles
    for (let particle of particles) {
        particle.draw();
    }
    
    // Draw power-ups
    for (let powerUp of powerUps) {
        powerUp.draw();
    }
    
    // Draw active power-up indicators
    drawPowerUpIndicators();
}

function drawBackground() {
    // River gradient background
    for (let i = 0; i <= height; i++) {
        let inter = map(i, 0, height, 0, 1);
        let c = lerpColor(color(0, 100, 150), color(0, 50, 100), inter);
        stroke(c);
        line(0, i, width, i);
    }
    
    // Water ripples effect
    stroke(255, 255, 255, 30);
    strokeWeight(1);
    for (let i = 0; i < 5; i++) {
        let rippleY = (millis() * 0.05 + i * 50) % height;
        line(0, rippleY, width, rippleY);
    }
    
    // River plants/reeds on sides
    fill(34, 139, 34, 100);
    noStroke();
    for (let i = 0; i < 10; i++) {
        let x = i * 15;
        let h = random(30, 80);
        rect(x, height - h, 8, h);
        rect(width - x - 8, height - h, 8, h);
    }
}

function spawnBug() {
    let bugType = random(['mosquito', 'wasp', 'beetle']);
    let x = random(50, CANVAS_WIDTH - 50);
    bugs.push(new Bug(x, -30, bugType));
}

function spawnPowerUp() {
    let powerUpTypes = ['rapid_fire', 'shield', 'multi_shot', 'health', 'score_boost'];
    let type = random(powerUpTypes);
    let x = random(50, CANVAS_WIDTH - 50);
    powerUps.push(new PowerUp(x, -30, type));
}

function updateProjectiles() {
    // Update frog projectiles
    for (let i = frogProjectiles.length - 1; i >= 0; i--) {
        frogProjectiles[i].update();
        if (frogProjectiles[i].isOffScreen()) {
            frogProjectiles.splice(i, 1);
        }
    }
    
    // Update venom projectiles
    for (let i = venomProjectiles.length - 1; i >= 0; i--) {
        venomProjectiles[i].update();
        if (venomProjectiles[i].isOffScreen()) {
            venomProjectiles.splice(i, 1);
        }
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }
}

function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].update();
        
        // Check collision with frog
        if (powerUps[i].collidesWith(frog)) {
            let effect = powerUps[i].getEffect();
            powerUps[i].collect();
            applyPowerUpEffect(effect);
            powerUps.splice(i, 1);
            continue;
        }
        
        // Remove expired power-ups
        if (powerUps[i].isExpired()) {
            powerUps.splice(i, 1);
        }
    }
}

function updateActivePowerUps() {
    for (let i = activePowerUps.length - 1; i >= 0; i--) {
        activePowerUps[i].timeLeft -= 1000 / FPS; // Decrease by frame time
        
        if (activePowerUps[i].timeLeft <= 0) {
            removePowerUpEffect(activePowerUps[i]);
            activePowerUps.splice(i, 1);
        }
    }
}

function checkCollisions() {
    // Frog projectiles vs bugs
    for (let i = frogProjectiles.length - 1; i >= 0; i--) {
        for (let j = bugs.length - 1; j >= 0; j--) {
            if (frogProjectiles[i].collidesWith(bugs[j])) {
                // Create explosion particles
                triggerEnemyDestroyed(bugs[j].x, bugs[j].y);
                
                // Remove projectile and bug
                frogProjectiles.splice(i, 1);
                bugs.splice(j, 1);
                
                // Increase score
                let baseScore = 10;
                let finalScore = scoreBonusActive ? baseScore * 2 : baseScore;
                score += finalScore;
                updateUI();
                break;
            }
        }
    }
    
    // Venom projectiles vs frog
    for (let i = venomProjectiles.length - 1; i >= 0; i--) {
        if (venomProjectiles[i].collidesWith(frog)) {
            // Remove projectile
            venomProjectiles.splice(i, 1);
            
            // Check if frog is shielded
            if (frog.shielded) {
                // Shield absorbs hit
                createSparks(frog.x, frog.y, 8);
                continue;
            }
            
            // Create hit effect
            triggerHit();
            
            // Decrease lives
            lives--;
            updateUI();
            
            // Brief invincibility
            frog.hit();
        }
    }
    
    // Bugs vs frog (direct collision)
    for (let i = bugs.length - 1; i >= 0; i--) {
        if (bugs[i].collidesWith(frog) && !frog.isInvincible()) {
            // Remove bug
            bugs.splice(i, 1);
            
            // Check if frog is shielded
            if (frog.shielded) {
                // Shield absorbs hit
                createSparks(frog.x, frog.y, 8);
                continue;
            }
            
            // Create explosion
            triggerHit();
            
            // Decrease lives
            lives--;
            updateUI();
            
            // Brief invincibility
            frog.hit();
        }
    }
}

function increaseDifficulty() {
    // Increase difficulty every 30 seconds
    let currentTime = millis();
    let newDifficultyLevel = Math.floor(currentTime / 30000);
    
    if (newDifficultyLevel > difficultyIncrease) {
        difficultyIncrease = newDifficultyLevel;
        level = difficultyIncrease + 1;
        
        // Decrease bug spawn rate (more frequent spawning)
        bugSpawnRate = Math.max(500, bugSpawnRate - 200);
        
        updateUI();
    }
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function updateUI() {
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('lives').textContent = `Lives: ${lives}`;
    document.getElementById('level').textContent = `Level: ${level}`;
}

function gameOver() {
    gameState = 'gameOver';
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over-screen').style.display = 'block';
    triggerGameOver();
}

function startGame() {
    console.log("Starting game...");
    gameState = 'playing';
    document.getElementById('start-screen').style.display = 'none';
    initializeGame();
    triggerGameStart();
    console.log("Game started, state:", gameState);
}

function restartGame() {
    gameState = 'playing';
    document.getElementById('game-over-screen').style.display = 'none';
    initializeGame();
}

// Keyboard controls
let lastShotTime = 0;
let shotCooldown = 300; // milliseconds

function keyPressed() {
    if (gameState === 'playing') {
        if (key === ' ') {
            // Check shot cooldown
            let currentCooldown = rapidFireActive ? 100 : shotCooldown;
            if (millis() - lastShotTime > currentCooldown) {
                // Frog shoots
                if (multiShotActive) {
                    // Multi-shot: fire 3 projectiles
                    frogProjectiles.push(new Projectile(frog.x - 15, frog.y - 20, -2, -8, 'tongue'));
                    frogProjectiles.push(new Projectile(frog.x, frog.y - 20, 0, -8, 'tongue'));
                    frogProjectiles.push(new Projectile(frog.x + 15, frog.y - 20, 2, -8, 'tongue'));
                } else {
                    // Single shot
                    frogProjectiles.push(new Projectile(frog.x, frog.y - 20, 0, -8, 'tongue'));
                }
                triggerShoot();
                lastShotTime = millis();
            }
        }
    }
    
    if (keyCode === ENTER) {
        if (gameState === 'gameOver') {
            restartGame();
        } else if (gameState === 'start') {
            startGame();
        }
    }
}

// Prevent spacebar from scrolling page
function keyTyped() {
    if (key === ' ') {
        return false;
    }
}

function applyPowerUpEffect(effect) {
    switch (effect.type) {
        case 'rapid_fire':
            rapidFireActive = true;
            activePowerUps.push({ type: 'rapid_fire', timeLeft: effect.duration });
            break;
            
        case 'shield':
            shieldActive = true;
            frog.shielded = true;
            activePowerUps.push({ type: 'shield', timeLeft: effect.duration });
            break;
            
        case 'multi_shot':
            multiShotActive = true;
            activePowerUps.push({ type: 'multi_shot', timeLeft: effect.duration });
            break;
            
        case 'health':
            lives = Math.min(lives + effect.value, 5); // Max 5 lives
            updateUI();
            break;
            
        case 'score_boost':
            scoreBonusActive = true;
            activePowerUps.push({ type: 'score_boost', timeLeft: effect.duration });
            break;
    }
}

function removePowerUpEffect(effect) {
    switch (effect.type) {
        case 'rapid_fire':
            rapidFireActive = false;
            break;
            
        case 'shield':
            shieldActive = false;
            if (frog) frog.shielded = false;
            break;
            
        case 'multi_shot':
            multiShotActive = false;
            break;
            
        case 'score_boost':
            scoreBonusActive = false;
            break;
    }
}

function drawPowerUpIndicators() {
    let x = 10;
    let y = 10;
    
    for (let powerUp of activePowerUps) {
        push();
        translate(x, y);
        
        // Background
        fill(0, 0, 0, 150);
        stroke(255);
        strokeWeight(1);
        rect(0, 0, 100, 20);
        
        // Icon and text
        fill(255);
        noStroke();
        textAlign(LEFT, CENTER);
        textSize(12);
        text(powerUp.type.replace('_', ' '), 5, 10);
        
        // Timer bar
        let timePercent = powerUp.timeLeft / getPowerUpDuration(powerUp.type);
        fill(100, 255, 100);
        rect(0, 16, 100 * timePercent, 4);
        
        pop();
        y += 25;
    }
}

function getPowerUpDuration(type) {
    switch (type) {
        case 'rapid_fire': return 5000;
        case 'shield': return 8000;
        case 'multi_shot': return 6000;
        case 'score_boost': return 10000;
        default: return 1000;
    }
}