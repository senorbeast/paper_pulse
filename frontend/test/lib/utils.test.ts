
import { describe, it, expect } from 'vitest';
import { getApiErrorMessage } from '@/lib/utils'; // Adjust path if needed

describe('getApiErrorMessage', () => {
  it('should return default error message for undefined error', () => {
    expect(getApiErrorMessage(undefined)).toBe('An unknown error occurred');
  });

  it('should return error.message if present', () => {
    const error = { message: 'Network Error' };
    expect(getApiErrorMessage(error)).toBe('Network Error');
  });

  it('should prioritize data.message from response', () => {
    const error = {
      message: 'Network Error',
      response: {
        data: {
          message: 'Server Internal Error',
        },
      },
    };
    expect(getApiErrorMessage(error)).toBe('Server Internal Error');
  });

  it('should handle Pydantic validation errors (array)', () => {
    const error = {
      response: {
        data: [
          {
            loc: ['body', 'email'],
            msg: 'value is not a valid email address',
            type: 'value_error.email',
          },
        ],
      },
    };
    expect(getApiErrorMessage(error)).toBe('email: value is not a valid email address');
  });
  
  it('should handle Pydantic validation errors with nested loc', () => {
      const error = {
        response: {
          data: [
            {
              loc: ['body', 'user', 'age'],
              msg: 'ensure this value is greater than 0',
            },
          ],
        },
      };
      expect(getApiErrorMessage(error)).toBe('user.age: ensure this value is greater than 0');
    });

    it('should handle Pydantic validation errors with no loc', () => {
        const error = {
          response: {
            data: [
              {
                msg: 'Invalid request',
              },
            ],
          },
        };
        expect(getApiErrorMessage(error)).toBe('Invalid request');
      });
});
