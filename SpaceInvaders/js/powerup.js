class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 30;
        this.height = 30;
        this.speed = 1;
        this.color = this.getColorByType();
        this.rotation = 0;
        this.rotationSpeed = 0.05;
        this.bobOffset = 0;
        this.bobSpeed = 0.08;
        this.lifetime = 600; // frames (10 seconds at 60fps)
        this.collected = false;
        
        // Effect properties
        this.glowSize = 0;
        this.glowDirection = 1;
    }
    
    getColorByType() {
        switch (this.type) {
            case 'rapid_fire': return color(255, 100, 100);
            case 'shield': return color(100, 100, 255);
            case 'multi_shot': return color(255, 255, 100);
            case 'health': return color(100, 255, 100);
            case 'score_boost': return color(255, 0, 255);
            default: return color(255, 255, 255);
        }
    }
    
    update() {
        // Move down slowly
        this.y += this.speed;
        
        // Update animations
        this.rotation += this.rotationSpeed;
        this.bobOffset = sin(millis() * this.bobSpeed) * 3;
        
        // Update glow effect
        this.glowSize += this.glowDirection * 0.5;
        if (this.glowSize > 10 || this.glowSize < 0) {
            this.glowDirection *= -1;
        }
        
        // Decrease lifetime
        this.lifetime--;
    }
    
    draw() {
        push();
        translate(this.x, this.y + this.bobOffset);
        rotate(this.rotation);
        
        // Draw glow effect
        fill(red(this.color), green(this.color), blue(this.color), 50);
        noStroke();
        ellipse(0, 0, this.width + this.glowSize, this.height + this.glowSize);
        
        // Draw power-up icon based on type
        switch (this.type) {
            case 'rapid_fire':
                this.drawRapidFire();
                break;
            case 'shield':
                this.drawShield();
                break;
            case 'multi_shot':
                this.drawMultiShot();
                break;
            case 'health':
                this.drawHealth();
                break;
            case 'score_boost':
                this.drawScoreBoost();
                break;
            default:
                this.drawDefault();
        }
        
        pop();
    }
    
    drawRapidFire() {
        // Rapid fire icon - multiple arrows
        fill(this.color);
        stroke(255);
        strokeWeight(2);
        
        for (let i = 0; i < 3; i++) {
            let offsetX = (i - 1) * 8;
            // Arrow shape
            beginShape();
            vertex(offsetX, -10);
            vertex(offsetX - 5, -5);
            vertex(offsetX - 2, -5);
            vertex(offsetX - 2, 10);
            vertex(offsetX + 2, 10);
            vertex(offsetX + 2, -5);
            vertex(offsetX + 5, -5);
            endShape(CLOSE);
        }
    }
    
    drawShield() {
        // Shield icon
        fill(this.color);
        stroke(255);
        strokeWeight(2);
        
        // Shield shape
        beginShape();
        vertex(0, -12);
        vertex(-8, -8);
        vertex(-8, 5);
        vertex(0, 12);
        vertex(8, 5);
        vertex(8, -8);
        endShape(CLOSE);
        
        // Cross pattern
        stroke(255);
        strokeWeight(1);
        line(-5, -3, 5, -3);
        line(0, -8, 0, 8);
    }
    
    drawMultiShot() {
        // Multi-shot icon - spread arrows
        fill(this.color);
        stroke(255);
        strokeWeight(2);
        
        // Center arrow
        beginShape();
        vertex(0, -10);
        vertex(-3, -7);
        vertex(-1, -7);
        vertex(-1, 10);
        vertex(1, 10);
        vertex(1, -7);
        vertex(3, -7);
        endShape(CLOSE);
        
        // Side arrows
        push();
        rotate(-PI/6);
        beginShape();
        vertex(0, -8);
        vertex(-2, -6);
        vertex(-1, -6);
        vertex(-1, 8);
        vertex(1, 8);
        vertex(1, -6);
        vertex(2, -6);
        endShape(CLOSE);
        pop();
        
        push();
        rotate(PI/6);
        beginShape();
        vertex(0, -8);
        vertex(-2, -6);
        vertex(-1, -6);
        vertex(-1, 8);
        vertex(1, 8);
        vertex(1, -6);
        vertex(2, -6);
        endShape(CLOSE);
        pop();
    }
    
    drawHealth() {
        // Health cross
        fill(this.color);
        stroke(255);
        strokeWeight(2);
        
        // Cross shape
        rectMode(CENTER);
        rect(0, 0, 16, 6);
        rect(0, 0, 6, 16);
        
        // Highlight
        fill(255, 255, 255, 150);
        noStroke();
        rect(-2, -2, 12, 2);
        rect(-2, -2, 2, 12);
    }
    
    drawScoreBoost() {
        // Score boost - star
        fill(this.color);
        stroke(255);
        strokeWeight(2);
        
        // Star shape
        beginShape();
        for (let i = 0; i < 5; i++) {
            let angle = (TWO_PI / 5) * i - PI/2;
            let x1 = cos(angle) * 10;
            let y1 = sin(angle) * 10;
            vertex(x1, y1);
            
            angle += TWO_PI / 10;
            let x2 = cos(angle) * 5;
            let y2 = sin(angle) * 5;
            vertex(x2, y2);
        }
        endShape(CLOSE);
        
        // Center dot
        fill(255);
        noStroke();
        ellipse(0, 0, 4, 4);
    }
    
    drawDefault() {
        fill(this.color);
        stroke(255);
        strokeWeight(2);
        ellipse(0, 0, this.width, this.height);
    }
    
    isExpired() {
        return this.lifetime <= 0 || this.y > CANVAS_HEIGHT + 50 || this.collected;
    }
    
    collidesWith(other) {
        let dx = this.x - other.x;
        let dy = this.y - other.y;
        let distance = sqrt(dx * dx + dy * dy);
        return distance < (this.width / 2 + other.width / 2);
    }
    
    collect() {
        this.collected = true;
        // Create collection effect
        createSparks(this.x, this.y, 8);
        playPowerUpSound();
    }
    
    getEffect() {
        switch (this.type) {
            case 'rapid_fire':
                return { type: 'rapid_fire', duration: 5000, value: 0.3 }; // 5 seconds, shoot every 0.3 seconds
            case 'shield':
                return { type: 'shield', duration: 8000, value: 1 }; // 8 seconds of protection
            case 'multi_shot':
                return { type: 'multi_shot', duration: 6000, value: 3 }; // 6 seconds, 3 projectiles
            case 'health':
                return { type: 'health', duration: 0, value: 1 }; // Instant health restore
            case 'score_boost':
                return { type: 'score_boost', duration: 10000, value: 2 }; // 10 seconds, double score
            default:
                return { type: 'none', duration: 0, value: 0 };
        }
    }
}