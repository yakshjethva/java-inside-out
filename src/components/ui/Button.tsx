import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cn } from '@/lib/cn';
import {
  buttonClasses,
  type ButtonSize as Size,
  type ButtonVariant as Variant,
} from './buttonClasses';

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...rest} />;
}

export function ButtonLink({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  ...rest
}: LinkProps & { variant?: Variant; size?: Size; children: ReactNode }) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}

export function IconButton({
  label,
  className,
  children,
  pressed,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; pressed?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md border text-fg-muted transition-colors hover:text-fg',
        pressed
          ? 'border-exec-500/60 bg-exec-900/60 text-exec-200'
          : 'border-ink-600 bg-ink-850/90 hover:border-ink-500 hover:bg-ink-750',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
