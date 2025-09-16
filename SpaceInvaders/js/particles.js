class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type || 'explosion';
        this.vx = random(-5, 5);
        this.vy = random(-8, -2);
        this.life = this.getLifeByType();
        this.maxLife = this.life;
        this.size = this.getSizeByType();
        this.color = this.getColorByType();
        this.gravity = this.getGravityByType();
        this.friction = this.getFrictionByType();
        this.rotation = 0;
        this.rotationSpeed = random(-0.3, 0.3);
        this.alpha = 255;
    }
    
    getLifeByType() {
        switch (this.type) {
            case 'green': return random(20, 40);
            case 'red': return random(15, 30);
            case 'explosion': return random(25, 45);
            case 'water_splash': return random(30, 50);
            case 'spark': return random(10, 25);
            case 'smoke': return random(40, 80);
            default: return 30;
        }
    }
    
    getSizeByType() {
        switch (this.type) {
            case 'green': return random(3, 8);
            case 'red': return random(4, 10);
            case 'explosion': return random(5, 12);
            case 'water_splash': return random(2, 6);
            case 'spark': return random(1, 4);
            case 'smoke': return random(8, 15);
            default: return random(3, 8);
        }
    }
    
    getColorByType() {
        switch (this.type) {
            case 'green': return color(random(100, 255), random(200, 255), random(50, 150));
            case 'red': return color(random(200, 255), random(50, 100), random(0, 50));
            case 'explosion': return color(random(200, 255), random(100, 200), 0);
            case 'water_splash': return color(random(100, 200), random(150, 255), random(200, 255));
            case 'spark': return color(255, random(200, 255), random(100, 200));
            case 'smoke': return color(random(50, 100), random(50, 100), random(50, 100));
            default: return color(255, 255, 255);
        }
    }
    
    getGravityByType() {
        switch (this.type) {
            case 'green': return 0.1;
            case 'red': return 0.15;
            case 'explosion': return 0.2;
            case 'water_splash': return 0.3;
            case 'spark': return 0.05;
            case 'smoke': return -0.1; // rises up
            default: return 0.1;
        }
    }
    
    getFrictionByType() {
        switch (this.type) {
            case 'green': return 0.98;
            case 'red': return 0.97;
            case 'explosion': return 0.95;
            case 'water_splash': return 0.92;
            case 'spark': return 0.99;
            case 'smoke': return 0.99;
            default: return 0.98;
        }
    }
    
    update() {
        // Apply physics
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Update rotation
        this.rotation += this.rotationSpeed;
        
        // Update life and alpha
        this.life--;
        this.alpha = map(this.life, 0, this.maxLife, 0, 255);
        
        // Special behaviors
        switch (this.type) {
            case 'spark':
                // Sparks flicker
                this.alpha *= random(0.5, 1.0);
                break;
                
            case 'smoke':
                // Smoke expands and fades
                this.size += 0.2;
                this.alpha *= 0.95;
                break;
                
            case 'water_splash':
                // Water particles have more random movement
                this.vx += random(-0.5, 0.5);
                break;
        }
    }
    
    draw() {
        push();
        translate(this.x, this.y);
        rotate(this.rotation);
        
        // Set color with alpha
        let particleColor = color(
            red(this.color),
            green(this.color),
            blue(this.color),
            this.alpha
        );
        
        switch (this.type) {
            case 'green':
                this.drawGreenParticle(particleColor);
                break;
            case 'red':
                this.drawRedParticle(particleColor);
                break;
            case 'explosion':
                this.drawExplosionParticle(particleColor);
                break;
            case 'water_splash':
                this.drawWaterSplash(particleColor);
                break;
            case 'spark':
                this.drawSpark(particleColor);
                break;
            case 'smoke':
                this.drawSmoke(particleColor);
                break;
            default:
                this.drawBasicParticle(particleColor);
        }
        
        pop();
    }
    
    drawGreenParticle(particleColor) {
        // Bug destruction particles
        fill(particleColor);
        noStroke();
        
        // Star shape
        beginShape();
        for (let i = 0; i < 5; i++) {
            let angle = (TWO_PI / 5) * i;
            let x1 = cos(angle) * this.size;
            let y1 = sin(angle) * this.size;
            vertex(x1, y1);
            
            angle += TWO_PI / 10;
            let x2 = cos(angle) * this.size * 0.5;
            let y2 = sin(angle) * this.size * 0.5;
            vertex(x2, y2);
        }
        endShape(CLOSE);
    }
    
    drawRedParticle(particleColor) {
        // Damage/hit particles
        fill(particleColor);
        stroke(255, 100, 100, this.alpha);
        strokeWeight(1);
        
        // Cross shape
        rectMode(CENTER);
        rect(0, 0, this.size * 2, this.size * 0.5);
        rect(0, 0, this.size * 0.5, this.size * 2);
    }
    
    drawExplosionParticle(particleColor) {
        // General explosion particles
        fill(particleColor);
        stroke(255, 200, 0, this.alpha);
        strokeWeight(1);
        
        // Diamond shape
        beginShape();
        vertex(0, -this.size);
        vertex(this.size, 0);
        vertex(0, this.size);
        vertex(-this.size, 0);
        endShape(CLOSE);
    }
    
    drawWaterSplash(particleColor) {
        // Water splash particles
        fill(particleColor);
        noStroke();
        
        // Circular drops
        ellipse(0, 0, this.size, this.size);
        
        // Add highlight
        fill(255, 255, 255, this.alpha * 0.5);
        ellipse(-this.size * 0.2, -this.size * 0.2, this.size * 0.4, this.size * 0.4);
    }
    
    drawSpark(particleColor) {
        // Electric/energy sparks
        stroke(particleColor);
        strokeWeight(2);
        
        // Lightning-like lines
        for (let i = 0; i < 3; i++) {
            let x1 = random(-this.size, this.size);
            let y1 = random(-this.size, this.size);
            let x2 = random(-this.size, this.size);
            let y2 = random(-this.size, this.size);
            line(x1, y1, x2, y2);
        }
    }
    
    drawSmoke(particleColor) {
        // Smoke particles
        fill(particleColor);
        noStroke();
        
        // Wispy cloud shape
        for (let i = 0; i < 4; i++) {
            let offsetX = random(-this.size * 0.3, this.size * 0.3);
            let offsetY = random(-this.size * 0.3, this.size * 0.3);
            let cloudSize = this.size + random(-this.size * 0.2, this.size * 0.2);
            ellipse(offsetX, offsetY, cloudSize, cloudSize);
        }
    }
    
    drawBasicParticle(particleColor) {
        fill(particleColor);
        noStroke();
        ellipse(0, 0, this.size, this.size);
    }
    
    isDead() {
        return this.life <= 0 || this.alpha <= 0;
    }
}

// Utility functions for creating particle effects
function createExplosion(x, y, type, count = 8) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x + random(-10, 10), y + random(-10, 10), type));
    }
}

function createWaterSplash(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x + random(-15, 15), y + random(-5, 5), 'water_splash'));
    }
}

function createSparks(x, y, count = 6) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x + random(-8, 8), y + random(-8, 8), 'spark'));
    }
}

function createSmoke(x, y, count = 4) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x + random(-12, 12), y + random(-5, 5), 'smoke'));
    }
}