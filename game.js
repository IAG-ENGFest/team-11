// Game Configuration
const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    STARTING_MONEY: 1000,
    FREIGHT_VALUES: {
        small: 100,
        medium: 200,
        large: 400
    },
    FREIGHT_SIZES: {
        small: { width: 30, height: 30 },
        medium: { width: 45, height: 45 },
        large: { width: 60, height: 60 }
    },
    PARACHUTE_HEIGHT: 20,
    INITIAL_FALL_SPEED: 2,
    FALL_SPEED_INCREMENT: 0.15,
    FREIGHT_MOVE_SPEED: 5,
    PLANE_SPEED: 3.5,
    PLANE_SPAWN_INTERVAL: 1500,
    PLANE_SPAWN_DECREMENT: 80,
    MIN_PLANE_SPAWN_INTERVAL: 400,
    TARMAC_HEIGHT: 50
};

// Game State
const gameState = {
    money: CONFIG.STARTING_MONEY,
    highScore: CONFIG.STARTING_MONEY,
    cargoLanded: { small: 0, medium: 0, large: 0 },
    running: false,
    gameOver: false,
    freightsFallen: 0,
    currentFallSpeed: CONFIG.INITIAL_FALL_SPEED,
    planeSpawnInterval: CONFIG.PLANE_SPAWN_INTERVAL,
    planeSpeed: CONFIG.PLANE_SPEED
};

// Canvas Setup
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = CONFIG.CANVAS_WIDTH;
canvas.height = CONFIG.CANVAS_HEIGHT;

// Load freight images
const freightImages = {
    small: new Image(),
    medium: new Image(),
    large: new Image()
};
freightImages.small.src = 'assets/images/current/yellow bill.png';
freightImages.medium.src = 'assets/images/current/green Bill.png';
freightImages.large.src = 'assets/images/current/purple bill.png';

let imagesLoaded = 0;
const totalImages = 3;

// Track image loading
Object.values(freightImages).forEach(img => {
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            console.log('All freight images loaded');
        }
    };
    img.onerror = () => {
        console.error('Failed to load image:', img.src);
    };
});

// Input State
const keys = {};

// Game Objects
let iagPlane = null;
let freight = null;
let competitorPlanes = [];
let particles = [];
let lastPlaneSpawn = 0;

// IAG Plane Class
class IAGPlane {
    constructor() {
        this.x = -100;
        this.y = 80;
        this.width = 80;
        this.height = 30;
        this.speed = 4;
        this.hasDropped = false;
    }
    
    update() {
        this.x += this.speed;
        
        // Drop freight when plane reaches center
        if (this.x > CONFIG.CANVAS_WIDTH / 3 && !this.hasDropped) {
            this.dropFreight();
            this.hasDropped = true;
        }
    }
    
    dropFreight() {
        const sizes = ['small', 'medium', 'large'];
        const size = sizes[Math.floor(Math.random() * sizes.length)];
        console.log('IAG plane dropping freight. Size:', size, 'Position:', this.x, this.y);
        freight = new Freight(this.x + this.width / 2, this.y + this.height, size);
    }
    
    draw() {
        // IAG Plane body (blue/white)
        ctx.fillStyle = '#1e3c72';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Wings
        ctx.fillStyle = '#2a5298';
        ctx.fillRect(this.x + 20, this.y + 10, this.width - 40, this.height + 10);
        
        // Nose
        ctx.beginPath();
        ctx.moveTo(this.x + this.width, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width + 15, this.y + this.height / 2);
        ctx.strokeStyle = '#1e3c72';
        ctx.lineWidth = this.height;
        ctx.stroke();
        
        // IAG Text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('IAG', this.x + 25, this.y + 20);
    }
    
    isOffScreen() {
        return this.x > CONFIG.CANVAS_WIDTH + 100;
    }
}

// Freight Class
class Freight {
    constructor(x, y, size) {
        this.size = size;
        this.dimensions = CONFIG.FREIGHT_SIZES[size];
        this.width = this.dimensions.width;
        this.height = this.dimensions.height;
        this.x = x - this.width / 2;
        this.y = y;
        this.parachuteWidth = this.width * 1.5;
        this.parachuteHeight = CONFIG.PARACHUTE_HEIGHT;
        this.value = CONFIG.FREIGHT_VALUES[size];
        this.fallSpeed = gameState.currentFallSpeed;
    }
    
