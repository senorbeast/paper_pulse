
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthorsPage from '@/app/authors/page';
import { useAuthors, useCreateAuthor } from '@/hooks/useAuthors';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

// Mock the hooks
vi.mock('@/hooks/useAuthors', () => ({
  useAuthors: vi.fn(),
  useCreateAuthor: vi.fn(),
}));

describe('AuthorsPage', () => {
  const mockAuthors = [
    { id: 1, name: 'Author One', email: 'author1@example.com', bio: 'Bio 1' },
    { id: 2, name: 'Author Two', email: 'author2@example.com', bio: 'Bio 2' },
  ];

  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useCreateAuthor as Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it('renders loading state', () => {
    (useAuthors as Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<AuthorsPage />);
    expect(screen.getByText('Loading authors...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    (useAuthors as Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    });

    render(<AuthorsPage />);
    expect(screen.getByText('Error loading authors')).toBeInTheDocument();
  });

  it('renders authors list', () => {
    (useAuthors as Mock).mockReturnValue({
      data: mockAuthors,
      isLoading: false,
      error: null,
    });

    render(<AuthorsPage />);

    expect(screen.getByText('Author One')).toBeInTheDocument();
    expect(screen.getByText('author1@example.com')).toBeInTheDocument();
    expect(screen.getByText('Author Two')).toBeInTheDocument();
  });

  it('submits the form with valid data', async () => {
    (useAuthors as Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<AuthorsPage />);

    const nameInput = screen.getByLabelText(/Name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const bioInput = screen.getByLabelText(/Bio/i);

    fireEvent.change(nameInput, { target: { value: 'New Author' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(bioInput, { target: { value: 'New Bio' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Author/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Author',
          email: 'new@example.com',
          bio: 'New Bio',
        }),
        expect.anything()
      );
    });
  });

  it('prevents submission with invalid email', async () => {
    (useAuthors as Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<AuthorsPage />);

    const nameInput = screen.getByLabelText(/Name/i);
    const emailInput = screen.getByLabelText(/Email/i);

    fireEvent.change(nameInput, { target: { value: 'Test Author' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Author/i }));

    await waitFor(() => {
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  it('prevents submission with empty required fields', async () => {
    (useAuthors as Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<AuthorsPage />);

    fireEvent.click(screen.getByRole('button', { name: /Create Author/i }));

    await waitFor(() => {
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });
});
