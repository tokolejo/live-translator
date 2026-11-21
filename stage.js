/**
 * IICE 2026 - Stage Display Controller
 * Listens for real-time synchronization from Operator Console via BroadcastChannel
 */

class StageDisplay {
  constructor() {
    this.broadcast = new BroadcastChannel('iice_subtitles_sync');
    this.overlayContainer = document.getElementById('overlayContainer');
    this.subtitleCard = document.getElementById('subtitleCard');
    this.origRow = document.getElementById('origRow');
    this.transRow = document.getElementById('transRow');
    this.originalText = document.getElementById('originalText');
    this.translatedText = document.getElementById('translatedText');
    this.originalLangTag = document.getElementById('originalLangTag');
    this.targetLangTag = document.getElementById('targetLangTag');
    this.stageAnnouncement = document.getElementById('stageAnnouncement');
    this.announcementIcon = document.getElementById('announcementIcon');
    this.announcementTitle = document.getElementById('announcementTitle');
    this.announcementSub = document.getElementById('announcementSub');
    this.stageHint = document.getElementById('stageHint');

    this.fadeoutTimer = null;
    this.autofadeMs = 5000;

    this.init();
  }

  init() {
    this.loadCachedStyles();
    this.bindEvents();

    // Hide helper hint after 4 seconds
    setTimeout(() => {
      if (this.stageHint) {
        this.stageHint.style.opacity = '0';
      }
    }, 4000);

    // Request initial state from main window
    this.broadcast.postMessage({ type: 'request_state' });
  }

  loadCachedStyles() {
    // Read from localStorage to have instant styling before sync message
    const style = localStorage.getItem('subpro_overlay_style') || 'style-oled-black';
    document.body.className = style;

    const width = localStorage.getItem('subpro_card_width') || '92';
    if (this.subtitleCard) {
      this.subtitleCard.style.width = `${width}%`;
    }

    const opacity = localStorage.getItem('subpro_bg_opacity') || '75';
    document.documentElement.style.setProperty('--card-bg-opacity', opacity / 100);

    const transSize = localStorage.getItem('subpro_trans_size') || '36';
    const origSize = localStorage.getItem('subpro_orig_size') || '20';
    if (this.translatedText) this.translatedText.style.fontSize = `${transSize}px`;
    if (this.originalText) this.originalText.style.fontSize = `${origSize}px`;

    const align = localStorage.getItem('subpro_align') || 'center';
    this.overlayContainer.classList.remove('align-center', 'align-left', 'align-right');
    this.overlayContainer.classList.add(`align-${align}`);

    const place = localStorage.getItem('subpro_placement') || 'bottom';
    this.overlayContainer.classList.remove('place-bottom', 'place-top', 'place-middle');
    this.overlayContainer.classList.add(`place-${place}`);

    const showOrig = localStorage.getItem('subpro_show_orig') !== 'false';
    const showTrans = localStorage.getItem('subpro_show_trans') !== 'false';
    if (this.origRow) this.origRow.style.display = showOrig ? 'flex' : 'none';
    if (this.transRow) this.transRow.style.display = showTrans ? 'flex' : 'none';

    const autofade = localStorage.getItem('subpro_autofade') || '5000';
    this.autofadeMs = parseInt(autofade, 10);
  }

  bindEvents() {
    // BroadcastChannel listener
    this.broadcast.onmessage = (e) => {
      const data = e.data;
      if (!data) return;

      switch (data.type) {
        case 'subtitles':
          this.handleSubtitles(data);
          break;
        case 'clear':
          this.clearScreen();
          break;
        case 'style':
          this.applyStyleUpdate(data);
          break;
        case 'banner':
          this.handleBanner(data);
          break;
        case 'state_response':
          this.applyFullState(data);
          break;
      }
    };

    // Fullscreen Hotkey
    window.addEventListener('keydown', (e) => {
      if (e.key === 'f' || e.key === 'F') {
        this.toggleFullscreen();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        this.clearScreen();
      }
    });

    // Double click to toggle fullscreen
    window.addEventListener('dblclick', () => {
      this.toggleFullscreen();
    });
  }

