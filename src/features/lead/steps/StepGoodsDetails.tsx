import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FormStep from '../FormStep';
import { useQuoteForm } from '@/features/lead/context/useQuoteForm';
import { CheckCircle, Info } from 'lucide-react';
import { attachDropdownDebug } from '@/lib/debugDropdown';

const StepGoodsDetails: React.FC = () => {
  const {
    currentStep,
    formData,
    setFormData,
    fieldValid,
    userLang,
    getText,
    handleInputChange,
    step5SubStep,
    setStep5SubStep,
    nextStep,

    // Currency (from context)
    currencySearch,
    setCurrencySearch,
    isCurrencyListVisible,
    setIsCurrencyListVisible,
    handleCurrencySelect,
  } = useQuoteForm();

  // Safe translator with fallback to English and a provided default
  const t = useCallback((key: string, fallback: string): string => getText(key, fallback), [getText]);

  // Local UI states for Step 5 dropdowns
  const [timingSearch, setTimingSearch] = useState('');
  const [isTimingListVisible, setIsTimingListVisible] = useState(false);
  const [requirementsSearch, setRequirementsSearch] = useState('');
  const [isRequirementsListVisible, setIsRequirementsListVisible] = useState(false);

  // Refs for dropdown DOM nodes
  const currencyListRef = useRef<HTMLDivElement>(null);
  const timingListRef = useRef<HTMLDivElement>(null);
  const requirementsListRef = useRef<HTMLDivElement>(null);

  // Options (copied from QuoteForm.tsx for component encapsulation)
  const CURRENCY_OPTIONS = useMemo(
    () => [
      { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
      { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
      { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
      { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
      { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
      { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
      { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
    ],
    []
  );

  const TIMING_OPTIONS = useMemo(
    () => [
      {
        code: 'yes',
        name: 'Ready now',
        description: 'goods are available for immediate pickup',
        icon: '🟢',
      },
      { code: 'no_in_1_week', name: 'Within 1 week', description: 'currently preparing', icon: '🗓️' },
      {
        code: 'no_in_2_weeks',
        name: 'Within 2 weeks',
        description: 'production in progress',
        icon: '🗓️',
      },
      { code: 'no_in_1_month', name: 'Within 1 month', description: 'planning ahead', icon: '🗓️' },
      { code: 'no_date_set', name: 'Date not determined yet', description: '', icon: '❔' },
    ],
    []
  );

  const REQUIREMENTS_OPTIONS = useMemo(
    () => [
      { code: '', name: 'No special requirements', description: '', icon: '🟢' },
      { code: 'fragile', name: 'Fragile goods', description: 'handle with care', icon: '📦' },
      { code: 'temperature', name: 'Temperature controlled', description: '', icon: '🧊' },
      { code: 'urgent', name: 'Urgent/time-sensitive', description: '', icon: '🚀' },
      { code: 'insurance', name: 'High-value insurance required', description: '', icon: '💎' },
      {
        code: 'other',
        name: 'Other',
        description: t('pleaseSpecifyInRemarks', 'Please specify in remarks'),
        icon: '➕',
      },
    ],
    [t]
  );

  const cleanEmojiFromText = useCallback((text: string | undefined): string => {
    const safe = text ?? '';
    return safe.replace(/^\p{Extended_Pictographic}+\s*/u, '').trim();
  }, []);

  const handleTimingSelect = (timingCode: string) => {
    const timing = TIMING_OPTIONS.find((t) => t.code === timingCode);
    setFormData({
      ...formData,
      areGoodsReady: timingCode,
    });

    let translatedName = '';
    switch (timingCode) {
      case 'yes':
        translatedName = cleanEmojiFromText(
          t('readyNow', 'Ready now - goods are available for immediate pickup')
        );
        break;
      case 'no_in_1_week':
        translatedName = cleanEmojiFromText(
          t('readyIn1Week', 'Within 1 week - currently preparing')
        );
        break;
      case 'no_in_2_weeks':
        translatedName = cleanEmojiFromText(
          t('readyIn2Weeks', 'Within 2 weeks - production in progress')
        );
        break;
      case 'no_in_1_month':
        translatedName = cleanEmojiFromText(t('readyIn1Month', 'Within 1 month - planning ahead'));
        break;
      case 'no_date_set':
        translatedName = cleanEmojiFromText(t('dateNotSet', 'Date not determined yet'));
        break;
    }
    setTimingSearch(timing ? `${timing.icon}  ${translatedName}` : timingCode);
    setIsTimingListVisible(false);
    
    // Automatically advance to substep 3 (Details) after timing selection
    setStep5SubStep(3);
  };

  const handleRequirementsSelect = (requirementCode: string) => {
    const requirement = REQUIREMENTS_OPTIONS.find((r) => r.code === requirementCode);
    setFormData({
      ...formData,
      specialRequirements: requirementCode,
    });

    let translatedName = '';
    switch (requirementCode) {
      case '':
        translatedName = t('noSpecialRequirements', 'No special requirements');
        break;
      case 'fragile':
        translatedName = cleanEmojiFromText(t('fragileGoods', 'Fragile goods - handle with care'));
        break;
      case 'temperature':
        translatedName = cleanEmojiFromText(t('temperatureControlled', 'Temperature controlled'));
        break;
      case 'urgent':
        translatedName = cleanEmojiFromText(t('urgentTimeSensitive', 'Urgent/time-sensitive'));
        break;
      case 'insurance':
        translatedName = cleanEmojiFromText(
          t('highValueInsurance', 'High-value insurance required')
        );
        break;
      case 'other':
        translatedName = cleanEmojiFromText(t('otherSpecify', 'Other (please specify)'));
        break;
    }
    setRequirementsSearch(
      requirement
        ? `${requirement.icon}  ${translatedName}`
        : t('noSpecialRequirements', 'No special requirements')
    );
    setIsRequirementsListVisible(false);
  };

  // Initialize display values when form data changes
  useEffect(() => {
    // Currency selection text
    const currency = CURRENCY_OPTIONS.find((c) => c.code === formData.goodsCurrency);
    if (currency) setCurrencySearch(`${currency.flag} ${currency.code}`);

    // Timing text
    const timing = TIMING_OPTIONS.find((t) => t.code === formData.areGoodsReady);
    if (timing) {
      let translatedName = '';
      switch (timing.code) {
        case 'yes':
          translatedName = cleanEmojiFromText(
            t('readyNow', 'Ready now - goods are available for immediate pickup')
          );
          break;
        case 'no_in_1_week':
          translatedName = cleanEmojiFromText(
            t('readyIn1Week', 'Within 1 week - currently preparing')
          );
          break;
        case 'no_in_2_weeks':
          translatedName = cleanEmojiFromText(
            t('readyIn2Weeks', 'Within 2 weeks - production in progress')
          );
          break;
        case 'no_in_1_month':
          translatedName = cleanEmojiFromText(
            t('readyIn1Month', 'Within 1 month - planning ahead')
          );
          break;
        case 'no_date_set':
          translatedName = cleanEmojiFromText(t('dateNotSet', 'Date not determined yet'));
          break;
      }
      setTimingSearch(`${timing.icon}  ${translatedName}`);
    }

    // Requirements text
    const requirement = REQUIREMENTS_OPTIONS.find((r) => r.code === formData.specialRequirements);
    if (requirement) {
      let translatedName = '';
      switch (requirement.code) {
        case '':
          translatedName = t('noSpecialRequirements', 'No special requirements');
          break;
        case 'fragile':
          translatedName = cleanEmojiFromText(
            t('fragileGoods', 'Fragile goods - handle with care')
          );
          break;
        case 'temperature':
          translatedName = cleanEmojiFromText(t('temperatureControlled', 'Temperature controlled'));
          break;
        case 'urgent':
          translatedName = cleanEmojiFromText(t('urgentTimeSensitive', 'Urgent/time-sensitive'));
          break;
        case 'insurance':
          translatedName = cleanEmojiFromText(
            t('highValueInsurance', 'High-value insurance required')
          );
          break;
        case 'other':
          translatedName = cleanEmojiFromText(t('otherSpecify', 'Other (please specify)'));
          break;
      }
      setRequirementsSearch(`${requirement.icon}  ${translatedName}`);
    }
  }, [
    formData.goodsCurrency,
    formData.areGoodsReady,
    formData.specialRequirements,
    userLang,
    t,
    cleanEmojiFromText,
    CURRENCY_OPTIONS,
    TIMING_OPTIONS,
    REQUIREMENTS_OPTIONS,
    setCurrencySearch,
  ]);

  // Click outside to close lists
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currencyListRef.current && !currencyListRef.current.contains(event.target as Node)) {
        setIsCurrencyListVisible(false);
      }
      if (timingListRef.current && !timingListRef.current.contains(event.target as Node)) {
        setIsTimingListVisible(false);
      }
      if (
        requirementsListRef.current &&
        !requirementsListRef.current.contains(event.target as Node)
      ) {
        setIsRequirementsListVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsCurrencyListVisible, setIsTimingListVisible, setIsRequirementsListVisible]);

  // Auto-position dropdowns
  useEffect(() => {
    const adjustDropdownPosition = (
      dropdown: HTMLElement | null,
      inputElement: HTMLElement | null
    ) => {
      if (!dropdown || !inputElement) return;

      const containerEl = inputElement.closest('.quote-form-container') as HTMLElement | null;
      const containerRect = containerEl
        ? containerEl.getBoundingClientRect()
        : ({ top: 0, left: 0, right: window.innerWidth, bottom: window.innerHeight } as DOMRect);

      const inputRect = inputElement.getBoundingClientRect();

      // Respect the fixed footer height so the dropdown never hides behind it
      const footerEl = document.querySelector('.form-footer') as HTMLElement | null;
      const footerHeight = footerEl ? footerEl.getBoundingClientRect().height : 0;
      const viewportBottom = window.innerHeight - footerHeight;
      const visualBottom = Math.min(containerRect.bottom, viewportBottom);

      const spaceBelow = Math.max(0, visualBottom - inputRect.bottom - 6);
      const spaceAbove = Math.max(0, inputRect.top - containerRect.top - 12);
      const spaceRight = Math.max(0, containerRect.right - inputRect.left);
      const spaceLeft = Math.max(0, inputRect.right - containerRect.left);

      dropdown.classList.remove('show-above', 'adjust-right', 'adjust-left');

      const estimatedHeight = Math.min(300, dropdown.scrollHeight || 300);
      if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) dropdown.classList.add('show-above');
      if (spaceRight < 200) dropdown.classList.add('adjust-right');
      else if (spaceLeft < 200) dropdown.classList.add('adjust-left');

      dropdown.style.setProperty('--dropdown-top', `${inputRect.bottom}px`);
      dropdown.style.setProperty('--available-space-bottom', `${spaceBelow}px`);
      dropdown.style.setProperty('--available-space-top', `${spaceAbove}px`);

      // Expand container safe-area to avoid clipping at bottom
      if (containerEl) {
        // Keep dropdown strictly inside; avoid pushing container
        containerEl.style.setProperty('--dropdown-safe-area', '0px');
      }
    };

    if (isCurrencyListVisible && currencyListRef.current) {
      if (!currencyListRef.current.dataset.debugAdjustLogged) {
        // eslint-disable-next-line no-console
        console.log('[dropdown-debug] adjust run - port-list (currency)');
        currencyListRef.current.dataset.debugAdjustLogged = '1';
      }
      const currencyInput = currencyListRef.current.previousElementSibling as HTMLElement;
      adjustDropdownPosition(currencyListRef.current, currencyInput);

      // Verify CSS vars on element vs parent
      // eslint-disable-next-line no-console
      console.log('[dropdown-debug] vars on element', {
        onElement: {
          '--available-space-bottom': currencyListRef.current.style.getPropertyValue('--available-space-bottom') || null,
          '--dropdown-top': currencyListRef.current.style.getPropertyValue('--dropdown-top') || null,
        },
        onParent: {
          '--available-space-bottom': currencyListRef.current.parentElement?.style.getPropertyValue('--available-space-bottom') || null,
          '--dropdown-top': currencyListRef.current.parentElement?.style.getPropertyValue('--dropdown-top') || null,
        },
      });
    }
    if (isTimingListVisible && timingListRef.current) {
      if (!timingListRef.current.dataset.debugAdjustLogged) {
        // eslint-disable-next-line no-console
        console.log('[dropdown-debug] adjust run - port-list (timing)');
        timingListRef.current.dataset.debugAdjustLogged = '1';
      }
      const timingInput = timingListRef.current.previousElementSibling as HTMLElement;
      adjustDropdownPosition(timingListRef.current, timingInput);

      // Verify CSS vars on element vs parent
      // eslint-disable-next-line no-console
      console.log('[dropdown-debug] vars on element', {
        onElement: {
          '--available-space-bottom': timingListRef.current.style.getPropertyValue('--available-space-bottom') || null,
          '--dropdown-top': timingListRef.current.style.getPropertyValue('--dropdown-top') || null,
        },
        onParent: {
          '--available-space-bottom': timingListRef.current.parentElement?.style.getPropertyValue('--available-space-bottom') || null,
          '--dropdown-top': timingListRef.current.parentElement?.style.getPropertyValue('--dropdown-top') || null,
        },
      });
    }
    if (isRequirementsListVisible && requirementsListRef.current) {
      if (!requirementsListRef.current.dataset.debugAdjustLogged) {
        // eslint-disable-next-line no-console
        console.log('[dropdown-debug] adjust run - port-list (requirements)');
        requirementsListRef.current.dataset.debugAdjustLogged = '1';
      }
      const requirementsInput = requirementsListRef.current.previousElementSibling as HTMLElement;
      adjustDropdownPosition(requirementsListRef.current, requirementsInput);

      // Verify CSS vars on element vs parent
      // eslint-disable-next-line no-console
      console.log('[dropdown-debug] vars on element', {
        onElement: {
          '--available-space-bottom': requirementsListRef.current.style.getPropertyValue('--available-space-bottom') || null,
          '--dropdown-top': requirementsListRef.current.style.getPropertyValue('--dropdown-top') || null,
        },
        onParent: {
          '--available-space-bottom': requirementsListRef.current.parentElement?.style.getPropertyValue('--available-space-bottom') || null,
          '--dropdown-top': requirementsListRef.current.parentElement?.style.getPropertyValue('--dropdown-top') || null,
        },
      });
    }

    const handleResize = () => {
      if (isCurrencyListVisible && currencyListRef.current) {
        const currencyInput = currencyListRef.current.previousElementSibling as HTMLElement;
        adjustDropdownPosition(currencyListRef.current, currencyInput);
      }
      if (isTimingListVisible && timingListRef.current) {
        const timingInput = timingListRef.current.previousElementSibling as HTMLElement;
        adjustDropdownPosition(timingListRef.current, timingInput);
      }
      if (isRequirementsListVisible && requirementsListRef.current) {
        const requirementsInput = requirementsListRef.current.previousElementSibling as HTMLElement;
        adjustDropdownPosition(requirementsListRef.current, requirementsInput);
      }
    };
    window.addEventListener('resize', handleResize, { passive: true } as any);
    window.addEventListener('scroll', handleResize, { passive: true, capture: true } as any);

    // Attach debug while visible
    const detachCurrencyDebug = isCurrencyListVisible && currencyListRef.current
      ? attachDropdownDebug({
          listEl: currencyListRef.current,
          triggerEl: currencyListRef.current.previousElementSibling as HTMLElement,
          containerEl: (currencyListRef.current.closest('.quote-form-container') as HTMLElement | null),
          type: 'port-list',
        })
      : () => {};
    const detachTimingDebug = isTimingListVisible && timingListRef.current
      ? attachDropdownDebug({
          listEl: timingListRef.current,
          triggerEl: timingListRef.current.previousElementSibling as HTMLElement,
          containerEl: (timingListRef.current.closest('.quote-form-container') as HTMLElement | null),
          type: 'port-list',
        })
      : () => {};
    const detachReqDebug = isRequirementsListVisible && requirementsListRef.current
      ? attachDropdownDebug({
          listEl: requirementsListRef.current,
          triggerEl: requirementsListRef.current.previousElementSibling as HTMLElement,
          containerEl: (requirementsListRef.current.closest('.quote-form-container') as HTMLElement | null),
          type: 'port-list',
        })
      : () => {};
    return () => {
      window.removeEventListener('resize', handleResize as any);
      window.removeEventListener('scroll', handleResize as any, true);
      const containerEl = document.querySelector('.quote-form-container') as HTMLElement | null;
      if (containerEl) containerEl.style.setProperty('--dropdown-safe-area', '0px');
      detachCurrencyDebug();
      detachTimingDebug();
      detachReqDebug();
    };
  }, [isCurrencyListVisible, isTimingListVisible, isRequirementsListVisible]);

  return (
    <FormStep
      isVisible={currentStep === 5}
      stepNumber={5}
      title={t('step5Title', 'Tell us about your goods')}
      emoji="📝"
    >
      {/* Segmented control: Value · Timing · Details */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(243, 244, 246, 0.8)',
          borderRadius: '9999px',
          padding: '4px',
          border: '1px solid rgba(229, 231, 235, 0.7)',
          width: 'calc(100% - 16px)',
          paddingLeft: '8px',
          paddingRight: '8px',
          maxWidth: '640px',
          margin: '0 0 0.75rem 0',
        }}
      >
        {[
          { n: 1, label: getText('tabValue', 'Value') },
          { n: 2, label: getText('tabTiming', 'Timing') },
          { n: 3, label: getText('tabDetails', 'Details') },
        ].map(({ n, label }) => {
          const active = step5SubStep === n;
          return (
            <button
              key={n}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setStep5SubStep(n)}
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
              }}
            >
              <span style={{
                width: '16px', height: '16px', borderRadius: '50%',
                background: step5SubStep >= n ? 'linear-gradient(135deg, #10b981, #059669)' : '#e5e7eb',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '0.7rem',
              }}>
                {step5SubStep > n ? '✓' : n}
              </span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Separator below segmented control */}
      <div
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #e5e7eb, transparent)',
          margin: '0.75rem 0 1rem',
        }}
      />

      {/* Sub-step 1: Goods Value and Declaration */}
      {step5SubStep === 1 && (
        <div className="goods-value-phase animate-slide-in" style={{ width: 'calc(100% - 16px)', padding: '0 8px' }}>
          <div className="phase-header">
            <h3 className="phase-header-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="step-indicator">1</span>
              {t('goodsValueDeclaration', 'Goods Value & Declaration')}
            </h3>
            <p className="phase-header-subtitle">
              {t(
                'goodsValueDescription',
                'Provide the commercial value for customs declaration and insurance purposes'
              )}
            </p>
          </div>

          <div className="form-control">
            <label htmlFor="goodsValue" className="label-text">
              {t('commercialValue', 'Commercial value of goods')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="goodsValue"
                id="goodsValue"
                placeholder="1000"
                value={formData.goodsValue}
                onChange={handleInputChange}
                className={`input glassmorphism ${fieldValid.goodsValue === false ? 'input-error' : ''} flex-grow`}
                style={{
                  minWidth: '0',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  padding: '0.75rem 1rem',
                  transition: 'all 0.3s ease',
                }}
              />
              <div
                className="currency-select"
                style={{ minWidth: '120px', margin: 0, position: 'relative' }}
              >
                <div className="search-input-wrapper" style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={currencySearch}
                    readOnly
                    onClick={() => setIsCurrencyListVisible(true)}
                    onFocus={() => setIsCurrencyListVisible(true)}
                    className="input glassmorphism search-input"
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                <div
                  ref={currencyListRef}
                  className={`port-list ${isCurrencyListVisible ? 'show' : ''}`}
                  style={{ zIndex: 1000 }}
                >
                  {CURRENCY_OPTIONS.map((currency) => (
                    <div
                      key={currency.code}
                      className={`port-option ${formData.goodsCurrency === currency.code ? 'selected' : ''}`}
                      onClick={() => handleCurrencySelect(currency.code)}
                    >
                      <span className="port-icon">{currency.flag}</span>
                      <div className="port-info">
                        <span className="port-name">{currency.code}</span>
                        <span className="port-region">{currency.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {fieldValid.goodsValue === true && <CheckCircle className="check-icon" />}
            <div
              className="help-text"
              style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}
            >
              💡{' '}
              {t(
                'goodsValueHelp',
                'This value is used for customs declaration and insurance calculations'
              )}
            </div>
          </div>

          <div className="form-control">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPersonalOrHazardous"
                checked={formData.isPersonalOrHazardous}
                onChange={(e) =>
                  setFormData({ ...formData, isPersonalOrHazardous: e.target.checked })
                }
              />
              <span>
                {t(
                  'personalOrHazardous',
                  'Personal effects or contains hazardous/restricted materials'
                )}
              </span>
            </label>
            <div
              className="help-text"
              style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}
            >
              ⚠️{' '}
              {t(
                'personalHazardousHelp',
                'Check this if shipping personal belongings or goods requiring special handling'
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sub-step 2: Shipment Timing */}
      {step5SubStep === 2 && (
        <div className="shipment-timing-phase animate-slide-in" style={{ width: 'calc(100% - 16px)', padding: '0 8px' }}>
          <div className="phase-header">
            <h3 className="phase-header-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="step-indicator">2</span>
              {t('shipmentReadiness', 'Shipment Readiness')}
            </h3>
            <p className="phase-header-subtitle">
              {t(
                'shipmentTimingDescription',
                'Help us plan your shipment timeline and provide accurate rates'
              )}
            </p>
          </div>

          <div className="form-control">
            <label htmlFor="areGoodsReady" className="label-text">
              {t('goodsReadyQuestion', 'When will your goods be ready for pickup?')}
            </label>
            <div className="timing-select" style={{ position: 'relative' }}>
              <div className="search-input-wrapper" style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={timingSearch || t('selectOption', 'Select an option...')}
                  readOnly
                  onClick={() => setIsTimingListVisible(true)}
                  onFocus={() => setIsTimingListVisible(true)}
                  className={`input glassmorphism search-input ${!formData.areGoodsReady ? 'input-pending' : ''}`}
                  style={{ cursor: 'pointer' }}
                />
              </div>
              <div
                ref={timingListRef}
                className={`port-list ${isTimingListVisible ? 'show' : ''}`}
                style={{ zIndex: 1000 }}
              >
                {TIMING_OPTIONS.map((timing) => (
                  <div
                    key={timing.code}
                    className={`port-option ${formData.areGoodsReady === timing.code ? 'selected' : ''}`}
                    onClick={() => handleTimingSelect(timing.code)}
                  >
                    <span className="port-icon">{timing.icon}</span>
                    <div className="port-info">
                      <span className="port-name">
                        {timing.code === 'yes' &&
                          cleanEmojiFromText(
                            t('readyNow', 'Ready now - goods are available for immediate pickup')
                          )}
                        {timing.code === 'no_in_1_week' &&
                          cleanEmojiFromText(
                            t('readyIn1Week', 'Within 1 week - currently preparing')
                          )}
                        {timing.code === 'no_in_2_weeks' &&
                          cleanEmojiFromText(
                            t('readyIn2Weeks', 'Within 2 weeks - production in progress')
                          )}
                        {timing.code === 'no_in_1_month' &&
                          cleanEmojiFromText(t('readyIn1Month', 'Within 1 month - planning ahead'))}
                        {timing.code === 'no_date_set' &&
                          cleanEmojiFromText(t('dateNotSet', 'Date not determined yet'))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {formData.areGoodsReady && <CheckCircle className="check-icon" />}
            <div
              className="help-text"
              style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}
            >
              ⏰ {t('timingHelp', 'Accurate timing helps us provide the most competitive rates')}
            </div>
          </div>
        </div>
      )}

      {/* Sub-step 3: Additional Information */}
      {step5SubStep === 3 && (
        <div className="additional-info-phase animate-slide-in" style={{ width: 'calc(100% - 16px)', padding: '0 8px' }}>
          <div className="phase-header">
            <h3 className="phase-header-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="step-indicator">3</span>
              {t('additionalDetails', 'Additional Details')}
            </h3>
            <p className="phase-header-subtitle">
              {t(
                'additionalDetailsDescription',
                'Provide any special requirements or additional information'
              )}
            </p>
          </div>

          <div className="form-control">
            <label htmlFor="goodsDescription" className="label-text">
              {t('goodsDescription', 'Brief description of goods')}
            </label>
            <input
              type="text"
              name="goodsDescription"
              id="goodsDescription"
              placeholder={t(
                'goodsDescriptionPlaceholder',
                'e.g., Electronics, Furniture, Clothing, Machinery...'
              )}
              value={formData.goodsDescription || ''}
              onChange={handleInputChange}
              className="input glassmorphism"
            />
            <div
              className="help-text"
              style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}
            >
              💡 {t('goodsDescriptionHelp', 'Helps us ensure proper handling and documentation')}
            </div>
          </div>

          <div className="form-control">
            <label htmlFor="specialRequirements" className="label-text">
              {t('specialRequirements', 'Special handling requirements')}
            </label>
            <div className="requirements-select" style={{ position: 'relative' }}>
              <div className="search-input-wrapper" style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={
                    requirementsSearch || t('noSpecialRequirements', 'No special requirements')
                  }
                  readOnly
                  onClick={() => setIsRequirementsListVisible(true)}
                  onFocus={() => setIsRequirementsListVisible(true)}
                  className="input glassmorphism search-input"
                  style={{ cursor: 'pointer' }}
                />
              </div>
              <div
                ref={requirementsListRef}
                className={`port-list ${isRequirementsListVisible ? 'show' : ''}`}
                style={{ zIndex: 1000 }}
              >
                {REQUIREMENTS_OPTIONS.map((requirement) => (
                  <div
                    key={requirement.code}
                    className={`port-option ${formData.specialRequirements === requirement.code ? 'selected' : ''}`}
                    onClick={() => handleRequirementsSelect(requirement.code)}
                  >
                    <span className="port-icon">{requirement.icon}</span>
                    <div className="port-info">
                      <span className="port-name">
                        {requirement.code === '' &&
                          t('noSpecialRequirements', 'No special requirements')}
                        {requirement.code === 'fragile' &&
                          cleanEmojiFromText(t('fragileGoods', 'Fragile goods - handle with care'))}
                        {requirement.code === 'temperature' &&
                          cleanEmojiFromText(t('temperatureControlled', 'Temperature controlled'))}
                        {requirement.code === 'urgent' &&
                          cleanEmojiFromText(t('urgentTimeSensitive', 'Urgent/time-sensitive'))}
                        {requirement.code === 'insurance' &&
                          cleanEmojiFromText(
                            t('highValueInsurance', 'High-value insurance required')
                          )}
                        {requirement.code === 'other' &&
                          cleanEmojiFromText(t('otherSpecify', 'Other (please specify)'))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="info-banner"
            style={{
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <Info size={20} style={{ color: '#3b82f6', marginTop: '0.1rem', flexShrink: 0 }} />
            <div style={{ fontSize: '0.9rem', color: '#1f2937' }}>
              <strong style={{ color: '#3b82f6' }}>
                {t('rateValidityTitle', 'Rate Validity Notice:')}
              </strong>
              <br />
              {t(
                'rateValidityText',
                'Quoted rates are valid until the expiry date shown on each quote. If your goods are not ready for pickup by this date, rates may be subject to change based on current market conditions.'
              )}
            </div>
          </div>
        </div>
      )}
    </FormStep>
  );
};

export default memo(StepGoodsDetails);
