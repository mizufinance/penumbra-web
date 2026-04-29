'use client';

import Link from 'next/link';
import { PagePath } from '@/shared/const/pages';
import { Button } from '@mizufinance/ui/Button';

export const GoBackLink = () => {
  return (
    <div className='w-full desktop:mt-0 desktop:w-48'>
      <Link href={PagePath.Trade}>
        <Button>Go back</Button>
      </Link>
    </div>
  );
};
