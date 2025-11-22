import Image from 'next/image';

interface AvatarProps {
  readonly src?: string | null;
  readonly name?: string;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly className?: string;
}

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

const sizePx = {
  sm: 32,
  md: 40,
  lg: 48,
};

const getInitials = (name: string): string => {
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getColorFromName = (name: string): string => {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
  ];

  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export const Avatar = ({
  src,
  name = '',
  size = 'md',
  className = '',
}: AvatarProps): JSX.Element => {
  const baseStyles = 'rounded-full flex items-center justify-center font-medium';

  if (src) {
    return (
      <div className={`${baseStyles} ${sizeStyles[size]} relative overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={name}
          width={sizePx[size]}
          height={sizePx[size]}
          className="object-cover rounded-full"
        />
      </div>
    );
  }

  const bgColor = getColorFromName(name);
  const initials = getInitials(name);

  return (
    <div
      className={`${baseStyles} ${sizeStyles[size]} ${bgColor} text-white ${className}`}
      aria-label={name}
    >
      {initials}
    </div>
  );
};
