/**
 * IICE Conference Translator - Live Translation Engine
 * Built for International Conferences & OBS Presentation Overlay.
 */

const DEFAULT_IICE_GLOSSARY = `IICE: IICE
აი-აი-სი-ი: IICE
აისი: IICE
არაორგანული ქიმიისა და ელექტროქიმიის ინსტიტუტი: Institute of Inorganic Chemistry and Electrochemistry
რაფიელ აგლაძის სახელობის არაორგანული ქიმიისა და ელექტროქიმიის ინსტიტუტი: Rafiel Agladze Institute of Inorganic Chemistry and Electrochemistry
Rafiel Agladze Institute of Inorganic Chemistry and Electrochemistry: რაფიელ აგლაძის სახელობის არაორგანული ქიმიისა და ელექტროქიმიის ინსტიტუტი
Institute of Inorganic Chemistry and Electrochemistry: არაორგანული ქიმიისა და ელექტროქიმიის ინსტიტუტი
Nanoprocesses and Nanotechnologies: ნანოპროცესები და ნანოტექნოლოგიები
Nanopowders: ნანოფხვნილები
Nanocoatings: ნანოდანაფარები
Nanosensors: ნანოსენსორები
Green Chemistry: მწვანე ქიმია
Heterogeneous Catalysis: ჰეტეროგენული კატალიზი
Homogeneous Catalysis: ჰომოგენური კატალიზი
Photoelectrolysis: ფოტოელექტროლიზი
Electrocatalysis: ელექტროკატალიზი
Nanoelectrochemistry: ნანოელექტროქიმია
Hydrogen Sulfide: გოგირდწყალბადი
Renewable Energy Sources: განახლებადი ენერგიის წყაროები
Wastewater Treatment: ჩამდინარე წყლების გაწმენდა
Semiconductor Thin Films: ნახევარგამტარული თხელი ფენები
Food Chemistry and Quality: სურსათის ქიმია და ხარისხი
STEM+P: STEM+P
Science, Innovation and Policy: მეცნიერება, ინოვაცია და პოლიტიკა
Intellectual Property: ინტელექტუალური საკუთრება
Public Governance: საჯარო მართვა
Circular Models: ცირკულარული მოდელები
Venko Beschkov: ვენკო ბეშკოვი
Dilgam Tagiyev: დილგამ ტაგიევი
Akif Aliyev: აკიფ ალიევი
Adriana Zaleska-Medynska: ადრიანა ზალესკა-მედინსკა
Sylwia Mrozowska: სილვია მროზოვსკა
Andrea Kellenberger: ანდრეა კელენბერგერი
Etibar Ismayilov: ეტიბარ ისმაილოვი
Tinatin Lezhava: თინათინ ლეჟავა
Nikoloz Nioradze: ნიკოლოზ ნიორაძე
Lela Kvinikadze: ლელა კვინიკაძე
Grigor Tatishvili: გრიგორ ტატიშვილი
Natela Ananiashvili: ნათელა ანანიაშვილი
Tamaz Marsagishvili: თამაზ მარსაგიშვილი
Ramaz Katsarava: რამაზ ქაცარავა
Islam Mustafayev: ისლამ მუსტაფაევი
Levan Shavadze: ლევან შავაძე
Mariam Tsatsanashvili: მარიამ ცაცანაშვილი
Georgian National Academy of Sciences: საქართველოს მეცნიერებათა ეროვნული აკადემია
Bulgarian Academy of Sciences: ბულგარეთის მეცნიერებათა აკადემია
University of Gdańsk: გდანსკის უნივერსიტეტი`;

