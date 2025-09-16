class Bug {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.speed = this.getSpeedByType();
        this.width = this.getSizeByType().width;
        this.height = this.getSizeByType().height;
        this.health = this.getHealthByType();
        this.maxHealth = this.health;
        this.color = this.getColorByType();
        this.shootCooldown = 0;
        this.shootRate = this.getShootRateByType();
        
        // Movement pattern
        this.originalX = x;
        this.movePattern = random(['straight', 'zigzag', 'circle']);
        this.time = 0;
        this.amplitude = random(30, 80);
        
        // Animation
        this.wingFlap = 0;
        this.wingSpeed = this.getWingSpeedByType();
        
        // Venom properties
        this.venomType = this.getVenomTypeByType();
    }
    
    getSpeedByType() {
        switch (this.type) {
            case 'mosquito': return random(1, 2);
            case 'wasp': return random(2, 3);
            case 'beetle': return random(0.5, 1.5);
            default: return 1;
        }
    }
    
    getSizeByType() {
        switch (this.type) {
            case 'mosquito': return { width: 25, height: 35 };
            case 'wasp': return { width: 35, height: 30 };
            case 'beetle': return { width: 40, height: 35 };
            default: return { width: 30, height: 30 };
        }
    }
    
    getHealthByType() {
        switch (this.type) {
            case 'mosquito': return 1;
            case 'wasp': return 2;
            case 'beetle': return 3;
            default: return 1;
        }
    }
    
    getColorByType() {
        switch (this.type) {
            case 'mosquito': return color(100, 50, 50);
            case 'wasp': return color(255, 255, 0);
            case 'beetle': return color(50, 50, 100);
            default: return color(100, 100, 100);
        }
    }
    
    getShootRateByType() {
        switch (this.type) {
            case 'mosquito': return random(120, 180); // frames
            case 'wasp': return random(60, 120);
            case 'beetle': return random(90, 150);
            default: return 120;
        }
    }
    
    getWingSpeedByType() {
        switch (this.type) {
            case 'mosquito': return 0.3;
            case 'wasp': return 0.2;
            case 'beetle': return 0.1;
            default: return 0.2;
        }
    }
    
    getVenomTypeByType() {
        switch (this.type) {
            case 'mosquito': return 'blood_drain';
            case 'wasp': return 'poison_sting';
            case 'beetle': return 'acid_spray';
            default: return 'basic';
        }
    }
    
    update() {
        this.time += 0.05;
        
        // Movement patterns
        switch (this.movePattern) {
            case 'straight':
                this.y += this.speed;
                break;
                
            case 'zigzag':
                this.y += this.speed;
                this.x = this.originalX + sin(this.time * 2) * this.amplitude;
                break;
                
            case 'circle':
                this.y += this.speed * 0.7;
                this.x = this.originalX + cos(this.time * 3) * this.amplitude * 0.5;
                break;
        }
        
        // Keep bugs within screen bounds
        this.x = constrain(this.x, this.width / 2, CANVAS_WIDTH - this.width / 2);
        
        // Update wing animation
        this.wingFlap += this.wingSpeed;
        
        // Update shooting cooldown
        this.shootCooldown--;
    }
    
    draw() {
        push();
        translate(this.x, this.y);
        
        // Draw shadow
        fill(0, 0, 0, 30);
        noStroke();
        ellipse(2, 8, this.width * 0.7, this.height * 0.3);
        
        switch (this.type) {
            case 'mosquito':
                this.drawMosquito();
                break;
            case 'wasp':
                this.drawWasp();
                break;
            case 'beetle':
                this.drawBeetle();
                break;
            default:
                this.drawBasicBug();
        }
        
        // Draw health bar if damaged
        if (this.health < this.maxHealth) {
            this.drawHealthBar();
        }
        
        pop();
    }
    
    drawMosquito() {
        // Body
        fill(this.color);
        stroke(0);
        strokeWeight(1);
        ellipse(0, 0, this.width * 0.4, this.height);
        
        // Wings
        let wingOffset = sin(this.wingFlap) * 5;
        fill(255, 255, 255, 150);
        ellipse(-this.width * 0.3, -5 + wingOffset, this.width * 0.5, this.height * 0.6);
        ellipse(this.width * 0.3, -5 - wingOffset, this.width * 0.5, this.height * 0.6);
        
        // Proboscis (long thin feeding tube)
        stroke(150, 75, 75);
        strokeWeight(2);
        line(0, this.height * 0.3, 0, this.height * 0.5);
        
        // Eyes
        fill(255, 0, 0);
        noStroke();
        ellipse(-3, -this.height * 0.3, 4, 4);
        ellipse(3, -this.height * 0.3, 4, 4);
    }
    
    drawWasp() {
        // Body (striped)
        for (let i = 0; i < 3; i++) {
            if (i % 2 === 0) {
                fill(255, 255, 0);
            } else {
                fill(0, 0, 0);
            }
            noStroke();
            ellipse(0, -this.height * 0.3 + i * (this.height * 0.2), this.width * 0.6, this.height * 0.25);
        }
        
        // Wings
        let wingOffset = sin(this.wingFlap) * 3;
        fill(255, 255, 255, 180);
        stroke(200);
        strokeWeight(1);
        ellipse(-this.width * 0.4, -8 + wingOffset, this.width * 0.6, this.height * 0.7);
        ellipse(this.width * 0.4, -8 - wingOffset, this.width * 0.6, this.height * 0.7);
        
        // Stinger
        fill(50, 50, 50);
        noStroke();
        triangle(0, this.height * 0.4, -3, this.height * 0.5, 3, this.height * 0.5);
        
        // Eyes
        fill(0, 0, 0);
        ellipse(-4, -this.height * 0.4, 5, 5);
        ellipse(4, -this.height * 0.4, 5, 5);
        
        // Antennae
        stroke(0);
        strokeWeight(1);
        line(-2, -this.height * 0.5, -6, -this.height * 0.6);
        line(2, -this.height * 0.5, 6, -this.height * 0.6);
    }
    
    drawBeetle() {
        // Shell (elytra)
        fill(this.color);
        stroke(0, 0, 150);
        strokeWeight(2);
        ellipse(0, 0, this.width, this.height * 0.8);
        
        // Shell pattern
        fill(70, 70, 150);
        noStroke();
        ellipse(-this.width * 0.2, -5, this.width * 0.3, this.height * 0.4);
        ellipse(this.width * 0.2, -5, this.width * 0.3, this.height * 0.4);
        
        // Wings (barely visible under shell)
        if (sin(this.wingFlap) > 0) {
            fill(255, 255, 255, 100);
            ellipse(-this.width * 0.4, 0, this.width * 0.3, this.height * 0.5);
            ellipse(this.width * 0.4, 0, this.width * 0.3, this.height * 0.5);
        }
        
        // Head
        fill(30, 30, 80);
        stroke(0, 0, 100);
        strokeWeight(1);
        ellipse(0, -this.height * 0.4, this.width * 0.7, this.height * 0.3);
        
        // Eyes
        fill(255, 255, 255);
        noStroke();
        ellipse(-6, -this.height * 0.4, 4, 4);
        ellipse(6, -this.height * 0.4, 4, 4);
        
        // Mandibles
        stroke(0);
        strokeWeight(2);
        line(-4, -this.height * 0.3, -8, -this.height * 0.2);
        line(4, -this.height * 0.3, 8, -this.height * 0.2);
    }
    
    drawBasicBug() {
        fill(this.color);
        stroke(0);
        strokeWeight(1);
        ellipse(0, 0, this.width, this.height);
    }
    
    drawHealthBar() {
        let barWidth = this.width;
        let barHeight = 4;
        let healthPercent = this.health / this.maxHealth;
        
        // Background
        fill(255, 0, 0);
        noStroke();
        rect(-barWidth / 2, -this.height / 2 - 10, barWidth, barHeight);
        
        // Health
        fill(0, 255, 0);
        rect(-barWidth / 2, -this.height / 2 - 10, barWidth * healthPercent, barHeight);
    }
    
    shouldShoot() {
        if (this.shootCooldown <= 0 && this.y > 50 && this.y < CANVAS_HEIGHT - 100) {
            this.shootCooldown = this.shootRate;
            return true;
        }
        return false;
    }
    
    takeDamage(damage = 1) {
        this.health -= damage;
        return this.health <= 0;
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