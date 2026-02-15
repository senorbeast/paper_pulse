
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { describe, it, expect, vi } from 'vitest';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /Click me/i })).toBeInTheDocument();
  });

  it('handles onClick events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button', { name: /Click me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes', () => {
    // Testing implementation details (classes) is generally brittle, but for a UI library component ensuring variants apply differences is somewhat relevant.
    // However, sticking to behavior/attributes is better.
    // Let's check if it doesn't crash with variants.
    render(<Button variant="destructive">Destructive</Button>);
    const button = screen.getByRole('button', { name: /Destructive/i });
    expect(button).toHaveClass('bg-destructive');
  });

  it('renders as child (Slot)', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    // Should render as an anchor tag due to asChild=true with Slot
    const link = screen.getByRole('link', { name: /Link Button/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });
});
