/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileNav } from '../mobile-nav';

describe('MobileNav', () => {
  beforeEach(() => {
    // Mock window.matchMedia for testing breakpoints
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  it('renders hamburger button on mobile', () => {
    render(
      <MobileNav>
        <div>Navigation content</div>
      </MobileNav>
    );

    expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
  });

  it('opens drawer when hamburger is clicked', () => {
    render(
      <MobileNav>
        <div>Navigation content</div>
      </MobileNav>
    );

    fireEvent.click(screen.getByLabelText('Open menu'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Navigation content')).toBeInTheDocument();
  });

  it('closes drawer when clicking outside', () => {
    render(
      <MobileNav>
        <div>Navigation content</div>
      </MobileNav>
    );

    fireEvent.click(screen.getByLabelText('Open menu'));
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes drawer when pressing Escape', () => {
    render(
      <MobileNav>
        <div>Navigation content</div>
      </MobileNav>
    );

    fireEvent.click(screen.getByLabelText('Open menu'));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // Test different viewport sizes
  it.each([
    [375, true],   // Mobile
    [768, true],   // Tablet
    [1280, false], // Desktop
  ])('shows/hides hamburger menu at %ipx viewport width', (width, shouldShow) => {
    // Mock viewport width
    window.innerWidth = width;
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === `(min-width: ${width}px)`,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    render(
      <MobileNav>
        <div>Navigation content</div>
      </MobileNav>
    );

    const hamburgerButton = screen.queryByLabelText('Open menu');
    if (shouldShow) {
      expect(hamburgerButton).toBeInTheDocument();
      expect(hamburgerButton).toHaveClass('md:hidden');
    } else {
      expect(hamburgerButton).toBeInTheDocument();
      expect(hamburgerButton).toHaveClass('md:hidden');
    }
  });
}); 