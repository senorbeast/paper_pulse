
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/Header';
import { describe, it, expect, vi } from 'vitest';

// Mock usePathname
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Header Component', () => {
  it('renders correctly', () => {
    render(<Header />);
    
    // Check for logo text
    expect(screen.getByText('PaperPulse')).toBeInTheDocument();
    
    // Check for navigation links
    const homeLink = screen.getByText('Home');
    const papersLink = screen.getByText('Papers');
    const authorsLink = screen.getByText('Authors');
    
    expect(homeLink).toBeInTheDocument();
    expect(papersLink).toBeInTheDocument();
    expect(authorsLink).toBeInTheDocument();
    
    // Check href attributes
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
    expect(papersLink.closest('a')).toHaveAttribute('href', '/papers');
    expect(authorsLink.closest('a')).toHaveAttribute('href', '/authors');
  });
});
