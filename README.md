# IAG Cargo Drop 🛫📦

An aviation-themed browser game where you control falling freight to maximize shareholder value while avoiding competitor airlines!

## 🎮 How to Play

### Objective
Land IAG Cargo freight safely on the tarmac to earn cash. Avoid competitor airlines (Triangle & Together) trying to steal your cargo. Don't go bankrupt!

### Getting Started
1. Open `index.html` in your web browser
2. Click **START GAME** to begin
3. Use **← →** arrow keys to steer the falling freight

### Game Mechanics

#### 💰 Money System
- **Starting Cash:** £1000
- **Earn Money:** Successfully land freight on the tarmac
  - Small (Yellow): £100
  - Medium (Green): £200
  - Large (Purple): £400

#### 📦 Freight Control
- IAG Cargo planes fly across the screen and drop freight with parachutes
- Control the freight mid-air using left/right arrow keys
- Guide it safely to the landing zone at the bottom

#### ✈️ Competitor Planes
- **Triangle** and **Together** airlines fly from both sides at random heights
- They're trying to steal your freight or crash into it!

#### ⚠️ Collisions
- **Parachute Hit:** Plane steals the parachute → freight explodes → lose **2x** the freight value
- **Box Hit:** Plane crashes into the freight box → **GAME OVER**

#### 📈 Difficulty Progression
As you successfully land more freight:
- Freight falls **faster**
- Competitor planes spawn **more frequently**
- Planes fly **faster**
- More planes appear **simultaneously**

### 🏆 Win & Lose Conditions

#### You Win By:
- Accumulating the highest cash total possible
- Landing as many freight containers as you can

#### You Lose When:
- Your cash drops to £0 or below (bankruptcy)
- A competitor plane crashes into your freight box

### 📊 Statistics Tracked
- Current cash balance
- High score (persisted across sessions)
- Total small cargo landed
- Total medium cargo landed
- Total large cargo landed

## 🎯 Strategy Tips

1. **Risk vs Reward:** Large freight earns more but has bigger hitboxes and higher explosion penalties
2. **Plan Ahead:** Watch for competitor planes entering from both sides
3. **Stay Centered:** Gives you more reaction time to dodge incoming planes
4. **Parachute Zone:** The parachute above the box is vulnerable - keep it clear!
5. **Early Game:** Focus on building cash reserves before difficulty ramps up

## 🛠️ Technical Details

### Built With
- HTML5 Canvas
- Vanilla JavaScript
- CSS3

### Files Structure
```
├── index.html          # Main game page
├── game.js             # Game logic and rendering
├── style.css           # Styling
├── assets/
│   └── images/
│       └── current/
│           ├── yellow bill.png   # Small freight
│           ├── green Bill.png    # Medium freight
│           └── purple bill.png   # Large freight
└── README.md           # This file
```

## 🎲 Game Controls

| Key | Action |
|-----|--------|
| `←` | Move freight left |
| `→` | Move freight right |

## 🏅 Scoring

- Successfully land freight = **+ freight value**
- Parachute stolen by plane = **- 2× freight value**
- Cash hits £0 = **Game Over**
- Freight box collision = **Game Over**

## 🚀 Quick Start

```bash
# No installation needed!
# Simply open index.html in your browser
open index.html
```

## 📝 Notes

- High scores are saved in browser localStorage
- Press F12 to open browser console for debug logs
- Game uses requestAnimationFrame for smooth 60fps gameplay

---

**Maximize Shareholder Value!** 💼✈️
