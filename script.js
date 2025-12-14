// Get DOM elements
const heart = document.getElementById('floating-heart');
const heartShadow = document.getElementById('heart-shadow');
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');
const pulseBtn = document.getElementById('pulse-btn');
const trailBtn = document.getElementById('trail-btn');
const resetBtn = document.getElementById('reset-btn');

// Screen dimensions
let maxWidth = window.innerWidth;
let maxHeight = window.innerHeight;

// Heart position and movement
let posX = maxWidth / 2;
let posY = maxHeight / 2;
let directionX = 1;
let directionY = 0.7; // Slight angle
let speed = 5; // Default medium speed
let trailEnabled = true;
let trailParticles = [];
let lastTrailTime = 0;

// Speed mapping from slider to actual speed
const speedMap = {
    1: 0.3, 2: 0.6, 3: 0.9, 4: 1.2, 5: 1.5,
    6: 1.8, 7: 2.1, 8: 2.4, 9: 2.7, 10: 3.0
};

// Speed label mapping
const speedLabels = {
    1: "Very Slow", 2: "Slow", 3: "Slow", 4: "Medium Slow", 5: "Medium",
    6: "Medium", 7: "Medium Fast", 8: "Fast", 9: "Very Fast", 10: "Extreme"
};

// Calculate heart size (17% of screen)
function calculateHeartSize() {
    const screenSize = Math.min(maxWidth, maxHeight);
    return screenSize * 0.17;
}

// Update heart size based on 17% of screen
function updateHeartSize() {
    const heartSize = calculateHeartSize();
    const minSize = 80; // Minimum size in pixels
    const maxSize = 130; // Maximum size in pixels
    
    // Apply size with min/max constraints
    const finalSize = Math.min(maxSize, Math.max(minSize, heartSize));
    
    heart.style.width = `${finalSize}px`;
    heart.style.height = `${finalSize}px`;
    heartShadow.style.width = `${finalSize}px`;
    heartShadow.style.height = `${finalSize}px`;
    
    // Adjust font size proportionally
    const nameElement = document.querySelector('.heart-name');
    nameElement.style.fontSize = `${finalSize * 0.22}px`;
}

// Initialize heart position and size
updateHeartPosition();
updateHeartSize();

// Update speed from slider
speedSlider.addEventListener('input', function() {
    speed = parseInt(this.value);
    speedValue.textContent = speedLabels[speed];
});

// Pulse button functionality
pulseBtn.addEventListener('click', function() {
    heart.classList.add('pulse');
    setTimeout(() => {
        heart.classList.remove('pulse');
    }, 800);
});

// Trail button functionality
trailBtn.addEventListener('click', function() {
    trailEnabled = !trailEnabled;
    if (trailEnabled) {
        trailBtn.innerHTML = '<i class="fas fa-star"></i> Trail On';
        trailBtn.style.background = 'linear-gradient(to bottom, #ff2e63, #e81c5a)';
    } else {
        trailBtn.innerHTML = '<i class="fas fa-star"></i> Trail Off';
        trailBtn.style.background = 'linear-gradient(to bottom, #aaaaaa, #888888)';
        // Clear existing trail particles
        trailParticles.forEach(particle => {
            if (particle.element && particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
        });
        trailParticles = [];
    }
});

// Reset button functionality
resetBtn.addEventListener('click', function() {
    posX = maxWidth / 2;
    posY = maxHeight / 2;
    directionX = 1;
    directionY = 0.7;
    updateHeartPosition();
    heart.style.transform = 'rotate(-45deg)';
});

// Make heart draggable
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

heart.addEventListener('touchstart', function(e) {
    isDragging = true;
    const touch = e.touches[0];
    const rect = heart.getBoundingClientRect();
    dragOffsetX = touch.clientX - rect.left;
    dragOffsetY = touch.clientY - rect.top;
    
    // Pulse on touch
    heart.classList.add('pulse');
    setTimeout(() => {
        heart.classList.remove('pulse');
    }, 800);
    
    e.preventDefault();
});

document.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const heartWidth = heart.offsetWidth;
    const heartHeight = heart.offsetHeight;
    
    posX = touch.clientX - dragOffsetX + (heartWidth / 2);
    posY = touch.clientY - dragOffsetY + (heartHeight / 2);
    
    // Prevent dragging off screen
    posX = Math.max(heartWidth/2, Math.min(posX, maxWidth - heartWidth/2));
    posY = Math.max(heartHeight/2, Math.min(posY, maxHeight - heartHeight/2));
    
    updateHeartPosition();
    e.preventDefault();
});

