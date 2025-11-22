import { ReactNode } from 'react';

interface CardProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly onClick?: () => void;
  readonly hoverable?: boolean;
}

export const Card = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}: CardProps): JSX.Element => {
  const baseStyles = 'bg-white rounded-lg border border-gray-200 shadow-sm';
  const hoverStyles = hoverable ? 'hover:shadow-md hover:border-gray-300 transition-shadow cursor-pointer' : '';

  const combinedClassName = [baseStyles, hoverStyles, className].filter(Boolean).join(' ');

  return (
    <div className={combinedClassName} onClick={onClick}>
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  className = '',
}: {
  readonly children: ReactNode;
  readonly className?: string;
}): JSX.Element => (
  <div className={`p-4 border-b border-gray-200 ${className}`}>{children}</div>
);

export const CardBody = ({
  children,
  className = '',
}: {
  readonly children: ReactNode;
  readonly className?: string;
}): JSX.Element => (
  <div className={`p-4 ${className}`}>{children}</div>
);

export const CardFooter = ({
  children,
  className = '',
}: {
  readonly children: ReactNode;
  readonly className?: string;
}): JSX.Element => (
  <div className={`p-4 border-t border-gray-200 ${className}`}>{children}</div>
);
