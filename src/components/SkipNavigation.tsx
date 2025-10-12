/**
 * SkipNavigation Component
 * WCAG 2.1 - Bypass Blocks (2.4.1)
 * Provides skip links for keyboard users to bypass repetitive content
 */

interface SkipLink {
  href: string;
  label: string;
}

interface SkipNavigationProps {
  links?: SkipLink[];
}

const defaultLinks: SkipLink[] = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#primary-navigation', label: 'Skip to navigation' },
];

export function SkipNavigation({ links = defaultLinks }: SkipNavigationProps) {
  return (
    <div className="skip-navigation">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