document.addEventListener('touchend', function() {
    isDragging = false;
});

// Update heart position
function updateHeartPosition() {
    heart.style.left = `${posX}px`;
    heart.style.top = `${posY}px`;
    
    // Update shadow position with slight delay for depth effect
    heartShadow.style.left = `${posX + 3}px`;
    heartShadow.style.top = `${posY + 5}px`;
}

// Create trail particle
function createTrailParticle() {
    if (!trailEnabled) return;
    
    const now = Date.now();
    if (now - lastTrailTime < 50) return; // Limit trail frequency
    lastTrailTime = now;
    
    const particle = document.createElement('div');
    particle.className = 'trail';
    particle.style.left = `${posX}px`;
    particle.style.top = `${posY}px`;
    particle.style.backgroundColor = `rgba(255, 46, 99, ${Math.random() * 0.4 + 0.2})`;
    particle.style.width = `${Math.random() * 6 + 4}px`;
    particle.style.height = particle.style.width;
    
    document.body.appendChild(particle);
    
    trailParticles.push({
        element: particle,
        life: 100, // frames of life
        x: posX,
        y: posY,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2
    });
    
    // Limit number of particles
    if (trailParticles.length > 30) {
        const oldParticle = trailParticles.shift();
        if (oldParticle.element && oldParticle.element.parentNode) {
            oldParticle.element.parentNode.removeChild(oldParticle.element);
        }
    }
}

// Update trail particles
function updateTrailParticles() {
    for (let i = trailParticles.length - 1; i >= 0; i--) {
        const particle = trailParticles[i];
        particle.life--;
        
        if (particle.life <= 0) {
            if (particle.element && particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
            trailParticles.splice(i, 1);
        } else {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Fade out
            const opacity = particle.life / 100;
            particle.element.style.opacity = opacity;
            
            particle.element.style.left = `${particle.x}px`;
            particle.element.style.top = `${particle.y}px`;
        }
    }
}

// Animation loop to move heart
function animateHeart() {
    if (!isDragging) {
        // Calculate movement based on speed
        const movementSpeed = speedMap[speed];
        
        // Update position based on direction
        posX += directionX * movementSpeed;
        posY += directionY * movementSpeed;
        
        // Get heart dimensions
        const heartWidth = heart.offsetWidth;
        const heartHeight = heart.offsetHeight;
        
        // Bounce off edges
        if (posX <= heartWidth/2 || posX >= maxWidth - heartWidth/2) {
            directionX *= -1;
            // Add slight bounce effect
            heart.style.transform = `rotate(${directionX * 10 - 45}deg)`;
        }
        
        if (posY <= heartHeight/2 || posY >= maxHeight - heartHeight/2) {
            directionY *= -1;
            // Add slight bounce effect
            heart.style.transform = `rotate(${directionY * 10 - 45}deg)`;
        }
        
        // Create trail particles when moving
        if (movementSpeed > 0.5) {
            createTrailParticle();
        }
    }
    
    // Update trail particles
    updateTrailParticles();
    
    // Update heart position
    updateHeartPosition();
    
    // Request next animation frame
    requestAnimationFrame(animateHeart);
}

// Start animation
animateHeart();

// Handle window resize
window.addEventListener('resize', function() {
    // Update max dimensions
    maxWidth = window.innerWidth;
    maxHeight = window.innerHeight;
    
    // Update heart size based on new dimensions
    updateHeartSize();
    
    // Keep heart on screen if window is resized
    const heartWidth = heart.offsetWidth;
    const heartHeight = heart.offsetHeight;
    
    if (posX > maxWidth - heartWidth/2) posX = maxWidth - heartWidth/2;
    if (posY > maxHeight - heartHeight/2) posY = maxHeight - heartHeight/2;
    if (posX < heartWidth/2) posX = heartWidth/2;
    if (posY < heartHeight/2) posY = heartHeight/2;
    
    updateHeartPosition();
});

// Initial floating animation
setTimeout(() => {
    heart.style.transition = 'transform 0.3s ease-out';
    heart.style.transform = 'rotate(-45deg)';
}, 100);