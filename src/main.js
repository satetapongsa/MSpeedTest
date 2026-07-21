/* ==========================================================
   MINECRAFT SPEEDTEST - MAIN CONTROLLER & APPLICATION ENTRY
   ========================================================== */

import { soundFx } from './sound-fx.js';
import { RedstoneGauge } from './redstone-gauge.js';
import { SpeedTestEngine } from './speedtest.js';
import { AdvancementsManager } from './advancements.js';

class MinecraftSpeedtestApp {
  constructor() {
    this.gauge = new RedstoneGauge('redstone-canvas');
    this.engine = new SpeedTestEngine();
    this.advancements = new AdvancementsManager('advancement-container');

    this.isTesting = false;
    this.currentBiome = 'overworld';
    this.testHistory = this.loadHistory();

    this.initDOM();
    this.initBackgroundCanvas();
    this.initEvents();
    this.loadNetworkDetails();
    this.renderChestGrid();
  }

  initDOM() {
    this.btnStart = document.getElementById('btn-start');
    this.valPing = document.getElementById('val-ping');
    this.valJitter = document.getElementById('val-jitter');
    this.valDownload = document.getElementById('val-download');
    this.valUpload = document.getElementById('val-upload');

    this.mainSpeedValue = document.getElementById('main-speed-value');
    this.currentPhaseLabel = document.getElementById('current-phase-label');
    this.testStatusBadge = document.getElementById('test-status-badge');
    this.xpBarFill = document.getElementById('xp-bar-fill');
    this.xpLevelText = document.getElementById('xp-level-text');

    this.userIp = document.getElementById('user-ip');
    this.userIsp = document.getElementById('user-isp');
    this.userServer = document.getElementById('user-server');
  }

