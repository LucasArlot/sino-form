import { useEffect, useRef, memo, type FC } from 'react';
import FormStep from '../FormStep';
import { useQuoteForm } from '@/features/lead/context/useQuoteForm';
import { Search, XCircle, MapPin, CheckCircle, Info } from 'lucide-react';

const StepDestination: FC = () => {
  const {
    currentStep,
    formData,
    setFormData,
    fieldValid,
    setFieldValid,
    userLang,

    // Country search states
    countrySearch,
    setCountrySearch,
    setDebouncedCountrySearch,
    isCountryListVisible,
    setIsCountryListVisible,
    highlightedCountryIndex,
    setHighlightedCountryIndex,

    // Destination port states
    destPortSearch,
    setDestPortSearch,
    isDestPortListVisible,
    setIsDestPortListVisible,

    // Handlers
    handleCountrySelect,
    handleCountrySearchKeyDown,
    clearCountrySelection,
    handleDestLocationTypeSelect,
    handleDestPortSelect,
    handleInputChange,

    // Helper functions
    getDestinationLocationTypes,
    getFilteredDestinationPorts,
    filteredCountries,
    sanitizedCountrySearch,

    // I18N and helpers
    getText,
    getLocationTypeName,
    getLocationTypeDescription,
    getTranslatedPortNameLocal,
    getTranslatedPortType,
    getTranslatedCountryName,
    // Step 1 substep navigation
    step1SubStep,
    setStep1SubStep,
  } = useQuoteForm();

  const countryListRef = useRef<HTMLDivElement>(null);
  const destPortListRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const locationTypeRef = useRef<HTMLDivElement>(null);
  const addressDetailsRef = useRef<HTMLDivElement>(null);

  // Debounce the country search input (200 ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCountrySearch(countrySearch);
    }, 200);
    return () => clearTimeout(handler);
  }, [countrySearch, setDebouncedCountrySearch]);

  // Reset highlighted index when list visibility or search changes
  useEffect(() => {
    if (!isCountryListVisible) {
      setHighlightedCountryIndex(-1);
    } else {
      setHighlightedCountryIndex((prev) => {
        const withinBounds = prev >= 0 && prev < filteredCountries.length;
        return withinBounds ? prev : 0;
      });
    }
  }, [
    isCountryListVisible,
    sanitizedCountrySearch,
    filteredCountries.length,
    setHighlightedCountryIndex,
  ]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (!isCountryListVisible) return;
    if (highlightedCountryIndex < 0 || highlightedCountryIndex >= filteredCountries.length) return;
    const optionElem = document.getElementById(
      `country-option-${filteredCountries[highlightedCountryIndex].code}`
    );
    if (optionElem && optionElem.scrollIntoView) {
      optionElem.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedCountryIndex, isCountryListVisible, filteredCountries]);

  // Keep the country dropdown fully scrollable within the main card
  useEffect(() => {
    const listEl = countryListRef.current;
    if (!listEl) return;

    const containerEl = listEl.closest('.quote-form-container') as HTMLElement | null;
    const triggerEl = searchInputRef.current?.closest('.search-input-wrapper') as HTMLElement | null;

    const adjustCountryDropdown = () => {
      if (!containerEl || !triggerEl) return;

      if (!isCountryListVisible) {
        containerEl.style.setProperty('--dropdown-safe-area', '0px');
        listEl.classList.remove('show-above', 'adjust-left', 'adjust-right');
        return;
      }

      const triggerRect = triggerEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();

      const spaceBelow = Math.max(0, containerRect.bottom - triggerRect.bottom - 20);
      const spaceAbove = Math.max(0, triggerRect.top - containerRect.top - 20);
      const spaceRight = Math.max(0, containerRect.right - triggerRect.left);
      const spaceLeft = Math.max(0, triggerRect.right - containerRect.left);

      const estimatedHeight = Math.min(300, listEl.scrollHeight || 300);
      const showAbove = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
      listEl.classList.toggle('show-above', showAbove);
      listEl.classList.toggle('adjust-right', spaceRight < 200);
      listEl.classList.toggle('adjust-left', spaceLeft < 200);

      listEl.style.setProperty('--dropdown-top', `${triggerRect.bottom}px`);
      listEl.style.setProperty('--available-space-bottom', `${spaceBelow}px`);
      listEl.style.setProperty('--available-space-top', `${spaceAbove}px`);

      const listRect = listEl.getBoundingClientRect();
      const overflowBottom = Math.max(0, listRect.bottom - containerRect.bottom);
      const safeArea = overflowBottom > 0 ? Math.ceil(overflowBottom + 12) : 0;
      containerEl.style.setProperty('--dropdown-safe-area', `${safeArea}px`);
    };

    const raf = requestAnimationFrame(adjustCountryDropdown);
    const onResize = () => adjustCountryDropdown();
    const onScroll = () => adjustCountryDropdown();
    window.addEventListener('resize', onResize, { passive: true } as AddEventListenerOptions);
    window.addEventListener('scroll', onScroll, { passive: true, capture: true } as AddEventListenerOptions);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize as EventListener);
      window.removeEventListener('scroll', onScroll as EventListener, true);
      if (containerEl) containerEl.style.setProperty('--dropdown-safe-area', '0px');
      listEl.classList.remove('show-above', 'adjust-left', 'adjust-right');
    };
  }, [isCountryListVisible, countrySearch]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Country list
      if (
        !countryListRef.current?.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setIsCountryListVisible(false);
      }

      // Destination port list
      if (!destPortListRef.current?.contains(event.target as Node)) {
        setIsDestPortListVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsCountryListVisible, setIsDestPortListVisible]);

  // Keep the destination port dropdown fully scrollable within the main card
  useEffect(() => {
    const listEl = destPortListRef.current;
    if (!listEl) return;

    const containerEl = listEl.closest('.quote-form-container') as HTMLElement | null;
    const triggerEl = listEl.previousElementSibling as HTMLElement | null; // the search input wrapper

    const adjustDropdown = () => {
      if (!containerEl || !triggerEl) return;

      // When hidden, reset safe area and exit
      if (!isDestPortListVisible) {
        containerEl.style.setProperty('--dropdown-safe-area', '0px');
        listEl.classList.remove('show-above', 'adjust-left', 'adjust-right');
        return;
      }

      const triggerRect = triggerEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();

      const spaceBelow = Math.max(0, containerRect.bottom - triggerRect.bottom - 20);
      const spaceAbove = Math.max(0, triggerRect.top - containerRect.top - 20);
      const spaceRight = Math.max(0, containerRect.right - triggerRect.left);
      const spaceLeft = Math.max(0, triggerRect.right - containerRect.left);

      const estimatedHeight = Math.min(300, listEl.scrollHeight || 300);

      // Vertical positioning
      const showAbove = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
      listEl.classList.toggle('show-above', showAbove);

      // Horizontal adjustment
      listEl.classList.toggle('adjust-right', spaceRight < 200);
      listEl.classList.toggle('adjust-left', spaceLeft < 200);

      // Provide CSS vars used by styles for dynamic max-height
      listEl.style.setProperty('--dropdown-top', `${triggerRect.bottom}px`);
      listEl.style.setProperty('--available-space-bottom', `${spaceBelow}px`);
      listEl.style.setProperty('--available-space-top', `${spaceAbove}px`);

      // Compute how much the dropdown exceeds the container bottom and expand padding
      const listRect = listEl.getBoundingClientRect();
      const overflowBottom = Math.max(0, listRect.bottom - containerRect.bottom);
      const safeArea = overflowBottom > 0 ? Math.ceil(overflowBottom + 12) : 0; // add buffer for shadow
      containerEl.style.setProperty('--dropdown-safe-area', `${safeArea}px`);
    };

    const raf = requestAnimationFrame(adjustDropdown);
    const onResize = () => adjustDropdown();
    const onScroll = () => adjustDropdown();
    window.addEventListener('resize', onResize, { passive: true } as AddEventListenerOptions);
    window.addEventListener('scroll', onScroll, { passive: true, capture: true } as AddEventListenerOptions);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize as EventListener);
      window.removeEventListener('scroll', onScroll as EventListener, true);
      if (containerEl) containerEl.style.setProperty('--dropdown-safe-area', '0px');
      listEl.classList.remove('show-above', 'adjust-left', 'adjust-right');
    };
  }, [isDestPortListVisible, destPortSearch, formData.country]);

  // Smooth-scroll to active micro-step container when switching
  useEffect(() => {
    if (currentStep !== 1) return;
    const opts: ScrollIntoViewOptions = { behavior: 'smooth', block: 'start' };
    if (step1SubStep === 2) locationTypeRef.current?.scrollIntoView(opts);
    if (step1SubStep === 3) addressDetailsRef.current?.scrollIntoView(opts);
  }, [step1SubStep, currentStep]);

  const textFor = (key: string) => getText(key);

  return (
    <FormStep
      isVisible={currentStep === 1}
      stepNumber={1}
      title={textFor('step1Title') || 'Destination'}
      emoji="🌍"
    >
      {/* Sub-step segmented control (compact & clickable) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '0.5rem',
          margin: '0.25rem 0 1rem',
        }}
      >
        {(() => {
          // ultra short labels to avoid duplication and overflow
          const tabs = [
            getText('tabCountry', 'Pays'),
            getText('tabLocation', 'Lieu'),
            getText('tabDetails', 'Détails'),
          ];

          const isStep1Done = !!formData.country;
          const isStep2Done = !!formData.destLocationType;
          const isStep3Done = formData.destLocationType === 'port'
            ? !!formData.destPort
            : !!(formData.destCity && formData.destZipCode);

          const canGoTo = (target: number) => {
            if (target === 1) return true;
            if (target === 2) return isStep1Done;
            if (target === 3) return isStep1Done && isStep2Done;
            return false;
          };

          const handleTabClick = (target: number) => {
            if (canGoTo(target)) {
              setStep1SubStep(target);
            } else {
              // Snap to first incomplete step
              if (!isStep1Done) setStep1SubStep(1);
              else if (!isStep2Done) setStep1SubStep(2);
            }
          };

          return (
            <div
              role="tablist"
              aria-label="Sous-étapes"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(243, 244, 246, 0.8)',
                borderRadius: '9999px',
                padding: '4px',
                border: '1px solid rgba(229, 231, 235, 0.7)',
                width: '100%',
                maxWidth: '640px',
              }}
            >
              {tabs.map((label, idx) => {
                const n = idx + 1;
                const active = step1SubStep === n;
                const done = (n === 1 && isStep1Done) || (n === 2 && isStep2Done) || (n === 3 && isStep3Done);
                return (
                  <button
                    key={n}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => handleTabClick(n)}
                    style={{
                      width: '100%',
                      minWidth: 0,
                      padding: '6px 8px',
                      fontSize: '0.85rem',
                      borderRadius: '9999px',
                      background: active ? '#ffffff' : 'transparent',
                      color: active ? '#111827' : '#6b7280',
                      boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      border: active ? '1px solid rgba(0,0,0,0.05)' : '1px solid transparent',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s ease',
                      cursor: canGoTo(n) ? 'pointer' : 'not-allowed',
                      opacity: canGoTo(n) ? 1 : 0.5,
                    }}
                  >
                    <span style={{
                      width: '16px', height: '16px', borderRadius: '50%',
                      background: done ? 'linear-gradient(135deg, #10b981, #059669)' : '#e5e7eb',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '0.7rem',
                    }}>
                      {done ? '✓' : n}
                    </span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
                  </button>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Country Selection with Progressive Disclosure */}
      <div className="step-1-container">
        {/* Phase 1: Country Search (visible when substep is 1) */}
        {step1SubStep === 1 && (
          <div
            className="country-selection-phase"
            style={{
              marginTop: '2rem',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '1.25rem',
            }}
          >
          <div className="phase-header">
            <h3 className="phase-header-title">
              <span className={`step-indicator ${formData.country ? 'completed' : ''}`}>1</span>
              {textFor('selectDestinationCountry') || 'Select destination country'}
            </h3>
            <p className="phase-header-subtitle">
              {textFor('searchCountryDescription') ||
                'Start typing to find your destination country'}
            </p>
          </div>

            <div className="form-control country-select" style={{ marginTop: '0.5rem' }}>
            <div className="search-input-wrapper relative">
              <Search className="search-icon" size={18} />
                  <input
                ref={searchInputRef}
                type="text"
                placeholder={textFor('searchCountry') || 'Search country...'}
                value={countrySearch}
                onChange={(e) => {
                  setCountrySearch(e.target.value);
                  setIsCountryListVisible(true);
                }}
                onFocus={() => setIsCountryListVisible(true)}
                onKeyDown={handleCountrySearchKeyDown}
                role="combobox"
                aria-expanded={isCountryListVisible}
                aria-controls="country-listbox"
                aria-activedescendant={
                  highlightedCountryIndex >= 0 && filteredCountries[highlightedCountryIndex]
                    ? `country-option-${filteredCountries[highlightedCountryIndex].code}`
                    : undefined
                }
                className="input glassmorphism search-input"
              />
              {formData.country && (
                <XCircle
                  size={18}
                  className="clear-search-icon clear-button"
                  onClick={clearCountrySelection}
                  aria-label={textFor('clearCountry') || 'Clear country'}
                />
              )}
            </div>
            <div
              ref={countryListRef}
              id="country-listbox"
              role="listbox"
              aria-expanded={isCountryListVisible}
              className={`country-list ${isCountryListVisible ? 'show' : ''}`}
            >
              {filteredCountries.length > 0
                ? (() => {
                    // Définir les pays prioritaires selon la langue
                    const PRIORITY_COUNTRIES_BY_LANG: Record<string, string[]> = {
                      fr: ['FR', 'BE', 'CH', 'CA', 'LU', 'MC'],
                      en: ['US', 'GB', 'CA', 'AU', 'NZ', 'IE'],
                      de: ['DE', 'AT', 'CH', 'LI'],
                      es: ['ES', 'MX', 'AR', 'CO', 'PE', 'CL'],
                      it: ['IT', 'SM', 'VA', 'CH'],
                      nl: ['NL', 'BE'],
                      pt: ['PT', 'BR', 'AO', 'MZ'],
                      zh: ['CN', 'TW', 'HK', 'MO', 'SG'],
                      ar: ['SA', 'AE', 'EG', 'JO', 'LB', 'MA'],
                      tr: ['TR', 'CY'],
                      ru: ['RU', 'BY', 'KZ', 'KG', 'UA'],
                    };
                    const priorityCountryCodes = PRIORITY_COUNTRIES_BY_LANG[userLang] || [];
                    const priorityCountries = filteredCountries.filter((c) =>
                      priorityCountryCodes.includes(c.code)
                    );
                    const otherCountries = filteredCountries.filter(
                      (c) => !priorityCountryCodes.includes(c.code)
                    );

                    return (
                      <>
                        {/* Section Populaires */}
                        {!sanitizedCountrySearch && priorityCountries.length > 0 && (
                          <>
                            <div
                              className="country-section-header section-header"
                              style={{
                                padding: '0.5rem 0.75rem',
                                backgroundColor: '#f8fafc',
                                borderBottom: '1px solid #e5e7eb',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                              }}
                            >
                              <span style={{ color: '#10b981' }}>⭐</span>
                              {textFor('popular') || 'Popular'}
                            </div>
                            {priorityCountries.map((country, index) => (
                              <div
                                id={`country-option-${country.code}`}
                                role="option"
                                aria-selected={highlightedCountryIndex === index}
                                key={country.code}
                                className={`country-option ${formData.country === country.code ? 'selected' : ''} ${highlightedCountryIndex === index ? 'highlighted' : ''}`}
                                onClick={() => {
                                  handleCountrySelect(country.code);
                                  // auto-advance to sub-step 2
                                  setStep1SubStep(2);
                                  // focus next logical action: location types
                                  setTimeout(() => locationTypeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                                }}
                              >
                                <span className="country-flag">{country.flag}</span>
                                <span className="country-name">
                                  {getTranslatedCountryName(country.code, userLang)}
                                </span>
                                <span className="country-code">{country.code}</span>
                              </div>
                            ))}
                            {otherCountries.length > 0 && (
                              <div
                                className="country-section-header section-header"
                                style={{
                                  padding: '0.5rem 0.75rem',
                                  backgroundColor: '#f1f5f9',
                                  borderBottom: '1px solid #e5e7eb',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  color: '#475569',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  borderRadius: '4px',
                                }}
                              >
                                {textFor('otherCountries') || 'Other Countries'}
                              </div>
                            )}
                          </>
                        )}

                        {/* Reste des pays (ou tous si recherche) */}
                        {(sanitizedCountrySearch ? filteredCountries : otherCountries).map(
                          (country, idx) => {
                            const adjustedIdx = !sanitizedCountrySearch
                              ? idx + priorityCountries.length
                              : idx;
                            return (
                              <div
                                id={`country-option-${country.code}`}
                                role="option"
                                aria-selected={highlightedCountryIndex === adjustedIdx}
                                key={country.code}
                                className={`country-option ${formData.country === country.code ? 'selected' : ''} ${highlightedCountryIndex === adjustedIdx ? 'highlighted' : ''}`}
                                onClick={() => {
                                  handleCountrySelect(country.code);
                                  setStep1SubStep(2);
                                  setTimeout(() => locationTypeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                                }}
                              >
                                <span className="country-flag">{country.flag}</span>
                                <span className="country-name">
                                  {getTranslatedCountryName(country.code, userLang)}
                                </span>
                                <span className="country-code">{country.code}</span>
                              </div>
                            );
                          }
                        )}
                      </>
                    );
                  })()
                : countrySearch.trim() && (
                    <div className="no-results">
                      {textFor('noCountryResults') || 'No countries found'}
                    </div>
                  )}
            </div>
          </div>
        </div>
        )}

        {/* Phase 2: Location Type Selection (substep 2) */}
        {step1SubStep === 2 && (
          <div
            className="location-type-phase"
            ref={locationTypeRef}
            style={{
              marginTop: '2rem',
              opacity: 1,
              transform: 'translateY(0)',
              transition: 'all 0.4s ease',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '2rem',
            }}
          >
            <div className="phase-header">
              <h3 className="phase-header-title">
                <span className={`step-indicator ${formData.destLocationType ? 'completed' : ''}`}>
                  2
                </span>
                {textFor('addressTypeQuestion') || 'What kind of delivery location?'}
              </h3>

              {/* Help hint */}
              <div className="phase-header-subtitle flex-center flex-gap-sm">
                <Info size={14} className="info-icon" />
                <span>
                  {textFor('helpChooseLocation') ||
                    'Not sure? Most beginners choose Business/Office'}
                </span>
              </div>
            </div>

            <div className="location-types grid-2cols">
              {getDestinationLocationTypes().map((type) => (
                <div
                  key={type.id}
                  className={`location-type-option ${formData.destLocationType === type.id ? 'selected' : ''}`}
                  onClick={() => {
                    handleDestLocationTypeSelect(type.id);
                    // Sur mobile, ne pas passer automatiquement à l'étape suivante
                    // pour laisser l'utilisateur lire le texte d'information
                    const isMobile = window.innerWidth <= 768;
                    if (!isMobile) {
                      setStep1SubStep(3);
                    }
                  }}
                  data-id={type.id}
                >
                  <type.icon size={24} />
                  <span>{getLocationTypeName(type.id, userLang)}</span>
                  <p className="location-desc">{getLocationTypeDescription(type.id, userLang)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phase 3: Address Details (substep 3) */}
        {step1SubStep === 3 && (
          <div
            className="address-details-phase"
            ref={addressDetailsRef}
            style={{
              marginTop: '2rem',
              opacity: 1,
              transform: 'translateY(0)',
              transition: 'all 0.4s ease 0.2s',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '2rem',
            }}
          >
            <div className="phase-header">
              <h3 className="phase-header-title">
                <span
                  className={`step-indicator ${
                    (
                      formData.destLocationType === 'port'
                        ? !!formData.destPort
                        : !!(formData.destCity && formData.destZipCode)
                    )
                      ? 'completed'
                      : ''
                  }`}
                >
                  3
                </span>
                {formData.destLocationType === 'port'
                  ? textFor('selectDestinationPort') || 'Select destination port'
                  : textFor('enterDestinationDetails') || 'Enter destination details'}
              </h3>
              <p className="phase-header-subtitle">
                {formData.destLocationType === 'port'
                  ? textFor('selectDestinationPortDescription') ||
                    'Choose the specific port or airport for delivery'
                  : textFor('cityPostalDescription') ||
                    'Enter the city and postal code for delivery'}
              </p>
            </div>

            {formData.destLocationType === 'port' ? (
              // Port selection interface
              <div className="form-control port-select">
                <div className="search-input-wrapper" style={{ position: 'relative' }}>
                  <MapPin className="search-icon" size={18} />
                  <input
                    type="text"
                    placeholder={`${formData.country ? `${getTranslatedCountryName(formData.country, userLang)} — ${textFor('searchDestinationPorts') || 'Search destination ports'}` : ''}`}
                    value={destPortSearch}
                    onChange={(e) => {
                      setDestPortSearch(e.target.value);
                      setIsDestPortListVisible(true);
                    }}
                    onFocus={() => setIsDestPortListVisible(true)}
                    className="input glassmorphism search-input"
                    style={{
                      transition: 'all 0.3s ease',
                      transform: formData.destPort ? 'scale(1.02)' : 'scale(1)',
                    }}
                  />
                  {formData.destPort && (
                    <XCircle
                      size={18}
                      className="clear-search-icon"
                      style={{
                        cursor: 'pointer',
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                      }}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, destPort: '' }));
                        setDestPortSearch('');
                        setFieldValid((prev) => ({ ...prev, destPort: null }));
                      }}
                      aria-label="Clear selected port"
                    />
                  )}
                </div>
                <div
                  ref={destPortListRef}
                  className={`port-list ${isDestPortListVisible ? 'show' : ''}`}
                >
                  {getFilteredDestinationPorts().length > 0 ? (
                    getFilteredDestinationPorts().map((port) => (
                      <div
                        key={port.code}
                        className={`port-option ${formData.destPort === port.code ? 'selected' : ''}`}
                        onClick={() => handleDestPortSelect(port.code)}
                      >
                        <span className="port-icon">{port.flag}</span>
                        <div className="port-info">
                          <span className="port-name">
                            {getTranslatedPortNameLocal(port, userLang)}
                          </span>
                          <span className="port-region">
                            {getTranslatedPortType(port.type || '', userLang)}
                          </span>
                          {port.volume && (
                            <span className="port-volume">
                              {textFor('annualVolume') || 'Annual Volume'} : {port.volume}
                            </span>
                          )}
                        </div>
                        <span className="port-code">{port.code}</span>
                      </div>
                    ))
                  ) : (
                    <div className="no-results">
                      {formData.country
                        ? `${textFor('noPortsFoundFor') || 'No ports found for'} ${getTranslatedCountryName(formData.country, userLang)}`
                        : textFor('selectCountryFirst') || 'Please select a country first'}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Standard city + zip code interface
              <div className="address-form">
                <div
                  className="address-details"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <div className="form-control">
                    <input
                      type="text"
                      name="destCity"
                      placeholder={textFor('destinationCity') || 'Destination City'}
                      value={formData.destCity}
                      onChange={handleInputChange}
                      className={`input glassmorphism ${fieldValid.destCity === false ? 'input-error' : ''}`}
                      style={{
                        transition: 'all 0.3s ease',
                        transform: formData.destCity ? 'scale(1.02)' : 'scale(1)',
                      }}
                    />
                    {fieldValid.destCity === true && <CheckCircle className="check-icon" />}
                  </div>
                  <div className="form-control">
                    <input
                      type="text"
                      name="destZipCode"
                      placeholder={textFor('destinationZipCode') || 'Postal Code'}
                      value={formData.destZipCode}
                      onChange={handleInputChange}
                      className={`input glassmorphism ${fieldValid.destZipCode === false ? 'input-error' : ''}`}
                      style={{
                        transition: 'all 0.3s ease',
                        transform: formData.destZipCode ? 'scale(1.02)' : 'scale(1)',
                      }}
                    />
                    {fieldValid.destZipCode === true && <CheckCircle className="check-icon" />}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </FormStep>
  );
};

export default memo(StepDestination);
