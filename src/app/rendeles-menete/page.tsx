import { Metadata } from 'next';
import { CONFIG } from 'src/global-config';
import RendelesMeneteView from 'src/sections/rendeles-menete/view/rendeles-menete-view';

export const metadata: Metadata = { title: `Rendelés menete - ${CONFIG.appName}` };

export default function Page() {
    return (
        <RendelesMeneteView />
    );
}