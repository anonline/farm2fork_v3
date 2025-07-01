import { SimpleLayout } from 'src/layouts/simple';

// ----------------------------------------------------------------------

type Props = {
    children: React.ReactNode;
};

export default function Layout({ children }: Readonly<Props>) {
    return (
        <SimpleLayout
            slotProps={{
                content: { compact: true },
            }}
        >
            {children}
        </SimpleLayout>
    );
}
