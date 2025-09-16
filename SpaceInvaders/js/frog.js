class Frog {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 40;
        this.speed = 5;
        this.invincible = false;
        this.invincibilityTime = 0;
        this.invincibilityDuration = 1000; // 1 second
        this.shielded = false;
        this.color = color(34, 139, 34); // Forest green
        this.eyeColor = color(255, 255, 255);
        this.pupilColor = color(0, 0, 0);
        
        // Animation properties
        this.hopOffset = 0;
        this.hopSpeed = 0.1;
        this.tongueExtended = false;
        this.tongueTimer = 0;
    }
    
    update() {
        // Handle movement with arrow keys
        if (keyIsDown(LEFT_ARROW) && this.x > this.width / 2) {
            this.x -= this.speed;
        }
        if (keyIsDown(RIGHT_ARROW) && this.x < CANVAS_WIDTH - this.width / 2) {
            this.x += this.speed;
        }
        if (keyIsDown(UP_ARROW) && this.y > this.height / 2) {
            this.y -= this.speed;
        }
        if (keyIsDown(DOWN_ARROW) && this.y < CANVAS_HEIGHT - this.height / 2) {
            this.y += this.speed;
        }
        
        // Update animation
        this.hopOffset = sin(millis() * this.hopSpeed) * 3;
        
        // Handle invincibility
        if (this.invincible) {
            if (millis() - this.invincibilityTime > this.invincibilityDuration) {
                this.invincible = false;
            }
        }
        
        // Handle tongue animation
        if (this.tongueExtended) {
            this.tongueTimer--;
            if (this.tongueTimer <= 0) {
                this.tongueExtended = false;
            }
        }
    }
    
    draw() {
        push();
        translate(this.x, this.y + this.hopOffset);
        
        // Flicker effect when invincible
        if (this.invincible && Math.floor(millis() / 100) % 2 === 0) {
            tint(255, 128); // Semi-transparent
        }
        
        // Draw shadow
        fill(0, 0, 0, 50);
        noStroke();
        ellipse(0, 15, this.width * 0.8, this.height * 0.3);
        
        // Draw frog body (main oval)
        fill(this.color);
        stroke(0, 100, 0);
        strokeWeight(2);
        ellipse(0, 0, this.width, this.height);
        
        // Draw frog spots
        fill(0, 120, 0);
        noStroke();
        ellipse(-8, -5, 8, 6);
        ellipse(8, -5, 8, 6);
        ellipse(0, 5, 10, 8);
        
        // Draw frog eyes
        fill(this.eyeColor);
        stroke(0, 100, 0);
        strokeWeight(1);
        ellipse(-12, -15, 16, 18);
        ellipse(12, -15, 16, 18);
        
        // Draw pupils
        fill(this.pupilColor);
        noStroke();
        ellipse(-12, -15, 8, 10);
        ellipse(12, -15, 8, 10);
        
        // Draw eye shine
        fill(255, 255, 255, 200);
        ellipse(-14, -17, 3, 4);
        ellipse(10, -17, 3, 4);
        
        // Draw mouth
        stroke(0, 80, 0);
        strokeWeight(2);
        noFill();
        arc(0, 2, 20, 8, 0, PI);
        
        // Draw front legs
        fill(this.color);
        stroke(0, 100, 0);
        strokeWeight(2);
        ellipse(-18, 8, 12, 16);
        ellipse(18, 8, 12, 16);
        
        // Draw webbed feet
        fill(0, 120, 0);
        noStroke();
        ellipse(-18, 16, 8, 6);
        ellipse(18, 16, 8, 6);
        
        // Draw tongue if extended
        if (this.tongueExtended) {
            stroke(255, 100, 100);
            strokeWeight(4);
            line(0, 0, 0, -30);
            
            // Tongue tip
            fill(255, 100, 100);
            noStroke();
            ellipse(0, -30, 6, 8);
        }
        
        noTint();
        
        // Draw shield effect if active
        if (this.shielded) {
            stroke(100, 150, 255);
            strokeWeight(3);
            noFill();
            ellipse(0, 0, this.width + 20, this.height + 20);
            
            // Shield sparkles
            for (let i = 0; i < 6; i++) {
                let angle = (millis() * 0.01 + i * PI / 3) % TWO_PI;
                let x = cos(angle) * (this.width / 2 + 15);
                let y = sin(angle) * (this.height / 2 + 15);
                fill(100, 150, 255, 200);
                noStroke();
                ellipse(x, y, 3, 3);
            }
        }
        
        pop();
    }
    
    hit() {
        if (!this.invincible) {
            this.invincible = true;
            this.invincibilityTime = millis();
        }
    }
    
    isInvincible() {
        return this.invincible;
    }
    
    shoot() {
        this.tongueExtended = true;
        this.tongueTimer = 10; // frames
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