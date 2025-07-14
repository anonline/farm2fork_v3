
import { TarolasProvider } from "src/contexts/tarolas-context";

import TarolasGrid from "../tarolas-grid";
import TarolasHero from "../tarolas-hero";

export default function TarolasView() {
    return (
        <>
            <TarolasHero />
            <TarolasProvider>
                <TarolasGrid />
            </TarolasProvider>
        </>
    );
}