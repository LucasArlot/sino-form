export const installDropdownAutoPositioning = () => {
  const adjust = () => {
    // Réduire la hauteur des dropdowns sur mobile
    const isMobile = window.innerWidth <= 768;
    const DROPDOWN_HEIGHT = isMobile ? (window.innerWidth <= 480 ? 150 : 200) : 300;
    
    // Appliquer le positionnement automatique à tous les dropdowns
    const dropdownSelectors = [
      '.port-list.show',
      '.country-list.show', 
      '.custom-dropdown-list.show',
      '.custom-select-dropdown.show'
    ];
    
    dropdownSelectors.forEach(selector => {
      document.querySelectorAll<HTMLElement>(selector).forEach(list => {
      list.classList.add('repositioning');
      // Ignore if list is manually hidden or not in DOM
      if (!list.isConnected) return;
      const trigger = list.previousElementSibling as HTMLElement | null;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      // Cap to visible viewport above fixed footer if present
      const footerEl = document.querySelector('.form-footer') as HTMLElement | null;
      const footerHeight = footerEl ? footerEl.getBoundingClientRect().height : 0;
      
      // Prendre en compte le header et la timeline si présents
      const headerEl = document.querySelector('.form-header') as HTMLElement | null;
      const timelineEl = document.querySelector('.timeline-container') as HTMLElement | null;
      const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;
      const timelineHeight = timelineEl ? timelineEl.getBoundingClientRect().height : 0;
      
      const viewportHeight = window.innerHeight - footerHeight;
      const viewportWidth = window.innerWidth;

      // Calculer l'espace disponible en tenant compte du header/timeline
      const spaceBelow = viewportHeight - rect.bottom - 20; // 20px padding like in CSS
      const spaceAbove = rect.top - Math.max(20, headerHeight + timelineHeight + 20);
      const spaceRight = viewportWidth - rect.left;
      const spaceLeft = rect.right;

      list.classList.remove('show-above', 'adjust-right', 'adjust-left');

      // Vertical check
      if (spaceBelow < DROPDOWN_HEIGHT && spaceAbove > spaceBelow) {
        list.classList.add('show-above');
      }

      // Horizontal check (match logic in CSS)
      if (spaceRight < 300) {
        list.classList.add('adjust-right');
      } else if (spaceLeft < 300) {
        list.classList.add('adjust-left');
      }

      // Update custom properties for max-height calc (used in CSS)
      list.style.setProperty('--dropdown-top', `${rect.bottom}px`);
      list.style.setProperty('--available-space-bottom', `${Math.max(0, spaceBelow)}px`);
      list.style.setProperty('--available-space-top', `${Math.max(0, spaceAbove)}px`);

      // Allow paint in next frame, then reveal
      requestAnimationFrame(() => {
        list.classList.remove('repositioning');
      });
      });
    });
  };

  // Observe events that may affect positioning
  ['scroll', 'resize'].forEach(ev => window.addEventListener(ev, adjust));
  document.addEventListener('click', adjust);
}; 