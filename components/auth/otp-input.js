"use client";

import React, { useRef, useEffect } from 'react';

/**
 * Accessible 6-digit OTP Input Component
 *
 * @param {Object} props
 * @param {string} props.value - 6-character OTP string
 * @param {function(string): void} props.onChange - Callback when OTP changes
 * @param {boolean} [props.disabled] - Disabled state
 * @param {boolean} [props.hasError] - Error highlight state
 * @param {string} [props.ariaDescribedBy] - ID of error/description text
 */
export function OtpInput({
  value = '',
  onChange,
  disabled = false,
  hasError = false,
  ariaDescribedBy,
}) {
  const inputRefs = useRef([]);

  // Ensure value is padded/trimmed to 6 digits array
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  // Auto-focus first input on mount if empty
  useEffect(() => {
    if (!disabled && inputRefs.current[0] && !value) {
      inputRefs.current[0].focus();
    }
  }, [disabled, value]);

  const handleChange = (index, newValue) => {
    if (disabled) return;

    // Handle paste of multiple characters
    const cleaned = newValue.replace(/\D/g, '');
    if (cleaned.length > 1) {
      const pastedDigits = cleaned.slice(0, 6);
      onChange(pastedDigits);
      const targetIndex = Math.min(pastedDigits.length, 5);
      if (inputRefs.current[targetIndex]) {
        inputRefs.current[targetIndex].focus();
      }
      return;
    }

    // Single digit entry
    const newDigit = cleaned.slice(-1);
    const newDigitsArray = [...digits];
    newDigitsArray[index] = newDigit;
    const combined = newDigitsArray.join('');
    onChange(combined);

    // Auto-advance to next input if digit entered
    if (newDigit && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0 && inputRefs.current[index - 1]) {
        // Backspace on empty input moves to previous input and clears it
        e.preventDefault();
        const newDigitsArray = [...digits];
        newDigitsArray[index - 1] = '';
        onChange(newDigitsArray.join(''));
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0 && inputRefs.current[index - 1]) {
      e.preventDefault();
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5 && inputRefs.current[index + 1]) {
      e.preventDefault();
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    if (disabled) return;
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      onChange(pastedData);
      const targetIndex = Math.min(pastedData.length, 5);
      if (inputRefs.current[targetIndex]) {
        inputRefs.current[targetIndex].focus();
      }
    }
  };

  return (
    <div
      className="flex items-center justify-between gap-2 sm:gap-3"
      role="group"
      aria-label="6-digit verification code"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          aria-label={`Digit ${index + 1} of 6`}
          aria-invalid={hasError}
          aria-describedby={ariaDescribedBy}
          className={`h-12 w-11 sm:h-14 sm:w-12 text-center text-xl font-bold rounded-md bg-surface border transition-colors focus:outline-none focus:ring-2 ${
            hasError
              ? 'border-error focus:ring-error text-error'
              : 'border-border focus:border-primary focus:ring-primary text-foreground'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      ))}
    </div>
  );
}