  handleSubtitles(data) {
    if (data.origHtml && this.originalText) {
      this.originalText.innerHTML = data.origHtml;
    }
    if (data.transHtml && this.translatedText) {
      this.translatedText.innerHTML = data.transHtml;
    }
    if (data.origTag && this.originalLangTag) {
      this.originalLangTag.textContent = data.origTag;
    }
    if (data.transTag && this.targetLangTag) {
      this.targetLangTag.textContent = data.transTag;
    }

    if (this.subtitleCard) {
      this.subtitleCard.classList.remove('faded-out');
      if (data.isSpeaking) {
        this.subtitleCard.classList.add('speaking');
      } else {
        this.subtitleCard.classList.remove('speaking');
      }
    }

    this.resetFadeout();
  }

  clearScreen() {
    if (this.originalText) this.originalText.innerHTML = '';
    if (this.translatedText) this.translatedText.innerHTML = '';
    if (this.subtitleCard) {
      this.subtitleCard.classList.add('faded-out');
      this.subtitleCard.classList.remove('speaking');
    }
    clearTimeout(this.fadeoutTimer);
  }

  resetFadeout() {
    clearTimeout(this.fadeoutTimer);
    if (this.autofadeMs > 0) {
      this.fadeoutTimer = setTimeout(() => {
        if (this.subtitleCard) {
          this.subtitleCard.classList.add('faded-out');
          this.subtitleCard.classList.remove('speaking');
        }
      }, this.autofadeMs);
    }
  }

  applyStyleUpdate(data) {
    if (data.bgStyle) {
      document.body.className = data.bgStyle;
    }
    if (data.customBgColor) {
      document.documentElement.style.setProperty('--custom-bg-color', data.customBgColor);
    }
    if (data.bgOpacity !== undefined) {
      document.documentElement.style.setProperty('--card-bg-opacity', data.bgOpacity / 100);
    }
    if (data.cardWidth && this.subtitleCard) {
      this.subtitleCard.style.width = `${data.cardWidth}%`;
    }
    if (data.transSize && this.translatedText) {
      this.translatedText.style.fontSize = `${data.transSize}px`;
    }
    if (data.origSize && this.originalText) {
      this.originalText.style.fontSize = `${data.origSize}px`;
    }
    if (data.alignment && this.overlayContainer) {
      this.overlayContainer.classList.remove('align-center', 'align-left', 'align-right');
      this.overlayContainer.classList.add(`align-${data.alignment}`);
    }
    if (data.placement && this.overlayContainer) {
      this.overlayContainer.classList.remove('place-bottom', 'place-top', 'place-middle');
      this.overlayContainer.classList.add(`place-${data.placement}`);
    }
    if (data.showOrig !== undefined && this.origRow) {
      this.origRow.style.display = data.showOrig ? 'flex' : 'none';
    }
    if (data.showTrans !== undefined && this.transRow) {
      this.transRow.style.display = data.showTrans ? 'flex' : 'none';
    }
    if (data.autofade !== undefined) {
      this.autofadeMs = parseInt(data.autofade, 10);
    }
  }

  applyFullState(data) {
    if (data.styles) {
      this.applyStyleUpdate(data.styles);
    }
    if (data.banner) {
      this.handleBanner(data.banner);
    }
    if (data.currentSubtitles) {
      this.handleSubtitles(data.currentSubtitles);
    }
  }

  handleBanner(data) {
    if (!this.stageAnnouncement) return;
    if (data.active) {
      if (this.announcementIcon) this.announcementIcon.textContent = data.icon || '☕';
      if (this.announcementTitle) this.announcementTitle.textContent = data.title || '';
      if (this.announcementSub) this.announcementSub.textContent = data.sub || '';
      this.stageAnnouncement.classList.add('active');
    } else {
      this.stageAnnouncement.classList.remove('active');
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Fullscreen error:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
}

// Start stage on load
window.addEventListener('DOMContentLoaded', () => {
  new StageDisplay();
});