import { describe, expect, it } from 'vitest';
import { Card } from '.';
import { render } from '@testing-library/react';
import { ShielddUIProvider } from '../ShielddUIProvider';

describe('<Card />', () => {
  it('renders the title', () => {
    const { container } = render(<Card title='Title here'>Content here</Card>, {
      wrapper: ShielddUIProvider,
    });

    expect(container).toHaveTextContent('Title here');
  });

  it('renders the content', () => {
    const { container } = render(<Card title='Title here'>Content here</Card>, {
      wrapper: ShielddUIProvider,
    });

    expect(container).toHaveTextContent('Content here');
  });
});
