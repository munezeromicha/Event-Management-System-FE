import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  description?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, description, ...props }, ref) => {
    return (
      <div className="relative flex items-start">
        <div className="flex h-5 items-center">
          <input
            type="checkbox"
            className={cn(
              'h-4 w-4 rounded border-gray-300 text-blue-600',
              'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label
                htmlFor={props.id}
                className={cn(
                  'font-medium text-gray-700',
                  props.disabled && 'opacity-50'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className={cn(
                'text-gray-500',
                props.disabled && 'opacity-50'
              )}>
                {description}
              </p>
            )}
          </div>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-600 absolute -bottom-5 left-0">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox }; 