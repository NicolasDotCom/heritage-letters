const SELECTORS = {
  root: '[data-letters-thread-color]',
  threadRadio: '[data-letters-thread-radio]',
  initialsInput: 'input[name="properties[Iniciales personalizadas]"]',
  productMedia: '.product-media',
  addToCartForm: 'form[data-type="add-to-cart-form"]',
  pickerRadio: 'variant-picker input[type="radio"]',
};

const TECHNIQUE_VALUES = ['bordado', 'repujado'];

const LEATHER_KEYS = {
  liso: ['liso'],
  'texturizado-iguana': ['iguana'],
  'texturizado-piton': ['piton'],
};

const ALLOWED_LEATHERS = {
  repujado: ['liso'],
  bordado: ['liso', 'texturizado-iguana', 'texturizado-piton'],
};

const ALLOWED_COLORS = {
  'liso': ['negro', 'verde oliva', 'tabaco', 'miel', 'naranja', 'azul navy'],
  'texturizado-iguana': ['negro', 'cafe oscuro', 'azul', 'cafe mocca', 'taupe'],
  'texturizado-piton': ['negro', 'rojo', 'miel'],
};

const COLOR_UNION = Object.values(ALLOWED_COLORS).flat();

function normalize(value) {
  return (value || '')
    .toString()
    .toLowerCase()
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/ü/g, 'u')
    .replace(/ñ/g, 'n')
    .trim();
}

function isThreadColorName(value) {
  return COLOR_UNION.includes(normalize(value));
}

function isTechniqueValue(value) {
  return TECHNIQUE_VALUES.includes(normalize(value));
}

function leatherKeyFromValue(value) {
  const normalized = normalize(value);
  for (const [key, needles] of Object.entries(LEATHER_KEYS)) {
    if (needles.some((needle) => normalized.includes(needle))) return key;
  }
  return null;
}

class LettersFundas {
  constructor() {
    this.root = document.querySelector(SELECTORS.root);
    this.syncing = false;

    this.applyAll();
    this.enhanceInitials();

    document.addEventListener('change', (event) => {
      if (!(event.target instanceof Element)) return;
      if (event.target.matches(SELECTORS.threadRadio)) {
        this.applyThreadColor();
        this.clearThreadError();
      }
      if (event.target.matches(SELECTORS.pickerRadio)) {
        this.applyAll();
      }
    });

    document.addEventListener('shopify:product:select', (event) => {
      const promise = event.promise;
      if (promise && typeof promise.then === 'function') {
        promise.then(() => this.applyAll()).catch(() => {});
      }
    });

    window.addEventListener(
      'submit',
      (event) => {
        if (this.syncing) return;
        const form = event.target;
        if (!(form instanceof HTMLFormElement)) return;
        if (!form.matches(SELECTORS.addToCartForm)) return;
        if (this.validate()) return;
        event.preventDefault();
        event.stopPropagation();
        this.showThreadError();
      },
      true
    );
  }

  applyAll() {
    this.applyConstraints();
    this.applyThreadVisibility();
    this.applyOverlay();
    this.applyThreadColor();
    this.colorizeSwatches();
  }

  currentTechnique() {
    for (const radio of this.#checkedPickerRadios()) {
      if (isTechniqueValue(radio.value)) return normalize(radio.value);
    }
    return null;
  }

  currentLeather() {
    for (const radio of this.#checkedPickerRadios()) {
      const key = leatherKeyFromValue(radio.value);
      if (key) return key;
    }
    return 'liso';
  }

  validate() {
    if (!this.root || this.root.hidden) return true;
    const technique = this.currentTechnique();
    if (!technique || technique !== 'bordado') return true;
    return Boolean(document.querySelector(`${SELECTORS.threadRadio}:checked`));
  }

  applyConstraints() {
    const technique = this.currentTechnique();
    const leather = this.currentLeather();
    const allowedLeathers = ALLOWED_LEATHERS[technique] || null;
    const allowedColors = ALLOWED_COLORS[leather] || null;

    for (const radio of this.#pickerRadios()) {
      const leatherKey = leatherKeyFromValue(radio.value);
      if (leatherKey) {
        const permitted = !allowedLeathers || allowedLeathers.includes(leatherKey);
        this.#setRadioState(radio, permitted);
        continue;
      }
      if (isTechniqueValue(radio.value) || !isThreadColorName(radio.value)) continue;
      const colorPermitted = !allowedColors || allowedColors.includes(normalize(radio.value));
      this.#setRadioState(radio, colorPermitted);
    }

    if (this.syncing) return;
    this.#syncSelection(allowedLeathers, allowedColors);
  }

  applyThreadVisibility() {
    if (!this.root) return;
    const technique = this.currentTechnique();
    const hideThread = !technique || technique === 'repujado';
    this.root.hidden = hideThread;
    for (const radio of this.#threadRadios()) {
      radio.disabled = hideThread;
      if (hideThread) radio.checked = false;
    }
  }

