'use client';

import { Home, Search, PlusCircle, Heart, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Explore', href: '/explore' },
    { icon: PlusCircle, label: 'Create', href: '/create' },
    { icon: Heart, label: 'Activity', href: '/activity' },
    { icon: User, label: 'Profile', href: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 z-50">
      <div className="flex items-center justify-around px-2 py-3 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all group"
            >
              <Icon
                size={24}
                className={`${
                  isActive
                    ? 'text-primary'
                    : 'text-white/60 group-hover:text-white'
                } transition-colors`}
              />
              <span
                className={`text-xs font-medium ${
                  isActive
                    ? 'text-primary'
                    : 'text-white/60 group-hover:text-white'
                } transition-colors`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