    update() {
        // Horizontal movement
        if (keys['ArrowLeft'] && this.x > 0) {
            this.x -= CONFIG.FREIGHT_MOVE_SPEED;
        }
        if (keys['ArrowRight'] && this.x < CONFIG.CANVAS_WIDTH - this.width) {
            this.x += CONFIG.FREIGHT_MOVE_SPEED;
        }
        
        // Falling
        this.y += this.fallSpeed;
        
        // Check if landed
        if (this.y + this.height >= CONFIG.CANVAS_HEIGHT - CONFIG.TARMAC_HEIGHT) {
            console.log('Freight reached landing zone at y:', this.y);
            this.land();
            return false; // Signal that freight should be removed
        }
        
        return true; // Freight still active
    }
    
    land() {
        console.log('Freight landed! Size:', this.size, 'Value:', this.value);
        gameState.money += this.value;
        gameState.cargoLanded[this.size]++;
        gameState.freightsFallen++;
        updateUI();
        
        // Increase difficulty
        gameState.currentFallSpeed += CONFIG.FALL_SPEED_INCREMENT;
        gameState.planeSpawnInterval = Math.max(
            CONFIG.MIN_PLANE_SPAWN_INTERVAL,
            gameState.planeSpawnInterval - CONFIG.PLANE_SPAWN_DECREMENT
        );
        gameState.planeSpeed = Math.min(6, (gameState.planeSpeed || CONFIG.PLANE_SPEED) + 0.2);
        
        console.log('Clearing freight. Current IAG plane exists:', !!iagPlane);
        // Don't set freight to null here - let the game loop handle it
        // freight = null; // REMOVED
        if (!iagPlane) {
            console.log('Spawning new IAG plane after landing');
            iagPlane = new IAGPlane();
        } else {
            console.log('IAG plane already exists, not spawning new one');
        }
    }
    
    explode() {
        console.log('Freight exploded! Size:', this.size, 'Lost:', this.value * 2);
        // Create explosion particles
        for (let i = 0; i < 20; i++) {
            particles.push(new Particle(
                this.x + this.width / 2,
                this.y + this.height / 2
            ));
        }
        
        // Lose double the freight value
        gameState.money -= this.value * 2;
        updateUI();
        
        // Check if bankrupt
        if (gameState.money <= 0) {
            console.log('Bankrupt! Game over.');
            endGame('You ran out of money! Bankruptcy!');
            return false; // Signal bankruptcy
        } else {
            console.log('Clearing freight. Current IAG plane exists:', !!iagPlane);
            // Don't set freight to null here - let the game loop handle it
            // freight = null; // REMOVED
            if (!iagPlane) {
                console.log('Spawning new IAG plane after explosion');
                iagPlane = new IAGPlane();
            } else {
                console.log('IAG plane already exists, not spawning new one');
            }
            return true; // Continue game
        }
    }
    
    draw() {
        // Parachute canopy (rounded dome shape)
        ctx.fillStyle = '#ff6b6b';
        ctx.strokeStyle = '#cc5555';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
            this.x + this.width / 2,
            this.y - this.parachuteHeight,
            this.parachuteWidth / 2,
            0,
            Math.PI,
            true
        );
        ctx.fill();
        ctx.stroke();
        
