import { AuthSplitLayout } from 'src/layouts/auth-split';

import { GuestGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <GuestGuard>
      <AuthSplitLayout
        
        slotProps={{
          section: { title: '', subtitle: '', imgUrl: 'https://farm2fork.hu/wp-content/uploads/2025/01/Frame-1.png' },
        }}
      >
        {children}
      </AuthSplitLayout>
    </GuestGuard>
  );
}
