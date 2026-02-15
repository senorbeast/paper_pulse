# Frontend Testing Guide

## Overview

This project uses [Vitest](https://vitest.dev) with [Testing Library](https://testing-library.com/) for frontend testing. The test suite focuses on critical integration points, component behavior, and form validation.

## Test Structure

```
test/
├── components/        # Component unit tests
│   ├── Header.test.tsx
│   └── ui/           # UI library component tests
│       └── Button.test.tsx
├── lib/              # Utility function tests
│   └── utils.test.ts
├── pages/            # Page integration tests
│   ├── AuthorsPage.test.tsx
│   └── PapersPage.test.tsx
├── utils/            # Test utilities
│   └── form-tester.ts
└── setup.ts          # Global test setup
```

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (for development)
npx vitest

# Run a specific test file
npx vitest run test/pages/AuthorsPage.test.tsx
```

## Testing Philosophy

### 1. **Structure Over Coverage**
We prioritize testing the architectural structure and critical paths rather than achieving 100% code coverage. Tests focus on:
- Component contracts and interfaces
- Form validation logic
- Error handling
- Integration between components and hooks

### 2. **User-Centric Testing**
Tests interact with components as users would:
- Finding elements by accessible names (labels, roles)
- Simulating real user events (typing, clicking)
- Verifying visible feedback

### 3. **Mocking Strategy**
- **React Query hooks** are mocked to isolate component logic
- **Next.js navigation** is mocked where needed
- API calls are not made during tests

## Test Utilities

### FormTester Class

Located in `test/utils/form-tester.ts`, this class provides reusable abstractions for form testing:

```typescript
import { FormTester } from '../utils/form-tester';

const form = new FormTester();

// Fill inputs by label
await form.fillInput(/Name/i, 'John Doe');
await form.fillTextarea(/Bio/i, 'Researcher');

// Submit forms
await form.submit(/Create Author/i);

// Check for validation errors
await form.expectValidationErrors(['Required field']);
```

## Common Patterns

### Testing Form Submission

```typescript
it('submits form with valid data', async () => {
  const mockMutate = vi.fn();
  (useCreateAuthor as Mock).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  });

  render(<AuthorsPage />);

  fireEvent.change(screen.getByLabelText(/Name/i), { 
    target: { value: 'John Doe' } 
  });
  fireEvent.click(screen.getByRole('button', { name: /Create/i }));

  await waitFor(() => {
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'John Doe' }),
      expect.anything()
    );
  });
});
```

### Testing Form Validation

```typescript
it('prevents submission with invalid data', async () => {
  const mockMutate = vi.fn();
  (useCreateAuthor as Mock).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  });

  render(<AuthorsPage />);

  // Submit with invalid email
  fireEvent.change(screen.getByLabelText(/Email/i), { 
    target: { value: 'invalid-email' } 
  });
  fireEvent.click(screen.getByRole('button', { name: /Create/i }));

  await waitFor(() => {
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
```

### Testing Component States

```typescript
it('renders loading state', () => {
  (useAuthors as Mock).mockReturnValue({
    data: undefined,
    isLoading: true,
    error: null,
  });

  render(<AuthorsPage />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});
```

## Known Limitations

### Radix UI Select Components

Testing Radix UI `Select` components (used via shadcn/ui) is challenging in happy-dom due to portal rendering. For these components:
- We test that inputs can be filled
- We verify the form structure is correct
- Full E2E tests with Playwright/Cypress would cover the Select interaction

Example workaround:
```typescript
it('allows filling form fields', async () => {
  // Test what we can reliably test
  await form.fillTitle('Paper Title');
  await form.fillDOI('10.1000/123');
  
  expect(screen.getByLabelText(/Title/i)).toHaveValue('Paper Title');
  
  // Note: Select interaction tested in E2E suite
});
```

## Best Practices

1. **Clear Test Names**: Use descriptive test names that explain the scenario
   ```typescript
   it('prevents submission with invalid email', ...)
   ```

2. **Arrange-Act-Assert**: Structure tests clearly
   ```typescript
   // Arrange
   render(<Component />);
   
   // Act
   fireEvent.click(button);
   
   // Assert
   expect(result).toBe(expected);
   ```

3. **Async Handling**: Always use `waitFor` for async operations
   ```typescript
   await waitFor(() => {
     expect(mockFn).toHaveBeenCalled();
   });
   ```

4. **Avoid Implementation Details**: Query by role/label, not by class names or internal state

5. **Mock at Module Boundaries**: Mock hooks, not internal component logic

## Adding New Tests

1. Create test file next to the component or in appropriate `test/` subdirectory
2. Mock external dependencies (hooks, APIs)
3. Test the component contract and user interactions
4. Focus on critical paths and edge cases
5. Use FormTester for consistent form interactions

## Debugging Tests

```bash
# Run specific test
npx vitest run test/pages/AuthorsPage.test.tsx

# Run with UI (requires browser)
npx vitest --ui

# See console logs
npx vitest run --reporter=verbose
```

## Resources

- [Vitest Documentation](https://vitest.dev)
- [Testing Library - React](https://testing-library.com/react)
- [Testing Library - Queries](https://testing-library.com/docs/queries/about)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
