import { useState } from 'react';
import { ArrowBigUpDash, Eye, EyeOff } from 'lucide-react';
import AiErrorGuide from '@/components/AiErrorGuide';
import useCapsLock from '@/hooks/useCapsLock';

const WRAP =
  'flex h-12 items-center gap-2.5 rounded-xl border bg-white px-3.5 text-sm focus-within:ring-focus';

export default function AuthField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
  inputMode,
  maxLength,
  error,
  help,
  success,
  endAdornment,
  action,
  readOnly,
  hasGuide,
  icon,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const { isCapsOn, capsProps } = useCapsLock();
  const isPassword = type === 'password';
  const Icon = icon;

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="mb-1.5 block text-[13px] leading-6 font-semibold text-ink"
      >
        {label}
        <span aria-hidden="true" className="ml-0.5 text-danger">
          *
        </span>
      </label>
      <div className="flex gap-2">
        <div
          className={`${WRAP} min-w-0 flex-1 ${
            error
              ? 'border-danger focus-within:ring-error'
              : 'border-input-line focus-within:border-brand-500'
          } ${readOnly ? 'bg-surface-2' : ''}`}
        >
          {Icon && <Icon className="size-5 shrink-0 text-subtle" />}
          <input
            id={id}
            type={isPassword && isVisible ? 'text' : type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            autoComplete={autoComplete}
            inputMode={inputMode}
            maxLength={maxLength}
            readOnly={readOnly}
            aria-required="true"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className="h-full min-w-0 flex-1 bg-transparent placeholder:text-placeholder focus:outline-none"
            {...(isPassword ? capsProps : {})}
          />
          {endAdornment}
          {isPassword && (
            <button
              type="button"
              onClick={() => setIsVisible((prev) => !prev)}
              aria-label={isVisible ? '비밀번호 숨기기' : '비밀번호 표시'}
              className="grid place-items-center text-subtle hover:text-ink"
            >
              {isVisible ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </button>
          )}
        </div>
        {action}
      </div>
      {isPassword && isCapsOn && (
        <p className="mt-2 flex items-center gap-1 text-sm text-warn">
          <ArrowBigUpDash className="size-4" />
          Caps Lock이 켜져 있습니다.
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 text-sm leading-5 text-danger"
        >
          {error}
        </p>
      )}
      {!error && success && (
        <p className="mt-2 text-sm leading-5 text-tone-green-fg">{success}</p>
      )}
      {!error && !success && help && (
        <p className="mt-2 text-sm leading-5 text-muted">{help}</p>
      )}
      {error && hasGuide && <AiErrorGuide message={error} />}
    </div>
  );
}