class LiveSubPro {
  constructor() {
    // Toolbar Elements
    this.controlBar = document.getElementById('controlBar');
    this.settingsDrawer = document.getElementById('settingsDrawer');
    this.toggleSettingsBtn = document.getElementById('toggleSettingsBtn');
    this.hideBarBtn = document.getElementById('hideBarBtn');
    this.floatingShowBtn = document.getElementById('floatingShowBtn');
    this.micBtn = document.getElementById('micBtn');
    this.micBtnText = document.getElementById('micBtnText');
    this.clearScreenBtn = document.getElementById('clearScreenBtn');
    
    // Language Switcher
    this.swapLangBtn = document.getElementById('swapLangBtn');
    this.langDirectionText = document.getElementById('langDirectionText');

    // Status & Meter
    this.statusBadge = document.getElementById('statusBadge');
    this.liveIndicator = document.getElementById('liveIndicator');
    this.audioBar = document.getElementById('audioBar');

    // AI Speech Controls
    this.toggleCleanSpeech = document.getElementById('toggleCleanSpeech');
    this.togglePunctuation = document.getElementById('togglePunctuation');
    this.toggleTwoLineLimit = document.getElementById('toggleTwoLineLimit');

    // Drawer Controls - Visibility & Typography
    this.toggleOrigSpeech = document.getElementById('toggleOrigSpeech');
    this.toggleTransSpeech = document.getElementById('toggleTransSpeech');
    this.transSizeSlider = document.getElementById('transSizeSlider');
    this.transSizeVal = document.getElementById('transSizeVal');
    this.origSizeSlider = document.getElementById('origSizeSlider');
    this.origSizeVal = document.getElementById('origSizeVal');

    // Drawer Controls - Style & Layout
    this.overlayStyleSelect = document.getElementById('overlayStyleSelect');
    this.positionSelect = document.getElementById('positionSelect');
    this.bgOpacitySlider = document.getElementById('bgOpacitySlider');
    this.bgOpacityVal = document.getElementById('bgOpacityVal');

    // Automation
    this.autoFadeSelect = document.getElementById('autoFadeSelect');

    // Stage Overlay Elements
    this.overlayContainer = document.getElementById('overlayContainer');
    this.subtitleCard = document.getElementById('subtitleCard');
    this.originalText = document.getElementById('originalText');
    this.translatedText = document.getElementById('translatedText');
    this.originalLangTag = document.getElementById('originalLangTag');
    this.targetLangTag = document.getElementById('targetLangTag');

    // Glossary Modal
    this.openGlossaryBtn = document.getElementById('openGlossaryBtn');
    this.closeGlossaryBtn = document.getElementById('closeGlossaryBtn');
    this.saveGlossaryBtn = document.getElementById('saveGlossaryBtn');
    this.resetGlossaryBtn = document.getElementById('resetGlossaryBtn');
    this.glossaryModal = document.getElementById('glossaryModal');
    this.glossaryInput = document.getElementById('glossaryInput');
    this.glossaryCount = document.getElementById('glossaryCount');

    // State Variables
    this.isListening = false;
    this.recognition = null;
    this.transTimer = null;
    this.fadeoutTimer = null;
    this.meterResetTimer = null;
    this.glossaryRules = [];
    this.transCache = new Map();
    this.lastProcessedSpeech = '';
    this.audioContext = null;
    this.audioStream = null;
    this.analyser = null;
    this.meterAnimFrame = null;

    // Default: English to Georgian (International conference)
    this.currentSrcLang = 'en-US';
    this.currentTgtLang = 'ka';

    // Disfluency patterns
    this.geoFillers = /\b(ანუ|ესე იგი|ხოდა|ამმ|ჰმ|ნუ|მოკლედ რომ ვთქვათ|რავიცი)\b/gi;
    this.engFillers = /\b(uhm|uh|um|you know|sort of|kind of|basically|actually)\b/gi;

    this.init();
  }

  init() {
    this.checkBrowserSupport();
    this.loadSettings();
    this.loadGlossary();
    this.bindEvents();
    this.checkUrlParams();
  }