  applyOverlay() {
    if (!this.root) return;
    const technique = this.currentTechnique();
    for (const media of document.querySelectorAll(SELECTORS.productMedia)) {
      let overlay = media.querySelector(':scope > .letters-thread-overlay');
      if (!overlay) {
        overlay = document.createElement('span');
        overlay.className = 'letters-thread-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.hidden = true;
        const maskUrl = this.root?.dataset.lettersMaskUrl;
        if (maskUrl) {
          overlay.style.webkitMaskImage = `url("${maskUrl}")`;
          overlay.style.maskImage = `url("${maskUrl}")`;
        }
        media.appendChild(overlay);
      }
      overlay.hidden = technique !== 'bordado';
    }
  }

  applyThreadColor() {
    const checked = document.querySelector(`${SELECTORS.threadRadio}:checked`);
    const label = this.root?.querySelector('[data-letters-thread-selected]');
    if (label) {
      label.textContent = checked ? checked.value : '';
    }
    const hex = this.#threadHex(checked ? checked.value : null);
    for (const overlay of document.querySelectorAll('.letters-thread-overlay')) {
      if (hex) overlay.style.setProperty('--thread-color', hex);
    }
  }

  colorizeSwatches() {
    for (const dot of document.querySelectorAll('[data-thread-color-name]')) {
      if (!(dot instanceof HTMLElement)) continue;
      if (dot.style.backgroundImage && !dot.style.backgroundImage.includes('none')) continue;
      const hex = this.#threadHex(dot.dataset.threadColorName);
      if (hex) dot.style.backgroundColor = hex;
    }
  }

  enhanceInitials() {
    const input = document.querySelector(SELECTORS.initialsInput);
    if (!(input instanceof HTMLInputElement)) return;
    input.maxLength = 3;
    input.setAttribute('pattern', '[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{3}');
    input.setAttribute('inputmode', 'text');
    input.setAttribute('autocapitalize', 'characters');
    input.setAttribute('autocomplete', 'off');
    input.addEventListener('input', () => {
      input.value = input.value
        .toUpperCase()
        .replace(/[^A-ZÁÉÍÓÚÜÑ]/g, '')
        .slice(0, 3);
    });
  }

  showThreadError() {
    const error = this.root?.querySelector('[ref="error"]');
    if (!error) return;
    error.textContent = this.root.dataset.lettersThreadError || 'Selecciona un color de hilo.';
    error.hidden = false;
  }

  clearThreadError() {
    const error = this.root?.querySelector('[ref="error"]');
    if (error) error.hidden = true;
  }

  #pickerRadios() {
    return Array.from(document.querySelectorAll(SELECTORS.pickerRadio));
  }

  #checkedPickerRadios() {
    return this.#pickerRadios().filter((radio) => radio.checked);
  }

  #threadRadios() {
    return Array.from(document.querySelectorAll(SELECTORS.threadRadio));
  }

  #setRadioState(radio, permitted) {
    const label = radio.closest('label');
    if (label instanceof HTMLElement) label.style.display = permitted ? '' : 'none';
    radio.disabled = !permitted;
    if (!permitted) radio.setAttribute('aria-disabled', 'true');
    else radio.removeAttribute('aria-disabled');
  }

  #syncSelection(allowedLeathers, allowedColors) {
    let leather = this.currentLeather();

    if (allowedLeathers && !allowedLeathers.includes(leather)) {
      const target = this.#findRadio((radio) => leatherKeyFromValue(radio.value) === allowedLeathers[0]);
      if (target) {
        this.syncing = true;
        target.checked = true;
        target.dispatchEvent(new Event('change', { bubbles: true }));
        this.syncing = false;
        leather = leatherKeyFromValue(target.value) || leather;
      }
    }

    if (allowedColors) {
      const checkedColor = this.#checkedPickerRadios().find((radio) => isThreadColorName(radio.value));
      if (!checkedColor || !allowedColors.includes(normalize(checkedColor.value))) {
        const target = this.#findRadio(
          (radio) => isThreadColorName(radio.value) && allowedColors.includes(normalize(radio.value)) && !radio.disabled
        );
        if (target) {
          this.syncing = true;
          target.checked = true;
          target.dispatchEvent(new Event('change', { bubbles: true }));
          this.syncing = false;
        }
      }
    }
  }

  #findRadio(predicate) {
    return this.#pickerRadios().find((radio) => !radio.disabled && predicate(radio)) || null;
  }

  #threadHex(name) {
    if (!name) return null;
    const globalScope = window;
    const nameToHandle = globalScope.lettersThreadNameToHandle || {};
    const colors = globalScope.lettersThreadColors || {};
    const handle =
      nameToHandle[name] || `hilo-${normalize(name).replace(/\s+/g, '-')}`;
    return colors[handle] || null;
  }
}

if (!window.__lettersFundas) {
  window.__lettersFundas = new LettersFundas();
}
