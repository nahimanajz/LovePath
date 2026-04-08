import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: 'bg-primary rounded-[50px]',
    text: 'text-white font-body-medium',
  },
  secondary: {
    container: 'bg-secondary rounded-[50px]',
    text: 'text-white font-body-medium',
  },
  outline: {
    container: 'border border-primary rounded-[50px] bg-transparent',
    text: 'text-primary font-body-medium',
  },
  ghost: {
    container: 'bg-transparent',
    text: 'text-muted font-body-medium',
  },
};

const sizeStyles: Record<Size, { container: string; text: string }> = {
  sm: { container: 'py-2 px-4', text: 'text-sm' },
  md: { container: 'py-3 px-6', text: 'text-base' },
  lg: { container: 'py-4 px-8', text: 'text-lg' },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
}: ButtonProps) {
  const { container: variantContainer, text: variantText } = variantStyles[variant];
  const { container: sizeContainer, text: sizeText } = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`items-center justify-center ${variantContainer} ${sizeContainer} ${disabled || loading ? 'opacity-50' : ''} ${className}`}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? '#C0556A' : '#FFFFFF'}
          size="small"
        />
      ) : (
        <Text className={`${variantText} ${sizeText}`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
