class Projectile {
    constructor(x, y, vx, vy, type) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.type = type;
        this.width = this.getSizeByType().width;
        this.height = this.getSizeByType().height;
        this.color = this.getColorByType();
        this.damage = this.getDamageByType();
        this.life = this.getLifeByType();
        this.maxLife = this.life;
        
        // Animation properties
        this.rotation = 0;
        this.scale = 1;
        this.trail = [];
        this.trailLength = this.getTrailLengthByType();
    }
    
    getSizeByType() {
        switch (this.type) {
            case 'tongue': return { width: 8, height: 20 };
            case 'blood_drain': return { width: 6, height: 15 };
            case 'poison_sting': return { width: 10, height: 12 };
            case 'acid_spray': return { width: 12, height: 8 };
            case 'venom': return { width: 8, height: 12 };
            default: return { width: 6, height: 10 };
        }
    }
    
    getColorByType() {
        switch (this.type) {
            case 'tongue': return color(255, 100, 100);
            case 'blood_drain': return color(150, 0, 0);
            case 'poison_sting': return color(255, 255, 0);
            case 'acid_spray': return color(0, 255, 0);
            case 'venom': return color(128, 0, 128);
            default: return color(255, 255, 255);
        }
    }
    
    getDamageByType() {
        switch (this.type) {
            case 'tongue': return 1;
            case 'blood_drain': return 1;
            case 'poison_sting': return 1;
            case 'acid_spray': return 1;
            case 'venom': return 1;
            default: return 1;
        }
    }
    
    getLifeByType() {
        switch (this.type) {
            case 'tongue': return 60; // frames
            case 'blood_drain': return 120;
            case 'poison_sting': return 90;
            case 'acid_spray': return 100;
            case 'venom': return 100;
            default: return 80;
        }
    }
    
    getTrailLengthByType() {
        switch (this.type) {
            case 'tongue': return 5;
            case 'blood_drain': return 8;
            case 'poison_sting': return 6;
            case 'acid_spray': return 10;
            case 'venom': return 7;
            default: return 5;
        }
    }
    
    update() {
        // Store trail position
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Update animation
        this.rotation += 0.2;
        this.life--;
        
        // Special behaviors by type
        switch (this.type) {
            case 'acid_spray':
                // Acid spray spreads out
                this.vx *= 1.02;
                this.scale = map(this.life, this.maxLife, 0, 1, 1.5);
                break;
                
            case 'poison_sting':
                // Poison moves in slight curves
                this.vx += sin(frameCount * 0.1) * 0.1;
                break;
                
            case 'blood_drain':
                // Blood drain homes in slightly on target if it's frog projectile
                if (this.type === 'tongue' && frog) {
                    let dx = frog.x - this.x;
                    let dy = frog.y - this.y;
                    let distance = sqrt(dx * dx + dy * dy);
                    if (distance > 0) {
                        this.vx += (dx / distance) * 0.1;
                        this.vy += (dy / distance) * 0.1;
                    }
                }
                break;
        }
    }
    
    draw() {
        push();
        
        // Draw trail
        this.drawTrail();
        
        translate(this.x, this.y);
        rotate(this.rotation);
        scale(this.scale);
        
        switch (this.type) {
            case 'tongue':
                this.drawTongue();
                break;
            case 'blood_drain':
                this.drawBloodDrain();
                break;
            case 'poison_sting':
                this.drawPoisonSting();
                break;
            case 'acid_spray':
                this.drawAcidSpray();
                break;
            case 'venom':
                this.drawVenom();
                break;
            default:
                this.drawBasicProjectile();
        }
        
        pop();
    }
    
    drawTrail() {
        if (this.trail.length < 2) return;
        
        stroke(red(this.color), green(this.color), blue(this.color), 100);
        strokeWeight(2);
        noFill();
        
        beginShape();
        for (let i = 0; i < this.trail.length; i++) {
            let alpha = map(i, 0, this.trail.length - 1, 0, 100);
            stroke(red(this.color), green(this.color), blue(this.color), alpha);
            vertex(this.trail[i].x, this.trail[i].y);
        }
        endShape();
    }
    
    drawTongue() {
        // Frog tongue projectile
        fill(this.color);
        stroke(200, 50, 50);
        strokeWeight(1);
        
        // Tongue body
        ellipse(0, 0, this.width, this.height);
        
        // Sticky tip
        fill(255, 150, 150);
        noStroke();
        ellipse(0, -this.height / 2, this.width * 0.7, this.width * 0.7);
        
        // Highlight
        fill(255, 200, 200);
        ellipse(-2, -2, 3, 3);
    }
    
    drawBloodDrain() {
        // Mosquito blood drain attack
        fill(this.color);
        stroke(100, 0, 0);
        strokeWeight(1);
        
        // Drop shape
        ellipse(0, 2, this.width, this.height * 0.8);
        ellipse(0, -this.height / 3, this.width * 0.6, this.width * 0.6);
        
        // Drip effect
        fill(200, 0, 0);
        noStroke();
        ellipse(0, this.height / 2, 3, 5);
    }
    
    drawPoisonSting() {
        // Wasp poison sting
        fill(this.color);
        stroke(200, 200, 0);
        strokeWeight(2);
        
        // Lightning bolt shape
        beginShape();
        vertex(-this.width / 4, -this.height / 2);
        vertex(this.width / 4, -this.height / 4);
        vertex(-this.width / 6, 0);
        vertex(this.width / 4, this.height / 4);
        vertex(-this.width / 4, this.height / 2);
        vertex(this.width / 6, 0);
        endShape(CLOSE);
        
        // Electric glow
        fill(255, 255, 100, 150);
        noStroke();
        ellipse(0, 0, this.width * 1.5, this.height * 1.5);
    }
    
    drawAcidSpray() {
        // Beetle acid spray
        fill(this.color);
        stroke(0, 200, 0);
        strokeWeight(1);
        
        // Bubble/splash shape
        for (let i = 0; i < 3; i++) {
            let offsetX = random(-this.width / 4, this.width / 4);
            let offsetY = random(-this.height / 4, this.height / 4);
            let size = random(this.width * 0.3, this.width * 0.8);
            ellipse(offsetX, offsetY, size, size);
        }
        
        // Corrosive effect
        fill(150, 255, 150, 100);
        noStroke();
        ellipse(0, 0, this.width * 1.2, this.height * 1.2);
    }
    
    drawVenom() {
        // Generic venom projectile
        fill(this.color);
        stroke(100, 0, 100);
        strokeWeight(1);
        
        // Teardrop shape
        ellipse(0, 0, this.width, this.height);
        triangle(0, -this.height / 2, -this.width / 4, -this.height / 3, this.width / 4, -this.height / 3);
        
        // Toxic glow
        fill(200, 0, 200, 80);
        noStroke();
        ellipse(0, 0, this.width * 1.3, this.height * 1.3);
    }
    
    drawBasicProjectile() {
        fill(this.color);
        stroke(255);
        strokeWeight(1);
        ellipse(0, 0, this.width, this.height);
    }
    
    isOffScreen() {
        return (this.x < -50 || this.x > CANVAS_WIDTH + 50 || 
                this.y < -50 || this.y > CANVAS_HEIGHT + 50 || 
                this.life <= 0);
    }
    
    // Collision detection
    collidesWith(other) {
        let dx = this.x - other.x;
        let dy = this.y - other.y;
        let distance = sqrt(dx * dx + dy * dy);
        return distance < (this.width / 2 + other.width / 2);
    }
    
    getBounds() {
        return {
            left: this.x - this.width / 2,
            right: this.x + this.width / 2,
            top: this.y - this.height / 2,
            bottom: this.y + this.height / 2
        };
    }
}