import { RefreshCw } from 'lucide-react';
import AiErrorGuide from '@/components/AiErrorGuide';

const ART =
  'flex h-12 flex-1 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface-2';

export default function CaptchaBlock({
  image,
  isLoading,
  value,
  onChange,
  onRefresh,
  error,
  hasGuide,
}) {
  return (
    <div className="relative">
      <label
        htmlFor="login-captcha"
        className="mb-2 block leading-6 font-semibold text-ink"
      >
        보안코드
        <span aria-hidden="true" className="ml-0.5 text-danger">
          *
        </span>
      </label>
      <div className="mb-2 flex gap-2">
        <div className={ART}>
          {image && (
            <img
              src={image}
              alt="보안코드 이미지"
              className={`h-full w-full object-contain ${isLoading ? 'opacity-40' : ''}`}
            />
          )}
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="보안코드 새로고침"
          className="grid size-12 place-items-center rounded-xl border border-input-line text-ink-2 hover:enabled:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className="size-6" />
        </button>
      </div>
      <div
        className={`flex h-12 items-center rounded-xl border bg-white px-3 focus-within:ring-focus ${
          error
            ? 'border-danger focus-within:ring-error'
            : 'border-input-line focus-within:border-brand-500'
        }`}
      >
        <input
          id="login-captcha"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="영문 대문자와 숫자 6글자"
          maxLength={6}
          autoComplete="off"
          aria-required="true"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'login-captcha-error' : undefined}
          className="h-full w-full bg-transparent placeholder:text-placeholder focus:outline-none"
        />
      </div>
      {error && (
        <p
          id="login-captcha-error"
          role="alert"
          className="mt-2 text-sm leading-5 text-danger"
        >
          {error}
        </p>
      )}
      {error && hasGuide && <AiErrorGuide message={error} />}
    </div>
  );
}
