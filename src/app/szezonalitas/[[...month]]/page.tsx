import type { Metadata } from 'next';

import SzezonalitasView from 'src/sections/szezonalitas/view/szezonalitas-view';

import { MonthsEnum } from 'src/types/months';

type Props = {
    params: Promise<{ month: string }>;
};

export const metadata: Metadata = { title: `Szezonalitás` };

export default async function Page({ params }: Readonly<Props>) {
    const { month } = await params;
    
    if(!month) {
        const currentMonth = Object.values(MonthsEnum)[new Date().getMonth()] as MonthsEnum;
        return <SzezonalitasView month={currentMonth} />;
    }
    
    const foundMonth = Object.values(MonthsEnum).find(
        (m) => m.toLowerCase() === month[0].toLowerCase()
    );
    const selectedMonth = foundMonth ? (foundMonth as MonthsEnum) : MonthsEnum.January;

    return <SzezonalitasView month={selectedMonth} />;
}

export async function generateStaticParams() {
  return Object.values(MonthsEnum).map((month) => ({
    month: [month.toLowerCase()],
  }))
}
