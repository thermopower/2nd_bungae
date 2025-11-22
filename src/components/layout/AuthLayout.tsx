import { ReactNode } from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  readonly children: ReactNode;
  readonly title: string;
  readonly subtitle?: string;
}

export const AuthLayout = ({
  children,
  title,
  subtitle,
}: AuthLayoutProps): JSX.Element => (
  <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <Link href="/" className="flex justify-center">
        <span className="text-3xl font-bold text-blue-600">ChatApp</span>
      </Link>
      <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-center text-sm text-gray-600">{subtitle}</p>
      )}
    </div>

    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        {children}
      </div>
    </div>
  </div>
);