  // Animated Minecraft Particle Background (Clouds, End Stars, Nether Ashes)
  initBackgroundCanvas() {
    const bgCanvas = document.getElementById('bg-canvas');
    const ctx = bgCanvas.getContext('2d');

    const resize = () => {
      bgCanvas.width = window.innerWidth;
      bgCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * bgCanvas.width,
        y: Math.random() * bgCanvas.height,
        size: Math.floor(Math.random() * 8) + 4,
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: (Math.random() - 0.5) * 1.5,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    const anim = () => {
      ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      
      let pColor = 'rgba(255, 255, 255, 0.4)';
      if (this.currentBiome === 'nether') pColor = 'rgba(255, 80, 0, 0.6)';
      if (this.currentBiome === 'end') pColor = 'rgba(200, 100, 255, 0.5)';
      if (this.currentBiome === 'night') pColor = 'rgba(255, 255, 200, 0.3)';

      ctx.fillStyle = pColor;
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = bgCanvas.width;
        if (p.x > bgCanvas.width) p.x = 0;
        if (p.y < 0) p.y = bgCanvas.height;
        if (p.y > bgCanvas.height) p.y = 0;

        ctx.globalAlpha = p.alpha;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      });
      ctx.globalAlpha = 1.0;

      requestAnimationFrame(anim);
    };
    anim();
  }

  async loadNetworkDetails() {
    const details = await this.engine.fetchNetworkDetails();
    this.userIp.textContent = details.ip;
    this.userIsp.textContent = details.isp;
    this.userServer.textContent = `Cloudflare (${details.city})`;
  }

  initEvents() {
    // Start Speedtest Button
    this.btnStart.addEventListener('click', () => {
      soundFx.playClick();
      if (!this.isTesting) {
        this.runSpeedTest();
      }
    });

    // Hotbar Slot Click Routing
    document.querySelectorAll('.hotbar-slot').forEach(slot => {
      slot.addEventListener('click', (e) => {
        soundFx.playClick();

        document.querySelectorAll('.hotbar-slot').forEach(s => s.classList.remove('active'));
        slot.classList.add('active');

        const action = slot.getAttribute('data-action');
        if (action === 'open-history') this.openModal('modal-history');
        if (action === 'open-biome') this.openModal('modal-biome');
        if (action === 'open-settings') this.openModal('modal-settings');
        if (action === 'toggle-audio') this.toggleAudio(slot);
      });
    });

    // Close Modals
    document.querySelectorAll('.mc-btn-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        soundFx.playClick();
        const modal = e.target.closest('.mc-modal');
        if (modal) modal.classList.remove('active');
      });
    });

    // Biome Selector Buttons
    document.querySelectorAll('.biome-card').forEach(card => {
      card.addEventListener('click', () => {
        soundFx.playClick();
        document.querySelectorAll('.biome-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        const biome = card.getAttribute('data-biome');
        this.setBiome(biome);
      });
    });

    // Settings listeners
    document.getElementById('setting-mode').addEventListener('change', (e) => {
      soundFx.playClick();
      this.engine.setMode(e.target.value);
    });
    document.getElementById('setting-threads').addEventListener('change', (e) => {
      soundFx.playClick();
      this.engine.setThreads(e.target.value);
    });
    document.getElementById('setting-audio').addEventListener('input', (e) => {
      soundFx.setVolume(e.target.value / 100);
    });

    // Clear history button
    document.getElementById('btn-clear-history').addEventListener('click', () => {
      soundFx.playClick();
      this.testHistory = [];
      localStorage.removeItem('mc_speedtest_history');
      this.renderChestGrid();
    });
  }

  setBiome(biome) {
    document.body.className = `biome-${biome}`;
    this.currentBiome = biome;
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  }

  toggleAudio(slotElement) {
    soundFx.muted = !soundFx.muted;
    if (soundFx.muted) {
      slotElement.style.opacity = '0.5';
    } else {
      slotElement.style.opacity = '1.0';
      soundFx.playXpOrb();
    }
  }

  // Core Speed Test Flow Sequence
  async runSpeedTest() {
    this.isTesting = true;
    this.btnStart.disabled = true;
    this.btnStart.querySelector('.btn-text').textContent = 'TESTING IN PROGRESS...';
    this.testStatusBadge.textContent = 'TESTING';
    this.testStatusBadge.classList.add('testing');

    // Reset Display metrics
    this.valPing.textContent = '--';
    this.valJitter.textContent = '--';
    this.valDownload.textContent = '0.00';
    this.valUpload.textContent = '0.00';
    this.gauge.setSpeed(0);
    this.updateXPBar(0, 'LVL 0');

    soundFx.playRedstonePulse();

    // STEP 1: MEASURE LATENCY / PING
    this.currentPhaseLabel.textContent = 'MEASURING REDSTONE PING & JITTER...';
    const pingResults = await this.engine.measurePing((lat) => {
      soundFx.playRedstonePulse();
      this.valPing.textContent = Math.round(lat);
    });

    this.valPing.textContent = pingResults.ping;
    this.valJitter.textContent = pingResults.jitter;
    soundFx.playXpOrb();
    this.updateXPBar(25, 'LVL 25');

    // STEP 2: MEASURE DOWNLOAD SPEED
    this.currentPhaseLabel.textContent = 'TESTING DOWNLOAD SPEED...';
    const downloadSpeed = await this.engine.measureDownload((mbps, pct) => {
      this.valDownload.textContent = mbps.toFixed(2);
      this.mainSpeedValue.textContent = mbps.toFixed(1);
      this.gauge.setSpeed(mbps);
      this.updateXPBar(25 + (pct * 0.4), `LVL ${Math.floor(mbps / 10)}`);
      
      if (Math.random() < 0.2) soundFx.playXpOrb();
    });

    this.valDownload.textContent = downloadSpeed.toFixed(2);
    this.mainSpeedValue.textContent = downloadSpeed.toFixed(1);
    soundFx.playXpOrb();

    // STEP 3: MEASURE UPLOAD SPEED
    this.currentPhaseLabel.textContent = 'TESTING UPLOAD SPEED...';
    const uploadSpeed = await this.engine.measureUpload((mbps, pct) => {
      this.valUpload.textContent = mbps.toFixed(2);
      this.mainSpeedValue.textContent = mbps.toFixed(1);
      this.gauge.setSpeed(mbps);
      this.updateXPBar(65 + (pct * 0.35), `LVL ${Math.floor(mbps / 5)}`);

      if (Math.random() < 0.2) soundFx.playRedstonePulse();
    });

    this.valUpload.textContent = uploadSpeed.toFixed(2);
    this.mainSpeedValue.textContent = downloadSpeed.toFixed(1);
    this.gauge.setSpeed(downloadSpeed); // Return gauge to download result
    this.updateXPBar(100, `LVL ${Math.floor(downloadSpeed)}`);

    // STEP 4: FINISH & SAVE RESULTS
    this.isTesting = false;
    this.btnStart.disabled = false;
    this.btnStart.querySelector('.btn-text').textContent = 'RESTART SPEEDTEST';
    this.testStatusBadge.textContent = 'COMPLETED';
    this.testStatusBadge.classList.remove('testing');
    this.currentPhaseLabel.textContent = 'BENCHMARK COMPLETED!';

    const finalResults = {
      date: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      ping: pingResults.ping,
      jitter: pingResults.jitter,
      download: downloadSpeed,
      upload: uploadSpeed
    };

    // Play victory sound & check advancements
    soundFx.playLevelUp();
    this.advancements.checkAdvancements(finalResults);
    this.saveHistory(finalResults);
  }

  updateXPBar(percent, levelText) {
    this.xpBarFill.style.width = `${Math.min(100, percent)}%`;
    this.xpLevelText.textContent = levelText;
  }

  loadHistory() {
    try {
      return JSON.parse(localStorage.getItem('mc_speedtest_history')) || [];
    } catch (e) {
      return [];
    }
  }

  saveHistory(result) {
    this.testHistory.unshift(result);
    if (this.testHistory.length > 27) {
      this.testHistory.pop(); // Max 27 chest slots
    }
    try {
      localStorage.setItem('mc_speedtest_history', JSON.stringify(this.testHistory));
    } catch (e) {
      console.warn('LocalStorage save failed');
    }
    this.renderChestGrid();
  }

  renderChestGrid() {
    const grid = document.getElementById('chest-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // Render 27 chest slots (3 rows x 9 columns)
    for (let i = 0; i < 27; i++) {
      const slot = document.createElement('div');
      const item = this.testHistory[i];

      if (item) {
        slot.className = 'chest-slot has-item';
        
        let itemIcon = '🧱';
        if (item.download > 300) itemIcon = '💎';
        else if (item.download > 100) itemIcon = '🗡️';
        else if (item.download > 50) itemIcon = '⚡';

        slot.innerHTML = `
          <span class="chest-item-icon">${itemIcon}</span>
          <span class="chest-item-count">${Math.round(item.download)}M</span>
          <div class="chest-slot-tooltip">
            <strong>Time: ${item.date}</strong><br/>
            📥 Download: ${item.download} Mbps<br/>
            📤 Upload: ${item.upload} Mbps<br/>
            ⚔️ Ping: ${item.ping} ms (Jitter: ${item.jitter}ms)
          </div>
        `;
      } else {
        slot.className = 'chest-slot';
      }

      grid.appendChild(slot);
    }
  }
}

// Instantiate application on DOMReady
window.addEventListener('DOMContentLoaded', () => {
  window.mcApp = new MinecraftSpeedtestApp();
});
