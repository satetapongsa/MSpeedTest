/* ==========================================================
   MINECRAFT SPEEDTEST - REDSTONE CANVAS GAUGE & PARTICLES
   ========================================================== */

export class RedstoneGauge {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // Disable anti-aliasing for crisp pixel art look
    this.ctx.imageSmoothingEnabled = false;

    this.currentSpeed = 0;
    this.targetSpeed = 0;
    this.maxSpeedScale = 1000; // Mbps max limit

    this.particles = [];
    this.redstoneLamps = 10;
    
    this.initCanvasSize();
    this.startLoop();
  }

  initCanvasSize() {
    this.width = this.canvas.width = 480;
    this.height = this.canvas.height = 260;
    this.centerX = this.width / 2;
    this.centerY = this.height - 40;
    this.radius = 160;
  }

  setSpeed(speedMbps) {
    this.targetSpeed = Math.max(0, speedMbps);

    // Emit redstone particles when speed is updating
    if (Math.abs(this.targetSpeed - this.currentSpeed) > 5) {
      this.spawnParticles(5);
    }
  }

  spawnParticles(count) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI + (Math.random() * Math.PI));
      const dist = this.radius * (0.4 + Math.random() * 0.6);
      this.particles.push({
        x: this.centerX + Math.cos(angle) * dist,
        y: this.centerY + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 2 - 1,
        size: Math.floor(Math.random() * 4) + 4,
        life: 1.0,
        decay: Math.random() * 0.05 + 0.02,
        color: Math.random() > 0.3 ? '#ff2a2a' : '#ffff55'
      });
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  startLoop() {
    const render = () => {
      // Smooth lerp speed transition
      this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.12;

      this.draw();
      this.updateParticles();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Background Outer Arc (Redstone Wire Track)
    ctx.lineWidth = 16;
    ctx.strokeStyle = '#2d0000';
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, Math.PI, 2 * Math.PI);
    ctx.stroke();

    // 2. Calculate Angle for current speed (Logarithmic scale for natural speed feel)
    // Scale: 0 -> 0 Mbps, 0.5 -> 100 Mbps, 1.0 -> 1000 Mbps
    let normalized = 0;
    if (this.currentSpeed > 0) {
      normalized = Math.min(1, Math.log10(this.currentSpeed + 1) / Math.log10(this.maxSpeedScale + 1));
    }
    const currentAngle = Math.PI + (normalized * Math.PI);

    // 3. Draw Active Glowing Redstone Wire Arc
    if (normalized > 0) {
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#ff2a2a';
      ctx.shadowColor = '#ff2a2a';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, this.radius, Math.PI, currentAngle);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    }

    // 4. Draw Redstone Lamps around the perimeter
    for (let i = 0; i < this.redstoneLamps; i++) {
      const lampRatio = i / (this.redstoneLamps - 1);
      const lampAngle = Math.PI + (lampRatio * Math.PI);
      const lampX = this.centerX + Math.cos(lampAngle) * (this.radius + 24);
      const lampY = this.centerY + Math.sin(lampAngle) * (this.radius + 24);
      
      const isLit = normalized >= lampRatio && normalized > 0;

      // Draw Pixel Lamp Block
      const size = 18;
      ctx.fillStyle = isLit ? '#ff9900' : '#4a2500';
      ctx.fillRect(lampX - size/2, lampY - size/2, size, size);
      
      // Lamp border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(lampX - size/2, lampY - size/2, size, size);

      if (isLit) {
        // Lamp Glow Inner Pixel
        ctx.fillStyle = '#ffff55';
        ctx.fillRect(lampX - size/4, lampY - size/4, size/2, size/2);
      }
    }

    // 5. Draw Scale Tick Marks and Speed Labels (e.g. 0, 10, 50, 100, 500, 1000)
    const tickValues = [0, 10, 50, 100, 250, 500, 1000];
    ctx.font = "bold 12px 'VT323', monospace";
    ctx.fillStyle = "#aaaaaa";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    tickValues.forEach(val => {
      const normVal = Math.log10(val + 1) / Math.log10(this.maxSpeedScale + 1);
      const angle = Math.PI + (normVal * Math.PI);
      const textX = this.centerX + Math.cos(angle) * (this.radius - 30);
      const textY = this.centerY + Math.sin(angle) * (this.radius - 30);
      ctx.fillText(val.toString(), textX, textY);
    });

    // 6. Draw Redstone Particle Sparks
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    });
    ctx.globalAlpha = 1.0;

    // 7. Draw Redstone Needle Gauge
    ctx.save();
    ctx.translate(this.centerX, this.centerY);
    ctx.rotate(currentAngle + Math.PI / 2);

    // Needle Stem (Redstone Torch Style)
    ctx.fillStyle = '#ff2a2a';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 8;
    ctx.fillRect(-4, -this.radius + 15, 8, this.radius - 20);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#550000';
    ctx.fillRect(-2, -this.radius + 20, 4, this.radius - 30);

    // Center Redstone Hub Block
    ctx.fillStyle = '#373737';
    ctx.fillRect(-16, -16, 32, 32);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(-16, -16, 32, 32);

    ctx.fillStyle = '#ff2a2a';
    ctx.fillRect(-8, -8, 16, 16);

    ctx.restore();
  }
}
