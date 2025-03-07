import { render, screen } from '@testing-library/react';
import ThemeSwitch from '@/components/themeSwitch';
import '@testing-library/jest-dom'
import TestUtils from 'react-dom/test-utils';
import React from 'react';

// Mock the lucide-react components
jest.mock("lucide-react", () => ({
    Sun: () => <div data-testid="sun-icon">Sun</div>,
    Moon: () => <div data-testid="moon-icon">Moon</div>,
  }));

test("Loads Theme Switch Correcly", () => {
    render(<ThemeSwitch />);

    expect(screen.getByTestId("sun-icon")).toBeInTheDocument();
    expect(screen.getByTestId("moon-icon")).toBeInTheDocument();
})
