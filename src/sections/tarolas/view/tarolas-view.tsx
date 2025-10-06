import { TarolasProvider } from 'src/contexts/tarolas-context';
import { CategoryProvider } from 'src/contexts/category-context';

import TarolasGrid from '../tarolas-grid';
import TarolasHero from '../tarolas-hero';

export default function TarolasView() {
    return (
        <>
            <TarolasHero />
            <CategoryProvider>
                <TarolasProvider>
                    <TarolasGrid />
                </TarolasProvider>
            </CategoryProvider>
        </>
    );
}
