import React from 'react';

// Define common props shared by both button and anchor
interface CommonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

// Define props for when the component is a button, making 'as' optional
type ButtonElProps = CommonProps & React.ComponentPropsWithoutRef<'button'> & {
  as?: 'button';
};

// Define props for when the component is an anchor, making 'as' required
type AnchorElProps = CommonProps & React.ComponentPropsWithoutRef<'a'> & {
  as: 'a';
};

// Use a discriminated union for the final props type for better type-checking
type ButtonProps = ButtonElProps | AnchorElProps;

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0a18] transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5';

  const variantStyles = {
    primary: 'bg-cyan-500 hover:bg-cyan-400 text-slate-900 focus:ring-cyan-500 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40',
    secondary: 'bg-slate-700/50 hover:bg-slate-700 text-slate-100 focus:ring-slate-500 border border-slate-600'
  };

  const sizeStyles = {
    md: 'px-5 py-2.5 text-sm tracking-wide',
    lg: 'px-8 py-3 text-base tracking-wider'
  };
  
  const widthStyles = fullWidth ? 'w-full' : '';

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`;
  
  if (props.as === 'a') {
    const { as, ...anchorProps } = props;
    return <a className={combinedClassName} {...anchorProps}>{children}</a>;
  }

  const { as, ...buttonProps } = props;
  return (
    <button className={combinedClassName} {...buttonProps}>{children}</button>
  );
};