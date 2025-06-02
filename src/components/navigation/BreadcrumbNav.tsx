
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface BreadcrumbNavProps {
  className?: string;
  maxItems?: number;
}

const routeMap: Record<string, string> = {
  '/': 'Dashboard',
  '/jobs': 'Jobs',
  '/profile': 'Profile',
  '/applications': 'Applications',
  '/calendar': 'Calendar',
  '/resume-tools': 'Resume Tools',
  '/interview-practice': 'Interview Practice',
  '/networking': 'Networking',
  '/analytics': 'Analytics',
  '/communications': 'Communications',
  '/referrals': 'Referrals',
  '/salary-negotiations': 'Salary Negotiations',
  '/job-alerts': 'Job Alerts',
  '/leetcode-patterns': 'LeetCode Patterns',
  '/complete-profile': 'Complete Profile',
  '/auth': 'Authentication'
};

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  className,
  maxItems = 4
}) => {
  const location = useLocation();
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: 'Home',
        path: '/',
        icon: <Home className="h-4 w-4" />
      }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = routeMap[currentPath] || segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      breadcrumbs.push({
        label,
        path: currentPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const visibleBreadcrumbs = breadcrumbs.length > maxItems 
    ? [breadcrumbs[0], { label: '...', path: '', icon: null }, ...breadcrumbs.slice(-2)]
    : breadcrumbs;

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}>
      {visibleBreadcrumbs.map((item, index) => (
        <React.Fragment key={item.path || index}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          )}
          
          {item.label === '...' ? (
            <span className="px-1">...</span>
          ) : index === visibleBreadcrumbs.length - 1 ? (
            <span className="flex items-center space-x-1 text-foreground font-medium">
              {item.icon}
              <span>{item.label}</span>
            </span>
          ) : (
            <Link
              to={item.path}
              className="flex items-center space-x-1 hover:text-foreground transition-colors"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default BreadcrumbNav;
