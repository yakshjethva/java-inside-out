import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md';

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-exec-500 text-ink-950 hover:bg-exec-400 border border-exec-400 shadow-[0_0_0_1px_rgb(79_155_245/0.25),0_8px_24px_-12px_rgb(79_155_245/0.6)]',
  secondary: 'border border-ink-500 bg-ink-800/80 text-fg hover:border-ink-400 hover:bg-ink-750',
  ghost: 'text-fg-muted hover:text-fg hover:bg-ink-750/80',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
};

export function buttonClasses(
  variant: ButtonVariant = 'secondary',
  size: ButtonSize = 'md',
  extra?: string,
) {
  return cn(base, variants[variant], sizes[size], extra);
}
