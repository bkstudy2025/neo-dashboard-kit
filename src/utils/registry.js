// Neo Dashboard Kit — Card Registry
// Community plugins call NeoDashboard.registerCard() to add new card types.

const _registry = new Map();

export const NeoDashboardRegistry = {
  /**
   * Register a custom card class.
   * @param {string} type - The card type string (e.g. "neo-my-custom-card")
   * @param {CustomElementConstructor} cardClass - A class extending NeoBaseCard or HTMLElement
   */
  registerCard(type, cardClass) {
    if (_registry.has(type)) {
      console.warn(`[Neo Dashboard] Card type "${type}" is already registered. Skipping.`);
      return;
    }
    _registry.set(type, cardClass);
    if (!customElements.get(type)) {
      customElements.define(type, cardClass);
    }
    console.info(`[Neo Dashboard] Registered card: ${type}`);
  },

  getCard(type) {
    return _registry.get(type);
  },

  getAllCards() {
    return Array.from(_registry.entries());
  },
};

// Expose globally so community plugins can use it without importing
window.NeoDashboard = NeoDashboardRegistry;
