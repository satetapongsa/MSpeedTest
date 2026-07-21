/* ==========================================================
   MINECRAFT SPEEDTEST - ADVANCEMENTS & ACHIEVEMENTS SYSTEM
   ========================================================== */

import { soundFx } from './sound-fx.js';

export class AdvancementsManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.unlocked = this.loadUnlocked();

    this.advancements = [
      {
        id: 'FIRST_BENCHMARK',
        title: 'Taking Inventory',
        subtitle: 'ADVANCEMENT MADE!',
        desc: 'Completed your very first network benchmark test!',
        icon: '📦',
        check: (results) => true
      },
      {
        id: 'REDSTONE_ENGINEER',
        title: 'Redstone Master',
        subtitle: 'GOAL ACHIEVED!',
        desc: 'Ultra-low latency achieved! Ping under 10 ms.',
        icon: '⚡',
        check: (results) => results.ping > 0 && results.ping < 10
      },
      {
        id: 'SPEED_DEMON',
        title: 'Speed Demon',
        subtitle: 'CHALLENGE COMPLETE!',
        desc: 'Insane connectivity! Download speed exceeded 500 Mbps.',
        icon: '💎',
        check: (results) => results.download >= 500
      },
      {
        id: 'NETHER_SPEED',
        title: 'Nether Express',
        subtitle: 'ADVANCEMENT MADE!',
        desc: 'Fast transport connection! Download over 200 Mbps.',
        icon: '🔥',
        check: (results) => results.download >= 200 && results.download < 500
      },
      {
        id: 'ELYTRA_FLIGHT',
        title: 'Elytra Sky Rocket',
        subtitle: 'ADVANCEMENT MADE!',
        desc: 'Ultra fast upload speed! Upload exceeded 100 Mbps.',
        icon: '🚀',
        check: (results) => results.upload >= 100
      },
      {
        id: 'STONE_AGE',
        title: 'Wooden Pickaxe Internet',
        subtitle: 'ADVANCEMENT MADE!',
        desc: 'Modest connection detected under 15 Mbps.',
        icon: '⛏️',
        check: (results) => results.download > 0 && results.download < 15
      }
    ];
  }

  loadUnlocked() {
    try {
      return JSON.parse(localStorage.getItem('mc_advancements_unlocked')) || [];
    } catch (e) {
      return [];
    }
  }

  saveUnlocked() {
    try {
      localStorage.setItem('mc_advancements_unlocked', JSON.stringify(this.unlocked));
    } catch (e) {
      console.warn('Could not save advancements to local storage');
    }
  }

  checkAdvancements(results) {
    this.advancements.forEach(adv => {
      if (!this.unlocked.includes(adv.id)) {
        if (adv.check(results)) {
          this.unlocked.push(adv.id);
          this.saveUnlocked();
          this.showNotification(adv);
        }
      }
    });
  }

  showNotification(adv) {
    soundFx.playAdvancement();

    const toast = document.createElement('div');
    toast.className = 'advancement-toast';
    toast.innerHTML = `
      <div class="advancement-icon-frame">${adv.icon}</div>
      <div class="advancement-text">
        <span class="advancement-subtitle">${adv.subtitle}</span>
        <span class="advancement-title">${adv.title}</span>
        <span class="advancement-desc">${adv.desc}</span>
      </div>
    `;

    this.container.appendChild(toast);

    // Auto dismiss toast after 5 seconds
    setTimeout(() => {
      toast.classList.add('slide-out');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 400);
    }, 5000);
  }
}
