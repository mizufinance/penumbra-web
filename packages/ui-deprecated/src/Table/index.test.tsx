import { describe, expect, it } from 'vitest';
import { Table } from '.';
import { render } from '@testing-library/react';
import { ShielddUIProvider } from '../ShielddUIProvider';

describe('<Table />', () => {
  it('renders a title if one is passed', () => {
    const { container } = render(
      <Table title='Table title'>
        <Table.Tbody />
      </Table>,
      { wrapper: ShielddUIProvider },
    );

    expect(container).toHaveTextContent('Table title');
  });
});
