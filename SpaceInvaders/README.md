# 🐸 Frog vs Bugs 🐛

A fun web-based game inspired by Space Invaders, where a brave frog defends the river from venomous bugs!

## 🎮 How to Play

### Controls
- **Arrow Keys**: Move the frog around the river
- **Spacebar**: Shoot projectiles at bugs
- **Enter**: Start game or restart after game over

### Objective
- Survive as long as possible by shooting bugs and avoiding their venom
- Collect power-ups to gain special abilities
- Score points by destroying bugs (double points with Score Boost power-up!)

## 🐛 Enemy Types

### Mosquito
- **Health**: 1 hit
- **Speed**: Fast
- **Venom**: Blood Drain - red droplets that track slightly

### Wasp
- **Health**: 2 hits
- **Speed**: Medium-fast
- **Venom**: Poison Sting - yellow lightning bolts

### Beetle
- **Health**: 3 hits
- **Speed**: Slow but tough
- **Venom**: Acid Spray - green corrosive blobs that spread

## 🔋 Power-ups

### 🔴 Rapid Fire
- Duration: 5 seconds
- Effect: Shoot much faster with reduced cooldown

### 🔵 Shield
- Duration: 8 seconds
- Effect: Absorb all damage from bugs and venom

### 🟡 Multi-Shot
- Duration: 6 seconds
- Effect: Fire 3 projectiles simultaneously

### 🟢 Health
- Effect: Instantly restore 1 life (max 5 lives)

### 🟣 Score Boost
- Duration: 10 seconds
- Effect: Double points for all bug kills

## 🎯 Game Features

- **Progressive Difficulty**: Bugs spawn faster as time goes on
- **Particle Effects**: Explosions, sparks, and water splashes
- **Procedural Audio**: Sound effects generated using p5.sound
- **Responsive Design**: Works on desktop and mobile
- **Visual Polish**: River background with animated water effects

## 🛠️ Technical Details

### Built With
- **p5.js**: Main game framework for graphics and input
- **p5.sound**: Procedural audio generation
- **HTML5 Canvas**: Rendering
- **CSS3**: Styling and responsive design
- **JavaScript**: Game logic and mechanics

### File Structure
```
├── index.html          # Main HTML file
├── style.css           # Game styling
└── js/
    ├── game.js          # Main game loop and logic
    ├── frog.js          # Player character class
    ├── bug.js           # Enemy classes (3 types)
    ├── projectile.js    # Bullet physics
    ├── powerup.js       # Power-up system
    ├── particles.js     # Visual effects
    └── audio.js         # Sound system
```

## 🚀 Getting Started

1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. Click "Start Game" and begin playing!

No installation or server setup required - it's a pure client-side web game.

## 🎨 Visual Effects

- **Water Animation**: Flowing river background with ripple effects
- **Particle Systems**: Different effects for explosions, hits, and power-ups
- **Sprite Animation**: Wing flapping, hopping, and rotation effects
- **Power-up Indicators**: Live display of active power-ups with timers

## 🔊 Audio

The game uses procedural audio generation through p5.sound to create:
- Shooting sounds (triangle wave)
- Hit effects (sawtooth wave)
- Explosions (white noise)
- Power-up collection (rising sine wave)
- Ambient river sounds (background)

## 🎯 Future Enhancements

Potential features to add:
- Boss battles with giant bugs
- More power-up types (freeze time, screen clear, etc.)
- Local high score storage
- Multiple levels with different river environments
- Unlockable frog skins
- Co-op multiplayer mode

## 📱 Browser Compatibility

Tested and working on:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

Requires HTML5 Canvas and Web Audio API support.

---

**Have fun defending the river! 🐸**