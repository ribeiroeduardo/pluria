import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';  // Use vitest instead of jest
import { Header } from '../../components/Header';

describe('Header Component', () => {
  const defaultProps = {
    isMobile: false,
    isMenuOpen: false,
    onMenuToggle: vi.fn()  // Use vi.fn() instead of jest.fn()
  };

  test('renders the logo image', () => {
    render(<Header {...defaultProps} />);
    const logoImage = screen.getByAltText('Pluria Logo');
    expect(logoImage).toBeInTheDocument();
  });
});
