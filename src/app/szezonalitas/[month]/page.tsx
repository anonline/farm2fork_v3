import type { Metadata } from 'next';

import SzezonalitasView from 'src/sections/szezonalitas/view/szezonalitas-view';

import { MonthsEnum } from 'src/types/months';

type Props = {
    params: Promise<{ month: string }>;
};

export const metadata: Metadata = { title: `Szezonalitás` };

export default async function Page({ params }: Readonly<Props>) {
    const { month } = await params;
    
    const foundMonth = Object.values(MonthsEnum).find(
        m => m.toLowerCase() === month.toLowerCase()
    );

    const selectedMonth = foundMonth ? (foundMonth as MonthsEnum) : MonthsEnum.January;


    return (
        <SzezonalitasView month={selectedMonth} />
    );
}