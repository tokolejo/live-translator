/**
 * IICE 2026 - Stage Display Controller
 * Synchronizes 1:1 styling and live subtitles with Operator Console via BroadcastChannel
 * Includes interactive Auto-Hiding Quick Control Toolbar directly on the projector screen.
 */

class StageDisplay {
  constructor() {
    this.broadcast = new BroadcastChannel('iice_subtitles_sync');
    this.overlayContainer = document.getElementById('overlayContainer');
    this.subtitleCard = document.getElementById('subtitleCard');
    this.originalText = document.getElementById('originalText');
    this.translatedText = document.getElementById('translatedText');
    this.stageAnnouncement = document.getElementById('stageAnnouncement');
    this.announcementIcon = document.getElementById('announcementIcon');
    this.announcementTitle = document.getElementById('announcementTitle');
    this.announcementSub = document.getElementById('announcementSub');

    // Quick Bar Elements
    this.stageQuickBar = document.getElementById('stageQuickBar');
    this.scTransDec = document.getElementById('scTransDec');
    this.scTransInc = document.getElementById('scTransInc');
    this.scTransVal = document.getElementById('scTransVal');
    this.scToggleOrig = document.getElementById('scToggleOrig');
    this.scOrigDec = document.getElementById('scOrigDec');
    this.scOrigInc = document.getElementById('scOrigInc');
    this.scOrigVal = document.getElementById('scOrigVal');
    this.scStyleSelect = document.getElementById('scStyleSelect');
    this.scClearBtn = document.getElementById('scClearBtn');
    this.scFullscreenBtn = document.getElementById('scFullscreenBtn');

    this.fadeoutTimer = null;
    this.barHideTimer = null;
    this.isHoveringBar = false;
    this.autofadeMs = 5000;

    // Local style state
    this.state = {
      bgStyle: 'style-oled-black',
      cardWidth: 92,
      bgOpacity: 85,
      transSize: 36,
      origSize: 20,
      pos: 'pos-bottom',
      align: 'align-center',
      showOrig: true,
      showTrans: true,
      twoLines: true,
      autofade: 5000,
      customBgColor: '#0f172a'
    };

    this.init();
  }

  init() {
    this.loadCachedStyles();
    this.bindEvents();
    this.scheduleBarHide();

    // Request current state from main console window
    this.broadcast.postMessage({ type: 'request_state' });
  }

  loadCachedStyles() {
    this.state.bgStyle = localStorage.getItem('subpro_overlay_style') || 'style-oled-black';
    this.state.cardWidth = parseInt(localStorage.getItem('subpro_card_width') || '92', 10);
    this.state.bgOpacity = parseInt(localStorage.getItem('subpro_bg_opacity') || '85', 10);
    this.state.transSize = parseInt(localStorage.getItem('subpro_trans_size') || '36', 10);
    this.state.origSize = parseInt(localStorage.getItem('subpro_orig_size') || '20', 10);
    this.state.pos = localStorage.getItem('subpro_position') || 'pos-bottom';
    this.state.align = localStorage.getItem('subpro_text_align') || 'align-center';
    this.state.showOrig = localStorage.getItem('subpro_show_orig') !== 'false';
    this.state.showTrans = localStorage.getItem('subpro_show_trans') !== 'false';
    this.state.twoLines = localStorage.getItem('subpro_two_lines') !== 'false';
    this.state.autofade = parseInt(localStorage.getItem('subpro_autofade') || '5000', 10);
    this.state.customBgColor = localStorage.getItem('subpro_custom_color') || '#0f172a';

    this.applyStyleUpdate(this.state);
  }

