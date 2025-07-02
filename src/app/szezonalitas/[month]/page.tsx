import type { Metadata } from 'next';
import { Months } from 'src/types/months';
import SzezonalitasView from 'src/sections/szezonalitas/view/szezonalitas-view';

type Props = {
    params: { month: string };
};

export const metadata: Metadata = { title: `Szezonalitás` };

export default function Page({ params }: Props) {
    const { month } = params;

    const allowedMonths = Object.values(Months);
    if (!allowedMonths.includes(month as Months)) {
        return <div>Érvénytelen hónap!</div>;
    }

    return (
        <SzezonalitasView month={month as Months} />
    );
}