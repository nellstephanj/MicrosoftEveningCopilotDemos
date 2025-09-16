# MOOD - Heavenly Combat

A 3D first-person shooter game inspired by Doom, but set in heaven instead of hell. Fight against fallen angels and dark spirits using divine weapons in this heavenly battlefield.

![Mood Game](./screenshot.png)

## 🎮 Game Features

### ✨ Heavenly Environment
- Beautiful heavenly atmosphere with clouds, golden structures, and divine lighting
- Floating platforms and crystal formations
- Dynamic lighting with god rays and ethereal effects
- Atmospheric fog and particle effects

### 🔫 Divine Arsenal
- **Holy Pistol** - Accurate sidearm with golden bullets
- **Celestial Rifle** - Automatic weapon for sustained combat
- **Divine Shotgun** - Close-range devastation with holy pellets
- **Archangel Cannon** - Heavy weapon with explosive divine energy

### 👹 Enemy Types
- **Fallen Angels** - Flying enemies with dark energy projectiles
- **Dark Spirits** - Fast-moving melee attackers
- **Corrupted Guardians** - Heavy armored enemies with powerful attacks

### 🎯 Game Mechanics
- First-person movement with WASD controls
- Mouse look for 360-degree camera control
- Health system with visual damage feedback
- Ammunition management and weapon switching
- Dynamic enemy spawning system
- Score and kill tracking

## 🎮 Controls

| Key/Action | Function |
|------------|----------|
| **W A S D** | Movement |
| **Mouse** | Look around |
| **Left Click** | Fire weapon |
| **R** | Reload |
| **Space** | Jump |
| **Shift** | Sprint |
| **ESC** | Pause/Menu |
| **1-4** | Switch weapons |

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Modern web browser with WebGL support

### Installation
1. Clone or download the project
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Game
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open your browser and go to `http://localhost:5173/`
3. Click "START MISSION" to begin playing

### Building for Production
```bash
npm run build
```

## 🛠️ Technology Stack

- **Three.js** - 3D graphics and rendering
- **Cannon.js** - Physics engine for collision detection
- **Howler.js** - Audio management (ready for future implementation)
- **Vite** - Build tool and development server
- **Vanilla JavaScript** - Core game logic

## 🎨 Game Architecture

### Core Systems
- **GameEngine** - Main engine handling rendering, physics, and game loop
- **Player** - First-person character with movement and health
- **Environment** - Heavenly world with platforms and atmospheric effects
- **WeaponSystem** - Weapon management and combat mechanics
- **Enemy** - AI-driven opponents with different behaviors

### File Structure
```
src/
├── engine/          # Core game engine
├── player/          # Player character system
├── environment/     # World and level design
├── weapons/         # Weapon system and types
├── enemies/         # Enemy AI and types
├── styles/          # CSS styling
└── main.js          # Game initialization
```

## 🎯 Gameplay Tips

1. **Movement** - Use WASD to move around and Shift to sprint
2. **Aiming** - Keep your crosshair steady for accurate shots
3. **Weapon Choice** - Use the right weapon for each situation:
   - Pistol for accuracy at range
   - Rifle for sustained combat
   - Shotgun for close encounters
   - Cannon for groups of enemies
4. **Health Management** - Take cover when health is low
5. **Ammunition** - Keep an eye on your ammo counter and reload strategically

## 🏆 Victory Conditions

- Defeat 20 enemies to achieve divine victory
- Survive the waves of corrupted beings
- Cleanse heaven of darkness

## 🔧 Development

### Adding New Features
The game is built with modularity in mind. Key areas for expansion:

- **Audio System** - Sound effects and background music
- **More Weapons** - Additional divine armaments
- **New Enemies** - More challenging foes
- **Power-ups** - Health, ammo, and special abilities
- **Multiple Levels** - Different heavenly locations

### Performance Notes
- The game uses modern WebGL features
- Optimized for 60 FPS on modern browsers
- Physics simulation runs at 60Hz
- Dynamic LOD system ready for implementation

## 📝 License

MIT License - Feel free to modify and distribute

## 🤝 Contributing

Contributions welcome! Areas needing work:
- Audio implementation
- Additional enemy types
- More weapons
- Level design
- Performance optimizations

---

**Fight for Heaven. Protect the Divine. Become the Angel of Vengeance.**

*Mood - Where heaven meets combat.*