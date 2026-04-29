'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextInput } from '@mizufinance/ui/TextInput';
import { Icon } from '@mizufinance/ui/Icon';
import { Ban, LoaderCircle, Search } from 'lucide-react';
import { isPositionId } from '@mizufinance/bech32m/plpid';
import { Button, ButtonProps } from '@mizufinance/ui/Button';
import { Density } from '@mizufinance/ui/Density';

const isTransactionId = (input: string) => {
  // 64-character hex string
  return /^[a-fA-F0-9]{64}$/.test(input);
};

const isBlockHeight = (input: string) => {
  // test string if it contains only positive numbers
  return /^\d+$/.test(input);
};

const isValidId = (input: string) => {
  return isPositionId(input) || isTransactionId(input) || isBlockHeight(input);
};

const getActionType = (searchQuery: string, isValidId: boolean): ButtonProps['actionType'] => {
  if (!searchQuery) {
    return 'default';
  }
  if (isValidId) {
    return 'accent';
  }
  return 'destructive';
};

export const InspectSearch = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isPositionId(searchQuery)) {
      router.push(`/inspect/lp/${searchQuery}`);
    } else if (isTransactionId(searchQuery)) {
      router.push(`/inspect/tx/${searchQuery}`);
    } else if (isBlockHeight(searchQuery)) {
      router.push(`/inspect/block/${searchQuery}`);
    }
  };

  return (
    <Density compact>
      <div className='mt-4 flex justify-center'>
        <div className='mx-4 flex w-full max-w-[600px] flex-col gap-2'>
          <form onSubmit={handleSearch} className='flex items-center gap-2'>
            <div className='w-full'>
              <TextInput
                type='text'
                value={searchQuery}
                actionType='accent'
                placeholder='Search by transaction hash, block height and LP position ids'
                onChange={setSearchQuery}
              />
            </div>
            <div className='max-w-[200px]'>
              <Button type='submit' actionType={getActionType(searchQuery, isValidId(searchQuery))}>
                {!!searchQuery && !isValidId(searchQuery) ? (
                  <Icon size='md' IconComponent={Ban} color='base.white' />
                ) : (
                  <Icon size='md' IconComponent={Search} color='base.white' />
                )}
              </Button>
            </div>
          </form>
          {loading && <LoaderCircle className='animate-spin self-center text-white' />}
        </div>
      </div>
    </Density>
  );
};
