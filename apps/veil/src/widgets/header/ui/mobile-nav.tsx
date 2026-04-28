import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@mizufinance/ui/Button';
import { Dialog } from '@mizufinance/ui/Dialog';
import { Display } from '@mizufinance/ui/Display';
import { MenuItem } from '@mizufinance/ui/MenuItem';
import { HeaderLogo } from './logo';
import { HEADER_LINKS } from './links';

export const MobileNav = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const onNavigate = (link: string) => {
    router.push(link);
    setIsOpen(false);
  };

  return (
    <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <Button iconOnly icon={Menu} onClick={() => setIsOpen(true)}>
        Menu
      </Button>
      <Dialog.EmptyContent>
        <div className='pointer-events-auto h-full overflow-hidden bg-black'>
          <Display>
            <nav className='flex items-center justify-between py-5'>
              <HeaderLogo />

              <Button iconOnly icon={X} onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </nav>

            <div className='flex flex-col gap-4'>
              {HEADER_LINKS.map(link => (
                <MenuItem
                  key={link.value}
                  label={link.label}
                  icon={link.icon}
                  onClick={() => onNavigate(link.value)}
                />
              ))}
            </div>
          </Display>
        </div>
      </Dialog.EmptyContent>
    </Dialog>
  );
};
