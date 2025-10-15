import * as React from 'react';
import { memo, useEffect, useRef, useState } from 'react';
import FormStep from '../FormStep';
import { useQuoteForm } from '@/features/lead/context/useQuoteForm';
import { CheckCircle } from 'lucide-react';
import { COUNTRIES } from '@/data/countries';

const StepContact: React.FC = () => {
  const {
    currentStep,
    formData,
    setFormData,
    fieldValid,
    userLang,
    getText,
    handleInputChange,
    phonePrefixSearch,
    setPhonePrefixSearch,
    getTranslatedCountryName,
    step6SubStep,
    setStep6SubStep,
  } = useQuoteForm();

  const t = (key: string, fallback: string): string => getText(key, fallback);

  // Local Step 6 UI states (customerType is now stored in context formData)
  const [experienceSearch, setExperienceSearch] = useState('');
  const [isExperienceListVisible, setIsExperienceListVisible] = useState(false);
  const [isPhonePrefixListVisible, setIsPhonePrefixListVisible] = useState(false);
  const experienceListRef = useRef<HTMLDivElement>(null);
  const phonePrefixListRef = useRef<HTMLDivElement>(null);
  const phonePrefixSearchInputRef = useRef<HTMLInputElement>(null);

  // Experience options (icons + language descriptions)
  const EXPERIENCE_OPTIONS = [
    { code: 'first-time', icon: '🌟' },
    { code: 'up-to-10x', icon: '📦' },
    { code: 'more-than-10x', icon: '🚀' },
    { code: 'regular', icon: '🏆' },
  ] as const;

  const cleanEmojiFromText = (text?: string) =>
    (text ?? '').replace(/^\p{Extended_Pictographic}+\s*/u, '').trim();

  // Display value for phone prefix: keep flag and plus sign visible
  const selectedPhoneCountry = COUNTRIES.find(
    (c) => c.phonePrefix === formData.phoneCountryCode
  );
  const phonePrefixDisplay = selectedPhoneCountry
    ? `${selectedPhoneCountry.flag} ${selectedPhoneCountry.phonePrefix}`
    : phonePrefixSearch;

  // No auto-advance: navigation is controlled by Next/Previous buttons
  // Clamp sub-step when switching from company -> individual (from 5 to 4 tabs)
  useEffect(() => {
    if (formData.customerType !== 'company' && step6SubStep > 4) {
      setStep6SubStep(4);
    }
  }, [formData.customerType, step6SubStep, setStep6SubStep]);

  // (deduped) display value already computed above

  const handleExperienceSelect = (experienceCode: string) => {
    setFormData({ ...formData, shipperType: experienceCode });
    let translatedName = '';
    switch (experienceCode) {
      case 'first-time':
        translatedName = cleanEmojiFromText(t('firstTimeShipper', 'First international shipment'));
        break;
      case 'up-to-10x':
        translatedName = cleanEmojiFromText(t('upTo10Times', 'Limited experience'));
        break;
      case 'more-than-10x':
        translatedName = cleanEmojiFromText(t('moreThan10Times', 'Experienced shipper'));
        break;
      case 'regular':
        translatedName = cleanEmojiFromText(t('regularShipper', 'Regular shipper'));
        break;
    }
    const icon = EXPERIENCE_OPTIONS.find((e) => e.code === experienceCode)?.icon ?? '';
    setExperienceSearch(`${icon}  ${translatedName}`);
    setIsExperienceListVisible(false);
    // Auto-advance to next sub-step
    if (formData.customerType === 'company') {
      setStep6SubStep(4); // Company sub-step
    } else {
      setStep6SubStep(4); // Contact sub-step for individuals
    }
  };

  const handlePhonePrefixSelect = (prefix: string) => {
    setFormData({ ...formData, phoneCountryCode: prefix });
    // Clear the search field after selection; display is computed from formData
    setPhonePrefixSearch('');
    setIsPhonePrefixListVisible(false);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (experienceListRef.current && !experienceListRef.current.contains(e.target as Node)) {
        setIsExperienceListVisible(false);
      }
      if (
        phonePrefixListRef.current &&
        !phonePrefixListRef.current.contains(e.target as Node) &&
        phonePrefixSearchInputRef.current &&
        !phonePrefixSearchInputRef.current.contains(e.target as Node)
      ) {
        setIsPhonePrefixListVisible(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Auto-position dropdowns
  useEffect(() => {
    const adjust = (dropdown: HTMLElement | null, input: HTMLElement | null) => {
      if (!dropdown || !input) return;
      const rect = input.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const dh = 300;
      const below = vh - rect.bottom - 20;
      const above = rect.top - 20;
      const right = vw - rect.left;
      const left = rect.right;
      dropdown.classList.remove('show-above', 'adjust-right', 'adjust-left');
      if (below < dh && above > below) dropdown.classList.add('show-above');
      if (right < 300) dropdown.classList.add('adjust-right');
      else if (left < 300) dropdown.classList.add('adjust-left');
      dropdown.style.setProperty('--dropdown-top', `${rect.bottom}px`);
    };
    if (isExperienceListVisible && experienceListRef.current) {
      const input = experienceListRef.current.previousElementSibling as HTMLElement;
      adjust(experienceListRef.current, input);
    }
    if (
      isPhonePrefixListVisible &&
      phonePrefixListRef.current &&
      phonePrefixSearchInputRef.current
    ) {
      adjust(phonePrefixListRef.current, phonePrefixSearchInputRef.current);
    }
  }, [isExperienceListVisible, isPhonePrefixListVisible]);

  return (
    <FormStep
      isVisible={currentStep === 6}
      stepNumber={6}
      title={t('step6Title', 'Contact details')}
      emoji="📱"
    >
      <div className="step-6-container" style={{ width: 'calc(100% - 16px)', padding: '0 8px' }}>
        {/* Sub-step segmented control */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '0.25rem 0 1rem',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${formData.customerType === 'company' ? 5 : 4}, minmax(0, 1fr))`,
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
            {[
              { n: 1, label: getText('tabContactType', 'Type'), done: !!formData.customerType, onClick: () => setStep6SubStep(1) },
              { n: 2, label: getText('tabIdentity', 'Identity'), done: !!(formData.firstName && formData.lastName), onClick: () => setStep6SubStep(2), disabled: false }, // Always enabled for minimal validation
              { n: 3, label: getText('tabExperience', 'Experience'), done: !!formData.shipperType, onClick: () => setStep6SubStep(3), disabled: false }, // Always enabled for minimal validation
              // Company sub-step is conditional and only shown for company customers
              ...(formData.customerType === 'company'
                ? [{ n: 4, label: getText('tabCompany', 'Company'), done: !!formData.companyName, onClick: () => setStep6SubStep(4), disabled: false }] // Always enabled for minimal validation
                : []),
              { n: (formData.customerType === 'company' ? 5 : 4), label: getText('tabContact', 'Contact'), done: !!(formData.email && formData.phone), onClick: () => setStep6SubStep(formData.customerType === 'company' ? 5 : 4), disabled: false }, // Always enabled for minimal validation
            ].map(({ n, label, onClick, done, disabled }: any) => {
              const active = step6SubStep === n;
              return (
                <button
                  key={n}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => !disabled && onClick()}
                  disabled={disabled}
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: disabled ? 0.5 : 1,
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '9999px',
                      background: done ? 'linear-gradient(135deg, #10b981, #059669)' : '#e5e7eb',
                      color: 'white',
                      fontSize: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                  >
                    {done ? '✓' : n}
                  </span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Separator below segmented control */}
        <div
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #e5e7eb, transparent)',
            margin: '0.75rem 0 1rem',
          }}
        />
        {/* Phase 1: Contact Type */}
        {step6SubStep === 1 && (
        <div className="customer-type-phase animate-slide-in">
          <div className="phase-header">
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span
                style={{
                  backgroundColor: formData.customerType ? '#10b981' : '#6b7280',
                  color: 'white',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  transition: 'background-color 0.3s ease',
                }}
              >
                1
              </span>
              {t('customerTypeQuestion', 'Are you shipping as an individual or for a company?')}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0 0 1.5rem 0' }}>
              {t(
                'customerTypeDescription',
                'This helps us provide the most relevant information fields'
              )}
            </p>
          </div>
          <div
            className="customer-type-selection"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div
              className={`customer-type-option ${formData.customerType === 'individual' ? 'selected' : ''}`}
              onClick={() => {
                setFormData({ ...formData, customerType: 'individual' });
                setStep6SubStep(2);
              }}
              style={{
                padding: '1.5rem',
                border:
                  formData.customerType === 'individual'
                    ? '2px solid #10b981'
                    : '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                backgroundColor:
                  formData.customerType === 'individual'
                    ? 'rgba(16, 185, 129, 0.05)'
                    : 'rgba(255, 255, 255, 0.9)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '0.75rem',
                transform: formData.customerType === 'individual' ? 'scale(1.02)' : 'scale(1)',
                boxShadow:
                  formData.customerType === 'individual'
                    ? '0 4px 12px rgba(16, 185, 129, 0.15)'
                    : '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div style={{ fontSize: '2rem' }}>👤</div>
              <h4 style={{ margin: 0, color: '#1f2937', fontWeight: '600' }}>
                {t('individualCustomer', 'Private individual')}
              </h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>
                {t('individualDescription', 'For personal shipments and small volumes')}
              </p>
            </div>
            <div
              className={`customer-type-option ${formData.customerType === 'company' ? 'selected' : ''}`}
              onClick={() => {
                setFormData({ ...formData, customerType: 'company' });
                setStep6SubStep(2);
              }}
              style={{
                padding: '1.5rem',
                border:
                  formData.customerType === 'company' ? '2px solid #10b981' : '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                backgroundColor:
                  formData.customerType === 'company'
                    ? 'rgba(16, 185, 129, 0.05)'
                    : 'rgba(255, 255, 255, 0.9)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '0.75rem',
                transform: formData.customerType === 'company' ? 'scale(1.02)' : 'scale(1)',
                boxShadow:
                  formData.customerType === 'company'
                    ? '0 4px 12px rgba(16, 185, 129, 0.15)'
                    : '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div style={{ fontSize: '2rem' }}>🏢</div>
              <h4 style={{ margin: 0, color: '#1f2937', fontWeight: '600' }}>
                {t('companyCustomer', 'Company')}
              </h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>
                {t('companyDescription', 'For business shipments and regular operations')}
              </p>
            </div>
          </div>
        </div>
        )}

        {/* Phase 1: Personal Information */}
        {(formData.customerType || step6SubStep === 2) && step6SubStep === 2 && (
          <div className="personal-info-phase animate-slide-in">
            <div className="phase-header">
              <h3
                style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span
                  style={{
                    backgroundColor:
                      formData.firstName && formData.lastName ? '#10b981' : '#6b7280',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  2
                </span>
                {t('personalInformation', 'Personal Information')}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0 0 1.5rem 0' }}>
                {t('personalInfoDescription', 'Tell us who you are')}
              </p>
            </div>
            <div
              className="personal-details"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem',
              }}
            >
              <div className="form-control">
                <label htmlFor="firstName" className="label-text">
                  {t('firstName', 'First Name')}
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    placeholder={t('firstNamePlaceholder', 'Enter your first name')}
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`input glassmorphism ${fieldValid.firstName === false ? 'input-error' : ''}`}
                    style={{
                      transition: 'all 0.3s ease',
                      transform: formData.firstName ? 'scale(1.02)' : 'scale(1)',
                    }}
                  />
                  {fieldValid.firstName === true && <CheckCircle className="check-icon" />}
                </div>
              </div>
              <div className="form-control">
                <label htmlFor="lastName" className="label-text">
                  {t('lastName', 'Last Name')}
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    placeholder={t('lastNamePlaceholder', 'Enter your last name')}
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`input glassmorphism ${fieldValid.lastName === false ? 'input-error' : ''}`}
                    style={{
                      transition: 'all 0.3s ease',
                      transform: formData.lastName ? 'scale(1.02)' : 'scale(1)',
                    }}
                  />
                  {fieldValid.lastName === true && <CheckCircle className="check-icon" />}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phase 2: Shipping Experience */}
        {(formData.firstName && formData.lastName) && step6SubStep === 3 && (
          <div className="shipping-experience-phase animate-slide-in">
            <div className="phase-header">
              <h3
                style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span
                  style={{
                    backgroundColor: formData.shipperType ? '#10b981' : '#6b7280',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  3
                </span>
                {t('shippingExperience', 'Shipping Experience')}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0 0 1.5rem 0' }}>
                {t('selectExperience', 'Select your level of experience')}
              </p>
            </div>
            <div
              className="experience-details"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem',
              }}
            >
              <div className="form-control">
                <label htmlFor="shipperType" className="label-text">
                  {t('shippingExperience', 'Shipping Experience')}
                </label>
                <div className="timing-select input-wrapper" style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={
                      experienceSearch || t('selectExperience', 'Select your level of experience')
                    }
                    onClick={() => setIsExperienceListVisible(true)}
                    onFocus={() => setIsExperienceListVisible(true)}
                    readOnly
                    className={`input glassmorphism timing-input ${fieldValid.shipperType === false ? 'input-error' : ''}`}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: formData.shipperType ? 'scale(1.02)' : 'scale(1)',
                    }}
                    placeholder={t('selectExperience', 'Select your level of experience')}
                  />
                  <div
                    ref={experienceListRef}
                    className={`port-list ${isExperienceListVisible ? 'show' : ''}`}
                    style={{ zIndex: 1000 }}
                  >
                    {EXPERIENCE_OPTIONS.map((experience) => (
                      <div
                        key={experience.code}
                        className="port-option"
                        onClick={() => handleExperienceSelect(experience.code)}
                      >
                        <span className="port-icon">{experience.icon}</span>
                        <div className="port-info">
                          <span className="port-name">
                            {experience.code === 'first-time' &&
                              t('firstTimeShipper', 'First international shipment')}
                            {experience.code === 'up-to-10x' &&
                              t('upTo10Times', 'Limited experience')}
                            {experience.code === 'more-than-10x' &&
                              t('moreThan10Times', 'Experienced shipper')}
                            {experience.code === 'regular' &&
                              t('regularShipper', 'Regular shipper')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {fieldValid.shipperType === true && <CheckCircle className="check-icon" />}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phase 4: Business Information (company only) moved to its own conditional sub-step */}
        {formData.customerType === 'company' && step6SubStep === 4 && (
          <div className="business-info-phase animate-slide-in">
            <div className="phase-header">
              <h3
                style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span
                  style={{
                    backgroundColor: formData.companyName ? '#10b981' : '#6b7280',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  {formData.customerType === 'company' ? 4 : ''}
                </span>
                {t('businessInformation', 'Business Information')}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0 0 1.5rem 0' }}>
                {t('businessInfoDescription', 'Tell us about your company')}
              </p>
            </div>
            <div
              className="business-details"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem',
              }}
            >
              <div className="form-control">
                <label htmlFor="companyName" className="label-text">
                  {t('companyName', 'Company Name')}
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="companyName"
                    id="companyName"
                    placeholder={t('companyNamePlaceholder', 'Your company name (optional)')}
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className={`input glassmorphism ${fieldValid.companyName === false ? 'input-error' : ''}`}
                    style={{
                      transition: 'all 0.3s ease',
                      transform: formData.companyName ? 'scale(1.02)' : 'scale(1)',
                    }}
                  />
                  {fieldValid.companyName === true && <CheckCircle className="check-icon" />}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phase 5: Contact Information (or 4 if individual) */}
        {(formData.firstName && formData.lastName && formData.shipperType) && step6SubStep === (formData.customerType === 'company' ? 5 : 4) && (
          <div className="contact-info-phase animate-slide-in">
            <div className="phase-header">
              <h3
                style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span
                  style={{
                    backgroundColor: formData.email && formData.phone ? '#10b981' : '#6b7280',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  {formData.customerType === 'company' ? 5 : 4}
                </span>
                {t('contactInformation', 'Contact Information')}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0 0 1.5rem 0' }}>
                {t('contactInfoDescription', 'How can we reach you?')}
              </p>
            </div>
            <div
              className="contact-details"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem',
              }}
            >
              <div className="form-control">
                <label htmlFor="email" className="label-text">
                  {t('emailAddress', 'Email Address')}
                </label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder={t('emailPlaceholder', 'your.email@company.com')}
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`input glassmorphism ${fieldValid.email === false ? 'input-error' : ''}`}
                    style={{
                      transition: 'all 0.3s ease',
                      transform: formData.email ? 'scale(1.02)' : 'scale(1)',
                    }}
                  />
                  {fieldValid.email === true && <CheckCircle className="check-icon" />}
                </div>
                <div
                  className="help-text"
                  style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}
                >
                  📧 {t('emailHelp', 'We will send your quote and updates to this address')}
                </div>
              </div>
              <div className="form-control">
                <label htmlFor="phone" className="label-text">
                  {t('phoneNumber', 'Phone Number')}
                </label>
                <div
                  className="phone-input-wrapper"
                  style={{ display: 'grid', gridTemplateColumns: '105px 1fr', gap: '0.5rem' }}
                >
                  <div className="phone-prefix-select" style={{ position: 'relative' }}>
                    <div className="search-input-wrapper" style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={phonePrefixDisplay}
                        onClick={() => {
                          setIsPhonePrefixListVisible(true);
                          setPhonePrefixSearch('');
                        }}
                        onFocus={() => {
                          setIsPhonePrefixListVisible(true);
                          setPhonePrefixSearch('');
                        }}
                        readOnly
                        placeholder="+1"
                        ref={phonePrefixSearchInputRef}
                        className="input glassmorphism search-input"
                        style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div
                      ref={phonePrefixListRef}
                      className={`port-list ${isPhonePrefixListVisible ? 'show' : ''}`}
                      style={{ zIndex: 1000 }}
                    >
                      <div style={{ padding: '0.5rem' }}>
                        <div className="search-input-wrapper" style={{ position: 'relative' }}>
                          <input
                            type="text"
                            value={phonePrefixSearch}
                            onChange={(e) => setPhonePrefixSearch(e.target.value)}
                            placeholder={`${t('search', 'Search')} (+33, France)`}
                            className="input glassmorphism search-input"
                            style={{ fontSize: '0.9rem' }}
                          />
                        </div>
                      </div>
                      {COUNTRIES.filter((c) => {
                        if (!c.phonePrefix) return false;
                        const q = (phonePrefixSearch || '').toLowerCase();
                        const qNorm = q.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                        const nameEn = (c.name || '').toLowerCase();
                        const nameEnNorm = nameEn.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                        const nameLocal = (getTranslatedCountryName(c.code, userLang) || '').toLowerCase();
                        const nameLocalNorm = nameLocal.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                        const digits = (phonePrefixSearch || '').replace(/[^\d+]/g, '');

                        const hasText = q.length > 0;
                        const hasDigits = digits.length > 0;

                        const matchesName =
                          hasText &&
                          (nameEn.includes(q) ||
                            nameLocal.includes(q) ||
                            nameEnNorm.includes(qNorm) ||
                            nameLocalNorm.includes(qNorm));

                        const matchesDigits = hasDigits && c.phonePrefix.includes(digits);

                        // If search empty, show all
                        if (!hasText && !hasDigits) return true;
                        return matchesName || matchesDigits;
                      })
                        .slice(0, 10)
                        .map((country) => (
                          <div
                            key={country.code}
                            className="port-option"
                            onClick={() => handlePhonePrefixSelect(country.phonePrefix)}
                          >
                            <span className="port-icon">{country.flag}</span>
                            <div className="port-info">
                              <span className="port-name">{country.phonePrefix}</span>
                              <span className="port-region">
                                {getTranslatedCountryName(country.code, userLang)}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    placeholder={t('phonePlaceholder', 'Your phone number')}
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`input glassmorphism ${fieldValid.phone === false ? 'input-error' : ''}`}
                    style={{
                      transition: 'all 0.3s ease',
                      transform: formData.phone ? 'scale(1.02)' : 'scale(1)',
                    }}
                  />
                </div>
                {fieldValid.phone === true && <CheckCircle className="check-icon" />}
                <div
                  className="help-text"
                  style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}
                >
                  📱 {t('phoneHelp', 'For urgent updates and clarifications')}
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Phase 6: Additional Notes (optional) */}
        {formData.email && formData.phone && (
          <div className="additional-notes-phase animate-slide-in">
            <div className="phase-header">
              <h3
                style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  ✓
                </span>
                {t('additionalNotes', 'Additional Notes')}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0 0 1.5rem 0' }}>
                {t('additionalNotesDescription', 'Is there anything else we should know?')}
              </p>
            </div>
            <div className="form-control">
              <label htmlFor="remarks" className="label-text">
                {t('remarks', 'Special Remarks')}
              </label>
              <textarea
                name="remarks"
                id="remarks"
                placeholder={t(
                  'remarksPlaceholder',
                  'Any special instructions, requirements, or questions...'
                )}
                value={formData.remarks || ''}
                onChange={handleInputChange}
                className="input glassmorphism"
                rows={4}
                style={{ minHeight: '120px', resize: 'vertical', transition: 'all 0.3s ease' }}
              />
              <div
                className="help-text"
                style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}
              >
                💬 {t('remarksHelp', 'Extra context helps us assist you better')}
              </div>
            </div>
            <div
              className="contact-summary-banner"
              style={{
                marginTop: '2rem',
                padding: '1.5rem',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '2px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '40px',
                  height: '40px',
                }}
              >
                <CheckCircle size={24} style={{ color: 'white' }} />
              </div>
              <div>
                <h4
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#047857',
                    margin: '0 0 0.5rem 0',
                  }}
                >
                  {t('readyToSubmit', 'You are ready to get your quote!')}
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#065f46', margin: '0', lineHeight: '1.5' }}>
                  {t(
                    'submitDescription',
                    'Click the Get My Quote button below to submit your request. We will respond within 24 hours.'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        <div
          className="security-badge glassmorphism"
          style={{
            marginTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '1rem',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>🔒</span>
          <span style={{ fontWeight: '500' }}>
            {t('securityBadge', 'Secure and GDPR compliant')}
          </span>
        </div>
      </div>
    </FormStep>
  );
};

export default memo(StepContact);
