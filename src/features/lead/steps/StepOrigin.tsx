import { useCallback, useMemo, useEffect, useRef, type FC } from 'react';
import FormStep from '../FormStep';
import { useQuoteForm } from '@/features/lead/context/useQuoteForm';
import { Warehouse, Ship, Building2, Home, MapPin, XCircle, CheckCircle } from 'lucide-react';

// Origin country is handled in context (assumed CN)

const StepOrigin: FC = () => {
  const {
    currentStep,
    formData,
    setFormData,

    setFieldValid,
    getText,
    userLang,
    getLocationTypeName,
    getLocationTypeDescription,
    getTranslatedPortNameLocal,
    getTranslatedCountryName,
    // Origin context states/handlers
    originPortSearch,
    setOriginPortSearch,
    isOriginPortListVisible,
    setIsOriginPortListVisible,
    getFilteredOriginPorts,
    handleOriginLocationTypeSelect,
    handleOriginPortSelect,
    // Step 3 substeps
    step3SubStep,
    setStep3SubStep,
  } = useQuoteForm();

  const originListRef = useRef<HTMLDivElement>(null);
  const originInputRef = useRef<HTMLInputElement>(null);
  const locationTypeRef = useRef<HTMLDivElement>(null);
  const locationDetailsRef = useRef<HTMLDivElement>(null);

  const t = (key: string, fallback: string): string => getText(key, fallback);
  // Close origin dropdowns on outside click
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!originListRef.current?.contains(target) && !originInputRef.current?.contains(target)) {
        setIsOriginPortListVisible(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [setIsOriginPortListVisible]);

  // Keep origin dropdown fully scrollable within main card and auto-position above when needed
  useEffect(() => {
    const listEl = originListRef.current;
    if (!listEl) return;

    const containerEl = listEl.closest('.quote-form-container') as HTMLElement | null;
    const triggerEl = listEl.previousElementSibling as HTMLElement | null; // search input wrapper

    const adjustDropdown = () => {
      if (!containerEl || !triggerEl) return;

      if (!isOriginPortListVisible) {
        containerEl.style.setProperty('--dropdown-safe-area', '0px');
        listEl.classList.remove('show-above', 'adjust-left', 'adjust-right');
        return;
      }

      const triggerRect = triggerEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();

      // Respect the fixed footer: cap available space to the visible bottom
      const footerEl = document.querySelector('.form-footer') as HTMLElement | null;
      const footerHeight = footerEl ? footerEl.getBoundingClientRect().height : 0;
      const viewportBottom = window.innerHeight - footerHeight;
      const visualBottom = Math.min(containerRect.bottom, viewportBottom);

      const spaceBelow = Math.max(0, visualBottom - triggerRect.bottom - 4);
      const spaceAbove = Math.max(0, triggerRect.top - containerRect.top - 12);
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

      // Keep dropdown strictly inside; no extra padding
      containerEl.style.setProperty('--dropdown-safe-area', '0px');
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
  }, [isOriginPortListVisible, originPortSearch, formData.locationType]);

  // -----------------------
  // Origin dropdown state is provided by context
  // -----------------------

  const filteredPorts = useMemo(() => getFilteredOriginPorts(), [getFilteredOriginPorts]);

  // -----------------------
  // Handlers
  // -----------------------
  const handleLocationTypeSelect = useCallback(
    (typeId: string) => {
      handleOriginLocationTypeSelect(typeId);
      setStep3SubStep(2); // advance to page 2
      setTimeout(() => locationDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    },
    [handleOriginLocationTypeSelect, setStep3SubStep]
  );

  const handlePortSelect = useCallback(
    (code: string) => {
      handleOriginPortSelect(code);
    },
    [handleOriginPortSelect]
  );

  const LOCATION_TYPES = useMemo(
    () => [
      { id: 'factory', icon: Warehouse },
      { id: 'port', icon: Ship },
      { id: 'business', icon: Building2 },
      { id: 'residential', icon: Home },
    ],
    []
  );

  const selectedType = formData.locationType;

  // Smooth scroll to details when switching pages
  useEffect(() => {
    if (currentStep !== 3) return;
    const opts: ScrollIntoViewOptions = { behavior: 'smooth', block: 'start' };
    if (step3SubStep === 1) locationTypeRef.current?.scrollIntoView(opts);
    if (step3SubStep === 2) locationDetailsRef.current?.scrollIntoView(opts);
  }, [step3SubStep, currentStep]);

  // Validation helpers
  const detailsValid = useMemo(() => {
    if (!selectedType) return false;
    if (selectedType === 'port') return !!formData.origin;
    return !!(formData.city && formData.zipCode);
  }, [selectedType, formData.origin, formData.city, formData.zipCode]);

  return (
    <FormStep
      isVisible={currentStep === 3}
      stepNumber={3}
      title={`${t('step3Title', 'Select pickup location in China')}`}
      emoji="🇨🇳"
    >
      {/* Segmented control: Location · Details */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(243, 244, 246, 0.8)',
          borderRadius: '9999px',
          padding: '4px',
          border: '1px solid rgba(229, 231, 235, 0.7)',
          width: '100%',
          maxWidth: '480px',
          margin: '0 0 0.75rem 0',
        }}
      >
        {[
          { n: 1, label: t('tabLocation', 'Location'), done: !!selectedType, onClick: () => setStep3SubStep(1) },
          { n: 2, label: t('tabDetails', 'Details'), done: !!detailsValid, onClick: () => selectedType && setStep3SubStep(2), disabled: !selectedType },
        ].map(({ n, label, done, onClick, disabled }) => {
          const active = step3SubStep === n;
          return (
            <button
              key={n}
              type="button"
              role="tab"
              aria-selected={active ? true : false}
              onClick={() => { if (!disabled) onClick(); }}
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
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
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

      <div className="step-3-container">
        {/* Page 1 – type selection */}
        {step3SubStep === 1 && (
          <div
            className="location-type-selection-phase"
            ref={locationTypeRef}
            style={{
              marginTop: '2rem',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '2rem',
            }}
          >
            <div className="phase-header">
              <h3 className="phase-header-title">
                <span className={selectedType ? 'step-indicator completed' : 'step-indicator'}>
                  1
                </span>
                {t('selectPickupLocationType', 'Sélectionnez votre type de lieu de collecte')}
              </h3>
              <p className="phase-header-subtitle">
                {t('pickupLocationDescription', 'Choisissez où nous devons collecter vos marchandises en Chine')}
              </p>
            </div>
            <div className="location-types grid-2cols">
              {LOCATION_TYPES.map((type) => (
                <div
                  key={type.id}
                  role="button"
                  tabIndex={0}
                  data-id={type.id}
                  className={`location-type-option ${selectedType === type.id ? 'selected' : ''}`}
                  onClick={() => handleLocationTypeSelect(type.id)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
                    e.key === 'Enter' && handleLocationTypeSelect(type.id)
                  }
                >
                  <type.icon size={24} />
                  <span>{getLocationTypeName(type.id, userLang)}</span>
                  <p className="location-desc">{getLocationTypeDescription(type.id, userLang)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Page 2 – details */}
        {step3SubStep === 2 && (
          <div
            className="location-details-phase"
            ref={locationDetailsRef}
            style={{ marginTop: '2rem' }}
          >
            <div className="phase-header">
              <h3 className="phase-header-title">
                <span className={detailsValid ? 'step-indicator completed' : 'step-indicator'}>
                  2
                </span>
                {selectedType === 'port'
                  ? t('selectOriginPort', 'Sélectionnez le port de collecte')
                  : t('enterPickupDetails', 'Entrez les détails de collecte')}
              </h3>
              <p className="phase-header-subtitle">
                {selectedType === 'port'
                  ? t(
                      'selectDestinationPortDescription',
                      "Choisissez le port ou l'aéroport spécifique pour collecte"
                    )
                  : t(
                      'pickupCityPostalDescription',
                      'Fournissez la ville et le code postal pour une collecte précise'
                    )}
              </p>
            </div>
            {selectedType !== 'port' ? (
              <div
                className="address-details"
                style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
              >
                <input
                  type="text"
                  className="input glassmorphism"
                  style={{ flex: '1 0 200px' }}
                  placeholder={t('destinationCity', 'City')}
                  value={formData.city}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const val = e.target.value;
                    setFormData((prev) => ({ ...prev, city: val }));
                    setFieldValid((prev) => ({ ...prev, city: val.trim() ? true : null }));
                  }}
                />
                <input
                  type="text"
                  className="input glassmorphism"
                  style={{ flex: '1 0 200px' }}
                  placeholder={t('destinationZipCode', 'ZIP Code')}
                  value={formData.zipCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const val = e.target.value;
                    setFormData((prev) => ({ ...prev, zipCode: val }));
                    setFieldValid((prev) => ({ ...prev, zipCode: val.trim() ? true : null }));
                  }}
                />
              </div>
            ) : (
              <div className="form-control port-select">
                <div className="search-input-wrapper" style={{ position: 'relative' }}>
                  <MapPin className="search-icon" size={18} />
                  <input
                    type="text"
                    ref={originInputRef}
                    placeholder={`${t('searchDestinationPorts', 'Search ports')}...`}
                    value={originPortSearch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setOriginPortSearch(e.target.value);
                      setIsOriginPortListVisible(true);
                    }}
                    onFocus={() => setIsOriginPortListVisible(true)}
                    className="input glassmorphism search-input"
                    style={{
                      transition: 'all 0.3s ease',
                      transform: formData.origin ? 'scale(1.02)' : 'scale(1)',
                    }}
                  />
                  {formData.origin && (
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
                        setFormData((prev) => ({ ...prev, origin: '' }));
                        setOriginPortSearch('');
                        setFieldValid((prev) => ({ ...prev, origin: null }));
                      }}
                    />
                  )}
                </div>
                <div
                  ref={originListRef}
                  className={`port-list ${isOriginPortListVisible ? 'show' : ''}`}
                >
                  {filteredPorts.length ? (
                    filteredPorts.map((port) => (
                      <div
                        key={port.code}
                        className={`port-option ${formData.origin === port.code ? 'selected' : ''}`}
                        onClick={() => handlePortSelect(port.code)}
                      >
                        <span className="port-icon">{port.flag}</span>
                        <div className="port-info">
                          <span className="port-name">
                            {getTranslatedPortNameLocal(port, userLang)}
                          </span>
                          <span className="port-region">
                            {getTranslatedCountryName('CN', userLang)}
                          </span>
                          {port.volume && (
                            <span className="port-volume">
                              {t('annualVolume', 'Annual Volume')} : {port.volume}
                            </span>
                          )}
                        </div>
                        <span className="port-code">{port.code}</span>
                      </div>
                    ))
                  ) : (
                    <div className="no-results" style={{ padding: '0.75rem' }}>
                      {t('noPortsFoundFor', 'No ports found')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Validation indicator */}
        {detailsValid && (
          <div
            className="selection-feedback"
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'rgba(16,185,129,0.15)',
              border: '2px solid rgba(16,185,129,0.3)',
              borderRadius: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0 }} />
              <span style={{ color: '#047857', fontWeight: 600 }}>
                {selectedType === 'port'
                  ? (() => {
                      const chosen = filteredPorts.find((p) => p.code === formData.origin);
                      const name = chosen ? getTranslatedPortNameLocal(chosen, userLang) : '';
                      return `${t('pickupPortFeedback', "Parfait ! Nous organiserons l'enlèvement depuis")} ${name}`;
                    })()
                  : `${t('pickupCityFeedback', "Parfait ! Nous organiserons l'enlèvement depuis")} ${formData.city}, ${getTranslatedCountryName('CN', userLang)}`}
              </span>
            </div>
          </div>
        )}
      </div>
    </FormStep>
  );
};

export default StepOrigin;