  bindEvents() {
    // Sync listener from main operator window
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

    // Show/hide floating quick toolbar on mouse move
    window.addEventListener('mousemove', () => {
      this.showQuickBar();
    });

    if (this.stageQuickBar) {
      this.stageQuickBar.addEventListener('mouseenter', () => {
        this.isHoveringBar = true;
        clearTimeout(this.barHideTimer);
      });
      this.stageQuickBar.addEventListener('mouseleave', () => {
        this.isHoveringBar = false;
        this.scheduleBarHide();
      });
    }

    // Quick Position Buttons
    document.querySelectorAll('.sc-pos-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pos = btn.getAttribute('data-pos');
        if (pos) {
          this.updateAndSyncStyle({ pos });
          localStorage.setItem('subpro_position', pos);
        }
      });
    });

    // Quick Align Buttons
    document.querySelectorAll('.sc-align-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const align = btn.getAttribute('data-align');
        if (align) {
          this.updateAndSyncStyle({ align });
          localStorage.setItem('subpro_text_align', align);
        }
      });
    });

    // Quick Width Buttons
    document.querySelectorAll('.sc-width-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const w = parseInt(btn.getAttribute('data-width'), 10);
        if (w) {
          this.updateAndSyncStyle({ cardWidth: w });
          localStorage.setItem('subpro_card_width', w);
        }
      });
    });

    // Font Size +/- Controls
    if (this.scTransDec) {
      this.scTransDec.addEventListener('click', () => {
        const next = Math.max(18, this.state.transSize - 4);
        this.updateAndSyncStyle({ transSize: next });
        localStorage.setItem('subpro_trans_size', next);
      });
    }
    if (this.scTransInc) {
      this.scTransInc.addEventListener('click', () => {
        const next = Math.min(84, this.state.transSize + 4);
        this.updateAndSyncStyle({ transSize: next });
        localStorage.setItem('subpro_trans_size', next);
      });
    }

    if (this.scOrigDec) {
      this.scOrigDec.addEventListener('click', () => {
        const next = Math.max(12, this.state.origSize - 2);
        this.updateAndSyncStyle({ origSize: next });
        localStorage.setItem('subpro_orig_size', next);
      });
    }
    if (this.scOrigInc) {
      this.scOrigInc.addEventListener('click', () => {
        const next = Math.min(48, this.state.origSize + 2);
        this.updateAndSyncStyle({ origSize: next });
        localStorage.setItem('subpro_orig_size', next);
      });
    }

    if (this.scToggleOrig) {
      this.scToggleOrig.addEventListener('click', () => {
        const next = !this.state.showOrig;
        this.updateAndSyncStyle({ showOrig: next });
        localStorage.setItem('subpro_show_orig', next);
      });
    }

    if (this.scStyleSelect) {
      this.scStyleSelect.addEventListener('change', (e) => {
        const bgStyle = e.target.value;
        this.updateAndSyncStyle({ bgStyle });
        localStorage.setItem('subpro_overlay_style', bgStyle);
      });
    }

    if (this.scClearBtn) {
      this.scClearBtn.addEventListener('click', () => this.clearScreen());
    }
    if (this.scFullscreenBtn) {
      this.scFullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }

    // Keyboard Hotkeys
    window.addEventListener('keydown', (e) => {
      if (e.key === 'f' || e.key === 'F') {
        this.toggleFullscreen();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        this.clearScreen();
      }
    });

    window.addEventListener('dblclick', (e) => {
      // Avoid fullscreen trigger when clicking toolbar buttons
      if (e.target.closest('#stageQuickBar')) return;
      this.toggleFullscreen();
    });
  }

  showQuickBar() {
    if (!this.stageQuickBar) return;
    this.stageQuickBar.classList.add('visible');
    this.scheduleBarHide();
  }

  scheduleBarHide() {
    clearTimeout(this.barHideTimer);
    this.barHideTimer = setTimeout(() => {
      if (!this.isHoveringBar && this.stageQuickBar) {
        this.stageQuickBar.classList.remove('visible');
      }
    }, 3500);
  }

  updateAndSyncStyle(partial) {
    this.applyStyleUpdate(partial);
    // Keep text visible while editing
    if (this.subtitleCard) {
      this.subtitleCard.classList.remove('faded-out');
      this.resetFadeout();
    }
    // Sync back to main operator console
    this.broadcast.postMessage({
      type: 'stage_style_sync',
      styles: this.state
    });
  }

  handleSubtitles(data) {
    if (data.origHtml !== undefined && this.originalText) {
      this.originalText.innerHTML = data.origHtml;
    }
    if (data.transHtml !== undefined && this.translatedText) {
      this.translatedText.innerHTML = data.transHtml;
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
        if (this.subtitleCard && !this.subtitleCard.classList.contains('speaking') && !this.isHoveringBar) {
          this.subtitleCard.classList.add('faded-out');
        }
      }, this.autofadeMs);
    }
  }

  applyStyleUpdate(data) {
    Object.assign(this.state, data);

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
      if (this.scStyleSelect) {
        this.scStyleSelect.value = data.bgStyle;
      }
    }

    if (data.align) {
      ['align-left', 'align-center', 'align-right'].forEach(a => document.body.classList.remove(a));
      document.body.classList.add(data.align);
      document.querySelectorAll('.sc-align-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-align') === data.align);
      });
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
      document.querySelectorAll('.sc-width-btn').forEach(b => {
        b.classList.toggle('active', parseInt(b.getAttribute('data-width'), 10) === w);
      });
    }
    if (data.transSize !== undefined) {
      document.documentElement.style.setProperty('--trans-font-size', `${data.transSize}px`);
      if (this.scTransVal) this.scTransVal.textContent = `${data.transSize}px`;
    }
    if (data.origSize !== undefined) {
      document.documentElement.style.setProperty('--orig-font-size', `${data.origSize}px`);
      if (this.scOrigVal) this.scOrigVal.textContent = `${data.origSize}px`;
    }
    if (data.pos && this.overlayContainer) {
      this.overlayContainer.className = `overlay-container ${data.pos}`;
      document.querySelectorAll('.sc-pos-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-pos') === data.pos);
      });
    }
    if (data.showOrig !== undefined) {
      document.body.classList.toggle('hide-orig-layer', !data.showOrig);
      if (this.scToggleOrig) this.scToggleOrig.classList.toggle('active', data.showOrig);
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