        // Parachute panel lines
        ctx.strokeStyle = '#cc5555';
        ctx.lineWidth = 1;
        const segments = 6;
        for (let i = 1; i < segments; i++) {
            const angle = Math.PI * (i / segments);
            const x1 = this.x + this.width / 2 - this.parachuteWidth / 2 * Math.cos(angle);
            const y1 = this.y - this.parachuteHeight + this.parachuteWidth / 2 * Math.sin(angle);
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y - this.parachuteHeight);
            ctx.lineTo(x1, y1);
            ctx.stroke();
        }
        
        // Parachute strings
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2 - this.parachuteWidth / 2, this.y - this.parachuteHeight);
        ctx.lineTo(this.x + 2, this.y);
        ctx.moveTo(this.x + this.width / 2 + this.parachuteWidth / 2, this.y - this.parachuteHeight);
        ctx.lineTo(this.x + this.width - 2, this.y);
        ctx.moveTo(this.x + this.width / 2 - this.parachuteWidth / 4, this.y - this.parachuteHeight);
        ctx.lineTo(this.x + this.width * 0.3, this.y);
        ctx.moveTo(this.x + this.width / 2 + this.parachuteWidth / 4, this.y - this.parachuteHeight);
        ctx.lineTo(this.x + this.width * 0.7, this.y);
        ctx.stroke();
        
        // Draw freight box using loaded image
        const img = freightImages[this.size];
        if (img && img.complete) {
            ctx.drawImage(img, this.x, this.y, this.width, this.height);
        } else {
            // Fallback to drawn box if image not loaded
            let boxColor, accentColor;
            if (this.size === 'small') {
                boxColor = '#8B4513';
                accentColor = '#654321';
            } else if (this.size === 'medium') {
                boxColor = '#A0522D';
                accentColor = '#7A3D1F';
            } else {
                boxColor = '#D2691E';
                accentColor = '#A0522D';
            }
            
            ctx.fillStyle = boxColor;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = '#3d2817';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
    
    getParachuteHitbox() {
        return {
            x: this.x + this.width / 2 - this.parachuteWidth / 2,
            y: this.y - this.parachuteHeight - this.parachuteWidth / 2,
            width: this.parachuteWidth,
            height: this.parachuteWidth / 2
        };
    }
    
    getBoxHitbox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Competitor Plane Class
class CompetitorPlane {
    constructor(fromLeft) {
        this.fromLeft = fromLeft;
        this.width = 70;
        this.height = 25;
        this.y = Math.random() * (CONFIG.CANVAS_HEIGHT - CONFIG.TARMAC_HEIGHT - 100) + 80;
        this.x = fromLeft ? -this.width : CONFIG.CANVAS_WIDTH;
        this.speed = (gameState.planeSpeed || CONFIG.PLANE_SPEED) * (fromLeft ? 1 : -1);
        this.airline = Math.random() > 0.5 ? 'Triangle' : 'Together';
        this.color = this.airline === 'Triangle' ? '#FF6347' : '#4169E1';
    }
    
    update() {
        this.x += this.speed;
    }
    
    draw() {
        // Plane body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Wings
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(this.x + 15, this.y + 8, this.width - 30, this.height + 8);
        ctx.globalAlpha = 1.0;
        
        // Airline text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Arial';
        const text = this.airline === 'Triangle' ? 'TRI' : 'TOG';
        ctx.fillText(text, this.x + 20, this.y + 17);
    }
    
    isOffScreen() {
        return this.fromLeft ? this.x > CONFIG.CANVAS_WIDTH + 100 : this.x < -100;
    }
    
    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Particle Class for explosions
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.life = 1.0;
        this.decay = 0.02;
        this.size = Math.random() * 5 + 3;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // Gravity
        this.life -= this.decay;
    }
    
    draw() {
        ctx.fillStyle = `rgba(255, 100, 50, ${this.life})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    isDead() {
        return this.life <= 0;
    }
}

// Collision Detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Game Loop
function gameLoop(timestamp) {
    if (!gameState.running) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    
    // Draw tarmac
    ctx.fillStyle = '#333';
    ctx.fillRect(0, CONFIG.CANVAS_HEIGHT - CONFIG.TARMAC_HEIGHT, CONFIG.CANVAS_WIDTH, CONFIG.TARMAC_HEIGHT);
    
    // Update and draw IAG plane
    if (iagPlane) {
        iagPlane.update();
        iagPlane.draw();
        
        if (iagPlane.isOffScreen()) {
            console.log('IAG plane flew off screen');
            iagPlane = null;
        }
    }
    
    // Spawn new IAG plane if none exists and no freight is falling
    if (!iagPlane && !freight) {
        console.log('Spawning new IAG plane (no plane, no freight)');
        iagPlane = new IAGPlane();
    }
    
    // Update and draw freight
    if (freight) {
        const stillActive = freight.update();
        if (!stillActive) {
            // Freight landed, clear it
            freight = null;
        } else {
            freight.draw();
            
            // Check collisions with competitor planes
            const parachuteHitbox = freight.getParachuteHitbox();
            const boxHitbox = freight.getBoxHitbox();
            
            for (let plane of competitorPlanes) {
                const planeHitbox = plane.getHitbox();
                
                // Check box collision (game over)
                if (checkCollision(boxHitbox, planeHitbox)) {
                    endGame('A competitor plane hit your freight!');
                    return;
                }
                
                // Check parachute collision (explosion)
                if (checkCollision(parachuteHitbox, planeHitbox)) {
                    const continueGame = freight.explode();
                    freight = null; // Clear freight after explosion
                    if (!continueGame) {
                        return; // Game over due to bankruptcy
                    }
                    break;
                }
            }
        }
    }
    
    // Spawn competitor planes
    if (freight && timestamp - lastPlaneSpawn > gameState.planeSpawnInterval) {
        competitorPlanes.push(new CompetitorPlane(Math.random() > 0.5));
        lastPlaneSpawn = timestamp;
    }
    
    // Update and draw competitor planes
    competitorPlanes = competitorPlanes.filter(plane => {
        plane.update();
        plane.draw();
        return !plane.isOffScreen();
    });
    
    // Update and draw particles
    particles = particles.filter(particle => {
        particle.update();
        particle.draw();
        return !particle.isDead();
    });
    
    requestAnimationFrame(gameLoop);
}

// UI Updates
function updateUI() {
    document.getElementById('money').textContent = `£${gameState.money}`;
    document.getElementById('small-count').textContent = gameState.cargoLanded.small;
    document.getElementById('medium-count').textContent = gameState.cargoLanded.medium;
    document.getElementById('large-count').textContent = gameState.cargoLanded.large;
    
    // Update high score
    if (gameState.money > gameState.highScore) {
        gameState.highScore = gameState.money;
        localStorage.setItem('highScore', gameState.highScore);
    }
    document.getElementById('high-score').textContent = `£${gameState.highScore}`;
    
    // Money flash effect
    const moneyEl = document.getElementById('money');
    moneyEl.classList.remove('money-increase', 'money-decrease');
    void moneyEl.offsetWidth; // Trigger reflow
    moneyEl.classList.add(gameState.money >= CONFIG.STARTING_MONEY ? 'money-increase' : 'money-decrease');
}

// End Game
function endGame(message) {
    gameState.running = false;
    gameState.gameOver = true;
    
    document.getElementById('final-message').textContent = message;
    document.getElementById('final-stats').innerHTML = `
        <p><strong>Final Cash:</strong> £${gameState.money}</p>
        <p><strong>High Score:</strong> £${gameState.highScore}</p>
        <p><strong>Small Cargo Landed:</strong> ${gameState.cargoLanded.small}</p>
        <p><strong>Medium Cargo Landed:</strong> ${gameState.cargoLanded.medium}</p>
        <p><strong>Large Cargo Landed:</strong> ${gameState.cargoLanded.large}</p>
        <p><strong>Total Cargo:</strong> ${gameState.cargoLanded.small + gameState.cargoLanded.medium + gameState.cargoLanded.large}</p>
    `;
    
    document.getElementById('game-over').classList.remove('hidden');
}

// Start Game
function startGame() {
    gameState.money = CONFIG.STARTING_MONEY;
    gameState.cargoLanded = { small: 0, medium: 0, large: 0 };
    gameState.running = true;
    gameState.gameOver = false;
    gameState.freightsFallen = 0;
    gameState.currentFallSpeed = CONFIG.INITIAL_FALL_SPEED;
    gameState.planeSpawnInterval = CONFIG.PLANE_SPAWN_INTERVAL;
    gameState.planeSpeed = CONFIG.PLANE_SPEED;
    
    iagPlane = new IAGPlane();
    freight = null;
    competitorPlanes = [];
    particles = [];
    lastPlaneSpawn = 0;
    
    document.getElementById('instructions').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    
    updateUI();
    requestAnimationFrame(gameLoop);
}

// Load high score
const savedHighScore = localStorage.getItem('highScore');
if (savedHighScore) {
    gameState.highScore = parseInt(savedHighScore);
    document.getElementById('high-score').textContent = `£${gameState.highScore}`;
}

// Event Listeners
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && gameState.running) {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});
