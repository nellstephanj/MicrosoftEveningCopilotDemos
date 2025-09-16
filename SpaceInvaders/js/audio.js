// Simplified audio system without p5.sound to avoid worklet issues
// Note: This uses Web Audio API directly for better compatibility

let audioContext = null;
let audioEnabled = true;
let musicEnabled = true;
let sfxVolume = 0.5;
let musicVolume = 0.3;

// Initialize audio system
function initAudio() {
    try {
        // Create audio context on user interaction
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        console.log("Audio system initialized");
    } catch (e) {
        console.log("Audio not supported:", e);
        audioEnabled = false;
    }
}

// Simple beep function using Web Audio API
function createBeep(frequency, duration, volume = 0.3) {
    if (!audioEnabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(volume * sfxVolume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        console.log("Audio playback error:", e);
    }
}

// Play shoot sound
function playShootSound() {
    createBeep(800, 0.1);
}

// Play hit sound (when frog gets hit)
function playHitSound() {
    createBeep(200, 0.3);
}

// Play enemy hit sound
function playEnemyHitSound() {
    createBeep(600, 0.1);
}

// Play explosion sound
function playExplosionSound() {
    createBeep(150, 0.4);
}

// Play power-up sound
function playPowerUpSound() {
    // Rising tone
    createBeep(400, 0.1);
    setTimeout(() => createBeep(600, 0.1), 100);
    setTimeout(() => createBeep(800, 0.1), 200);
}

// Play game over sound
function playGameOverSound() {
    // Descending tone
    createBeep(400, 0.3);
    setTimeout(() => createBeep(300, 0.3), 300);
    setTimeout(() => createBeep(200, 0.5), 600);
}

// Background music placeholder
function startBackgroundMusic() {
    console.log("Background music would start here");
}

function stopBackgroundMusic() {
    console.log("Background music would stop here");
}

// Audio control functions
function toggleAudio() {
    audioEnabled = !audioEnabled;
    return audioEnabled;
}

function toggleMusic() {
    musicEnabled = !musicEnabled;
    return musicEnabled;
}

function setSfxVolume(volume) {
    sfxVolume = Math.max(0, Math.min(1, volume));
}

function setMusicVolume(volume) {
    musicVolume = Math.max(0, Math.min(1, volume));
}

// Trigger sound effects from game events
function triggerShoot() {
    console.log("Shoot triggered");
    playShootSound();
    if (typeof frog !== 'undefined' && frog) {
        frog.shoot(); // Trigger frog tongue animation
    }
}

function triggerHit() {
    console.log("Hit triggered");
    playHitSound();
    if (typeof createExplosion !== 'undefined' && typeof frog !== 'undefined' && frog) {
        createExplosion(frog.x, frog.y, 'red', 6);
    }
}

function triggerEnemyDestroyed(x, y) {
    console.log("Enemy destroyed at", x, y);
    playEnemyHitSound();
    playExplosionSound();
    if (typeof createExplosion !== 'undefined') {
        createExplosion(x, y, 'green', 10);
    }
    if (typeof createSparks !== 'undefined') {
        createSparks(x, y, 5);
    }
}

function triggerGameStart() {
    console.log("Game start triggered");
    // Initialize audio context on first user interaction
    initAudio();
    if (audioEnabled && musicEnabled) {
        startBackgroundMusic();
    }
}

function triggerGameOver() {
    playGameOverSound();
    stopBackgroundMusic();
}

// Initialize audio when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("Audio system ready - will initialize on first user interaction");
    
    // Add click listener to initialize audio context
    document.addEventListener('click', function initAudioOnClick() {
        initAudio();
        document.removeEventListener('click', initAudioOnClick);
    }, { once: true });
});