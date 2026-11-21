/**
 * IICE 2026 - Stage Display Controller
 * Synchronizes 1:1 styling and live subtitles from Operator Console via BroadcastChannel
 */

class StageDisplay {
  constructor() {
    this.broadcast = new BroadcastChannel('iice_subtitles_sync');
    this.overlayContainer = document.getElementById('overlayContainer');
    this.subtitleCard = document.getElementById('subtitleCard');
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

    // Request current state from main console window
    this.broadcast.postMessage({ type: 'request_state' });
  }

  loadCachedStyles() {
    const bgStyle = localStorage.getItem('subpro_overlay_style') || 'style-oled-black';
    const cardWidth = parseInt(localStorage.getItem('subpro_card_width') || '92', 10);
    const bgOpacity = parseInt(localStorage.getItem('subpro_bg_opacity') || '85', 10);
    const transSize = parseInt(localStorage.getItem('subpro_trans_size') || '36', 10);
    const origSize = parseInt(localStorage.getItem('subpro_orig_size') || '20', 10);
    const pos = localStorage.getItem('subpro_position') || 'pos-bottom';
    const align = localStorage.getItem('subpro_text_align') || 'align-center';
    const showOrig = localStorage.getItem('subpro_show_orig') !== 'false';
    const showTrans = localStorage.getItem('subpro_show_trans') !== 'false';
    const twoLines = localStorage.getItem('subpro_two_lines') !== 'false';
    const autofade = parseInt(localStorage.getItem('subpro_autofade') || '5000', 10);
    const customBgColor = localStorage.getItem('subpro_custom_color') || '#0f172a';

    this.applyStyleUpdate({
      bgStyle,
      cardWidth,
      bgOpacity,
      transSize,
      origSize,
      pos,
      align,
      showOrig,
      showTrans,
      twoLines,
      autofade,
      customBgColor
    });
  }

  bindEvents() {
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
      }
    };

    window.addEventListener('keydown', (e) => {
      if (e.key === 'f' || e.key === 'F') {
        this.toggleFullscreen();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        this.clearScreen();
      }
    });

    window.addEventListener('dblclick', () => {
      this.toggleFullscreen();
    });
  }

  handleSubtitles(data) {
    if (data.origHtml !== undefined && this.originalText) {
      this.originalText.innerHTML = data.origHtml;
    }
    if (data.transHtml !== undefined && this.translatedText) {
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
        if (this.subtitleCard && !this.subtitleCard.classList.contains('speaking')) {
          this.subtitleCard.classList.add('faded-out');
        }
      }, this.autofadeMs);
    }
  }

  applyStyleUpdate(data) {
    const validStyles = [
      'style-keynote-pill',
      'style-oled-black',
      'style-cinema-fade',
      'style-broadcast-ticker',
      'style-cyber-neon',
      'style-academic-slate',
      'style-frosted-glass',
      'style-ghost-outline',
      'style-clean-transparent',
      'style-light-paper',
      'style-chroma-green',
      'style-chroma-blue',
      'style-custom-color'
    ];

    if (data.bgStyle) {
      validStyles.forEach(s => document.body.classList.remove(s));
      document.body.classList.add(data.bgStyle);
    }

    if (data.align) {
      ['align-left', 'align-center', 'align-right'].forEach(a => document.body.classList.remove(a));
      document.body.classList.add(data.align);
    }

    if (data.customBgColor) {
      document.documentElement.style.setProperty('--custom-bg-color', data.customBgColor);
    }
    if (data.bgOpacity !== undefined) {
      document.documentElement.style.setProperty('--card-bg-opacity', data.bgOpacity / 100);
    }
    if (data.cardWidth !== undefined) {
      const w = parseInt(data.cardWidth, 10) || 92;
      document.documentElement.style.setProperty('--card-width', `${w}%`);
      document.documentElement.style.setProperty('--card-max-width', `${w}vw`);
      document.body.classList.toggle('card-fullwidth', w >= 99);
    }
    if (data.transSize !== undefined) {
      document.documentElement.style.setProperty('--trans-font-size', `${data.transSize}px`);
    }
    if (data.origSize !== undefined) {
      document.documentElement.style.setProperty('--orig-font-size', `${data.origSize}px`);
    }
    if (data.pos && this.overlayContainer) {
      this.overlayContainer.className = `overlay-container ${data.pos}`;
    }
    if (data.showOrig !== undefined) {
      document.body.classList.toggle('hide-orig-layer', !data.showOrig);
    }
    if (data.showTrans !== undefined) {
      document.body.classList.toggle('hide-trans-layer', !data.showTrans);
    }
    if (data.twoLines !== undefined) {
      document.body.classList.toggle('cinema-two-lines', data.twoLines);
    }
    if (data.autofade !== undefined) {
      this.autofadeMs = parseInt(data.autofade, 10);
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

window.addEventListener('DOMContentLoaded', () => {
  new StageDisplay();
});