  checkBrowserSupport() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.updateStatus('error', 'Google Chrome საჭიროა');
      this.micBtn.disabled = true;
      return false;
    }
    return true;
  }

  bindEvents() {
    // Quick Actions
    this.micBtn.addEventListener('click', () => this.toggleListening());
    this.clearScreenBtn.addEventListener('click', () => this.clearScreen());
    this.swapLangBtn.addEventListener('click', () => this.swapLanguages());

    // Drawer Toggles
    this.toggleSettingsBtn.addEventListener('click', () => this.toggleDrawer());
    this.hideBarBtn.addEventListener('click', () => this.toggleControlBar());
    this.floatingShowBtn.addEventListener('click', () => this.toggleControlBar());

    // AI Speech Controls
    this.toggleCleanSpeech.addEventListener('change', (e) => {
      localStorage.setItem('subpro_clean_speech', e.target.checked);
    });

    this.togglePunctuation.addEventListener('change', (e) => {
      localStorage.setItem('subpro_smart_punct', e.target.checked);
    });

    this.toggleTwoLineLimit.addEventListener('change', (e) => {
      document.body.classList.toggle('cinema-two-lines', e.target.checked);
      localStorage.setItem('subpro_two_lines', e.target.checked);
    });

    // Layer Visibilities
    this.toggleOrigSpeech.addEventListener('change', (e) => {
      document.body.classList.toggle('hide-orig-layer', !e.target.checked);
      localStorage.setItem('subpro_show_orig', e.target.checked);
    });

    this.toggleTransSpeech.addEventListener('change', (e) => {
      document.body.classList.toggle('hide-trans-layer', !e.target.checked);
      localStorage.setItem('subpro_show_trans', e.target.checked);
    });

    // Font Sizes
    this.transSizeSlider.addEventListener('input', (e) => {
      const size = `${e.target.value}px`;
      document.documentElement.style.setProperty('--trans-font-size', size);
      this.transSizeVal.textContent = size;
      localStorage.setItem('subpro_trans_size', e.target.value);
    });

    this.origSizeSlider.addEventListener('input', (e) => {
      const size = `${e.target.value}px`;
      document.documentElement.style.setProperty('--orig-font-size', size);
      this.origSizeVal.textContent = size;
      localStorage.setItem('subpro_orig_size', e.target.value);
    });

    // Style & Position
    this.overlayStyleSelect.addEventListener('change', (e) => this.setOverlayStyle(e.target.value));
    this.positionSelect.addEventListener('change', (e) => this.setPosition(e.target.value));
    
    this.bgOpacitySlider.addEventListener('input', (e) => {
      const val = e.target.value / 100;
      document.documentElement.style.setProperty('--card-bg-opacity', val);
      this.bgOpacityVal.textContent = `${e.target.value}%`;
      localStorage.setItem('subpro_bg_opacity', e.target.value);
    });

    this.autoFadeSelect.addEventListener('change', (e) => {
      localStorage.setItem('subpro_autofade', e.target.value);
    });

    // Glossary Modal
    this.openGlossaryBtn.addEventListener('click', () => {
      this.glossaryModal.style.display = 'flex';
      this.glossaryModal.classList.add('active');
      this.glossaryModal.classList.remove('hidden');
    });
    this.closeGlossaryBtn.addEventListener('click', () => {
      this.glossaryModal.style.display = 'none';
      this.glossaryModal.classList.remove('active');
      this.glossaryModal.classList.add('hidden');
    });
    this.saveGlossaryBtn.addEventListener('click', () => this.saveGlossary());
    if (this.resetGlossaryBtn) {
      this.resetGlossaryBtn.addEventListener('click', () => this.resetToIiceGlossary());
    }

    // Hotkeys
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      if (e.key === 'h' || e.key === 'H') {
        this.toggleControlBar();
      } else if (e.key === 'c' || e.key === 'C') {
        this.clearScreen();
      } else if (e.code === 'Space') {
        e.preventDefault();
        this.toggleListening();
      }
    });
  }

  toggleDrawer() {
    this.settingsDrawer.classList.toggle('hidden');
    this.toggleSettingsBtn.classList.toggle('btn-primary', !this.settingsDrawer.classList.contains('hidden'));
  }

  toggleControlBar() {
    this.controlBar.classList.toggle('hidden');
    const isHidden = this.controlBar.classList.contains('hidden');
    this.floatingShowBtn.style.display = isHidden ? 'flex' : 'none';
  }

  setOverlayStyle(styleClass) {
    const validStyles = [
      'style-keynote-pill',
      'style-cinema-fade',
      'style-ghost-outline',
      'style-broadcast-ticker',
      'style-frosted-glass',
      'style-chroma-green'
    ];
    validStyles.forEach(s => document.body.classList.remove(s));
    document.body.classList.add(styleClass);
    localStorage.setItem('subpro_overlay_style', styleClass);
  }

  setPosition(pos) {
    this.overlayContainer.className = `overlay-container ${pos}`;
    localStorage.setItem('subpro_position', pos);
  }

  swapLanguages() {
    if (this.currentSrcLang === 'en-US') {
      this.currentSrcLang = 'ka-GE';
      this.currentTgtLang = 'en';
      if (this.langDirectionText) {
        this.langDirectionText.textContent = '🇬🇪 ქართული ➔ 🇺🇸 English';
      }
      this.originalLangTag.textContent = 'GEO';
      this.targetLangTag.textContent = 'ENG';
    } else {
      this.currentSrcLang = 'en-US';
      this.currentTgtLang = 'ka';
      if (this.langDirectionText) {
        this.langDirectionText.textContent = '🇺🇸 English ➔ 🇬🇪 ქართული';
      }
      this.originalLangTag.textContent = 'ENG';
      this.targetLangTag.textContent = 'GEO';
    }

    localStorage.setItem('subpro_src_lang', this.currentSrcLang);
    localStorage.setItem('subpro_tgt_lang', this.currentTgtLang);

    // If currently listening, seamlessly switch language
    if (this.recognition && this.isListening) {
      try {
        this.recognition.lang = this.currentSrcLang;
        this.recognition.stop();
      } catch (e) {
        console.warn('Lang restart note:', e);
      }
    }
  }

  clearScreen() {
    this.originalText.innerHTML = '<span class="placeholder-hint">გასუფთავებულია...</span>';
    this.translatedText.innerHTML = '<span class="placeholder-hint">გასუფთავებულია...</span>';
    this.subtitleCard.classList.remove('speaking');
    this.audioBar.style.width = '0%';
    this.lastProcessedSpeech = '';
  }

  resetFadeoutTimer() {
    this.subtitleCard.classList.remove('faded-out');
    clearTimeout(this.fadeoutTimer);

    const fadeMs = parseInt(this.autoFadeSelect.value, 10);
    if (fadeMs > 0) {
      this.fadeoutTimer = setTimeout(() => {
        if (!this.subtitleCard.classList.contains('speaking')) {
          this.subtitleCard.classList.add('faded-out');
        }
      }, fadeMs);
    }
  }

  cleanDisfluencies(text) {
    if (!this.toggleCleanSpeech.checked || !text) return text;
    let cleaned = text;
    if (this.currentSrcLang.startsWith('ka')) {
      cleaned = cleaned.replace(this.geoFillers, '');
    } else {
      cleaned = cleaned.replace(this.engFillers, '');
    }
    return cleaned.replace(/\s+/g, ' ').trim();
  }

  applySmartPunctuation(text, isFinal) {
    if (!this.togglePunctuation.checked || !text) return text;

    let punctuated = text.trim();
    if (!punctuated) return '';

    punctuated = punctuated.charAt(0).toUpperCase() + punctuated.slice(1);

    if (this.currentSrcLang.startsWith('ka')) {
      punctuated = punctuated.replace(/\s+(რომ|მაგრამ|თუმცა|რადგან|ამიტომ|ხოლო|როდესაც)\b/gi, ', $1');
    } else {
      punctuated = punctuated.replace(/\s+(however|therefore|because|although|which)\b/gi, ', $1');
    }

    punctuated = punctuated.replace(/,\s*,/g, ',');

    if (isFinal && !/[.!?]$/.test(punctuated)) {
      punctuated += '.';
    }

    return punctuated;
  }

  enforceCinemaLength(text) {
    if (!this.toggleTwoLineLimit.checked || !text) return text;
    const words = text.split(' ');
    if (words.length > 20) {
      return '... ' + words.slice(-18).join(' ');
    }
    return text;
  }

  loadGlossary() {
    const raw = localStorage.getItem('subpro_glossary') || DEFAULT_IICE_GLOSSARY;
    this.glossaryInput.value = raw;
    this.parseGlossary(raw);
  }

  saveGlossary() {
    const raw = this.glossaryInput.value;
    localStorage.setItem('subpro_glossary', raw);
    this.parseGlossary(raw);
    this.glossaryModal.style.display = 'none';
    this.glossaryModal.classList.remove('active');
    this.glossaryModal.classList.add('hidden');
  }

  resetToIiceGlossary() {
    this.glossaryInput.value = DEFAULT_IICE_GLOSSARY;
    this.saveGlossary();
  }

  parseGlossary(raw) {
    this.glossaryRules = [];
    const lines = raw.split('\n');
    lines.forEach(line => {
      const parts = line.split(':');
      if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
        this.glossaryRules.push({
          from: new RegExp(parts[0].trim(), 'gi'),
          to: parts[1].trim()
        });
      }
    });
    this.glossaryCount.textContent = this.glossaryRules.length;
  }

  applyGlossary(text) {
    let result = text;
    this.glossaryRules.forEach(rule => {
      result = result.replace(rule.from, rule.to);
    });
    return result;
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  loadSettings() {
    const showOrig = localStorage.getItem('subpro_show_orig') !== 'false';
    const showTrans = localStorage.getItem('subpro_show_trans') !== 'false';
    const transSize = localStorage.getItem('subpro_trans_size') || '32';
    const origSize = localStorage.getItem('subpro_orig_size') || '20';
    const style = localStorage.getItem('subpro_overlay_style') || 'style-keynote-pill';
    const pos = localStorage.getItem('subpro_position') || 'pos-bottom';
    const opacity = localStorage.getItem('subpro_bg_opacity') || '85';
    const autoFade = localStorage.getItem('subpro_autofade') || '5000';
    
    // Default: English to Georgian
    const srcLang = localStorage.getItem('subpro_src_lang') || 'en-US';
    const tgtLang = localStorage.getItem('subpro_tgt_lang') || 'ka';

    const cleanSpeech = localStorage.getItem('subpro_clean_speech') !== 'false';
    const smartPunct = localStorage.getItem('subpro_smart_punct') !== 'false';
    const twoLines = localStorage.getItem('subpro_two_lines') !== 'false';

    this.toggleCleanSpeech.checked = cleanSpeech;
    this.togglePunctuation.checked = smartPunct;
    this.toggleTwoLineLimit.checked = twoLines;
    document.body.classList.toggle('cinema-two-lines', twoLines);

    this.toggleOrigSpeech.checked = showOrig;
    document.body.classList.toggle('hide-orig-layer', !showOrig);

    this.toggleTransSpeech.checked = showTrans;
    document.body.classList.toggle('hide-trans-layer', !showTrans);

    this.transSizeSlider.value = transSize;
    this.transSizeVal.textContent = `${transSize}px`;
    document.documentElement.style.setProperty('--trans-font-size', `${transSize}px`);

    this.origSizeSlider.value = origSize;
    this.origSizeVal.textContent = `${origSize}px`;
    document.documentElement.style.setProperty('--orig-font-size', `${origSize}px`);

    this.overlayStyleSelect.value = style;
    this.setOverlayStyle(style);

    this.positionSelect.value = pos;
    this.setPosition(pos);

    this.bgOpacitySlider.value = opacity;
    this.bgOpacityVal.textContent = `${opacity}%`;
    document.documentElement.style.setProperty('--card-bg-opacity', opacity / 100);

    this.autoFadeSelect.value = autoFade;

    this.currentSrcLang = srcLang;
    this.currentTgtLang = tgtLang;

    if (this.langDirectionText) {
      this.langDirectionText.textContent = srcLang === 'en-US' 
        ? '🇺🇸 English ➔ 🇬🇪 ქართული' 
        : '🇬🇪 ქართული ➔ 🇺🇸 English';
    }
    this.originalLangTag.textContent = srcLang.startsWith('en') ? 'ENG' : 'GEO';
    this.targetLangTag.textContent = tgtLang === 'ka' ? 'GEO' : 'ENG';
  }

  checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('overlay') === '1' || params.get('overlay') === 'true') {
      this.controlBar.classList.add('hidden');
    }
  }

  // Audio Level Visualizer
  async startAudioMeter() {
    try {
      if (this.audioStream) return;
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.audioStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 128;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const renderMeter = () => {
        if (!this.isListening) {
          this.audioBar.style.width = '0%';
          return;
        }
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const percent = Math.min(100, Math.round((avg / 64) * 100));
        this.audioBar.style.width = `${Math.max(4, percent)}%`;

        if (percent > 20) {
          this.subtitleCard.classList.add('speaking');
          this.resetFadeoutTimer();
        }

        this.meterAnimFrame = requestAnimationFrame(renderMeter);
      };
      renderMeter();
    } catch (e) {
      console.warn('Audio meter note:', e);
    }
  }

  stopAudioMeter() {
    if (this.meterAnimFrame) {
      cancelAnimationFrame(this.meterAnimFrame);
      this.meterAnimFrame = null;
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }
    this.audioBar.style.width = '0%';
  }

  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('გთხოვთ გამოიყენოთ Google Chrome ბრაუზერი.');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.currentSrcLang;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateStatus('listening', '🎙️ ეთერშია (გისმენთ)...');
        this.micBtn.classList.add('recording');
        this.micBtnText.textContent = 'გათიშვა';
        this.liveIndicator.classList.add('active');
        this.resetFadeoutTimer();
        this.startAudioMeter();

        if (this.originalText.querySelector('.placeholder-hint')) {
          this.originalText.innerHTML = '<span class="placeholder-hint">🎙️ გისმენთ... ისაუბრეთ მიკროფონში</span>';
        }
      };

      this.recognition.onspeechstart = () => {
        this.subtitleCard.classList.add('speaking');
        this.resetFadeoutTimer();
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript + ' ';
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const activeWords = (finalTranscript || interimTranscript).trim();

        if (activeWords) {
          let displaySpeech = this.cleanDisfluencies(activeWords);
          displaySpeech = this.enforceCinemaLength(displaySpeech);
          this.originalText.innerHTML = `<span>${this.escapeHtml(displaySpeech)}</span>`;

          this.subtitleCard.classList.remove('faded-out');
          this.subtitleCard.classList.add('speaking');
          this.resetFadeoutTimer();

          clearTimeout(this.transTimer);
          if (finalTranscript.trim()) {
            this.handleTranslation(finalTranscript.trim(), true);
          } else if (interimTranscript.trim()) {
            this.transTimer = setTimeout(() => {
              this.handleTranslation(interimTranscript.trim(), false);
            }, 300);
          }
        }
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition status:', event.error);
        if (event.error === 'not-allowed') {
          this.updateStatus('error', '❌ მიკროფონი დაბლოკილია Chrome-ში');
          this.stopListening();
        } else if (event.error === 'network') {
          this.updateStatus('error', '⚠️ ინტერნეტის კავშირი გაწყდა');
        } else if (event.error === 'audio-capture') {
          this.updateStatus('error', '❌ მიკროფონი ვერ მოიძებნა');
        } else if (event.error !== 'no-speech') {
          this.updateStatus('error', 'სტატუსი: ' + event.error);
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          setTimeout(() => {
            if (this.isListening && this.recognition) {
              try {
                this.recognition.start();
              } catch (e) {
                console.log('Stream reconnect note:', e);
              }
            }
          }, 250);
        } else {
          this.cleanup();
        }
      };

      this.recognition.start();
    } catch (err) {
      console.error('Recognition start error:', err);
      this.updateStatus('error', 'შეცდომა: ' + err.message);
      this.cleanup();
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.stopAudioMeter();
    this.cleanup();
  }

  cleanup() {
    this.isListening = false;
    this.updateStatus('idle', 'მზადაა');
    this.micBtn.classList.remove('recording');
    this.micBtnText.textContent = 'ჩართვა';
    this.liveIndicator.classList.remove('active');
    this.subtitleCard.classList.remove('speaking');
    this.audioBar.style.width = '0%';
    this.resetFadeoutTimer();
  }

  async handleTranslation(clauseText, isFinal) {
    if (!clauseText || clauseText.trim() === '') return;

    let polished = this.cleanDisfluencies(clauseText);
    polished = this.applyGlossary(polished);
    polished = this.applySmartPunctuation(polished, isFinal);

    if (polished === this.lastProcessedSpeech && !isFinal) return;
    this.lastProcessedSpeech = polished;

    this.updateStatus('translating', '🔄 თარგმნა...');

    try {
      const srcCode = this.currentSrcLang.split('-')[0];
      const tgtCode = this.currentTgtLang;

      let translated = await this.fetchTranslation(polished, srcCode, tgtCode);

      if (translated) {
        translated = this.applyGlossary(translated);
        if (isFinal && !/[.!?]$/.test(translated)) {
          translated += '.';
        }
        translated = this.enforceCinemaLength(translated);

        this.translatedText.innerHTML = `<span>${this.escapeHtml(translated)}</span>`;
      }

      this.subtitleCard.classList.remove('speaking');
      this.resetFadeoutTimer();
      this.updateStatus('listening', '🎙️ ეთერშია (გისმენთ)...');
    } catch (err) {
      console.error('Translation error:', err);
      this.updateStatus('listening', '🎙️ ეთერშია (გისმენთ)...');
    }
  }

  /**
   * Resilient Google Translation API with official Chrome Extension client
   */
  async fetchTranslation(text, sl, tl) {
    const cacheKey = `${sl}_${tl}_${text.trim().toLowerCase()}`;
    if (this.transCache.has(cacheKey)) {
      return this.transCache.get(cacheKey);
    }

    // Endpoint 1: dict-chrome-ex (highest reliability, no 429)
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) {
          const result = data[0].map(item => item[0]).join('');
          this.transCache.set(cacheKey, result);
          return result;
        }
      }
    } catch (err) {
      console.warn('Endpoint 1 note, checking endpoint 2...');
    }

    // Endpoint 2: client=it
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=it&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) {
          const result = data[0].map(item => item[0]).join('');
          this.transCache.set(cacheKey, result);
          return result;
        }
      }
    } catch (err) {
      console.warn('Endpoint 2 note, checking endpoint 3...');
    }

    // Endpoint 3: client=gtx
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) {
          const result = data[0].map(item => item[0]).join('');
          this.transCache.set(cacheKey, result);
          return result;
        }
      }
    } catch (err) {
      console.error('All translation endpoints exhausted:', err);
    }

    return null;
  }

  updateStatus(type, msg) {
    this.statusBadge.className = `status-badge status-${type}`;
    this.statusBadge.textContent = msg;
  }
}

// Start application
window.addEventListener('DOMContentLoaded', () => {
  window.subApp = new LiveSubPro();
});
