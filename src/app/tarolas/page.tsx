import type { Metadata } from 'next';
import { CONFIG } from 'src/global-config';
import TarolasView from 'src/sections/tarolas/view/tarolas-view';


export const metadata: Metadata = { title: `Tárolás - ${CONFIG.appName}` };
export default function Page() {
    return (
        <TarolasView/>
    );
}