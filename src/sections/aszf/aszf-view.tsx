import { List, ListItem, Container, Typography } from "@mui/material";

import { themeConfig } from "src/theme";

export default function AszfView() {
    const h2Style = {
        fontWeight: 600,
        fontSize: '28px',
        fontFamily: themeConfig.fontFamily.bricolage,
        textTransform: 'uppercase',
        lineHeight: '36px',
        my: 3
    }

    const bodyStyle = {
        mb: 3
    }
    return (
        <Container sx={{ py: 5 }}>
            <Typography sx={{ mb: 3, fontWeight: 600, fontSize: '60px', fontFamily: themeConfig.fontFamily.bricolage, textTransform: 'uppercase' }}>Általános szerződési feltételek</Typography>

            <Typography variant="body1" sx={bodyStyle}>
                Tájékoztatunk, hogy Te mint vásárló(fogyasztó) a www.farm2fork.hu címen elérhető honlap használatával kinyilvánítod, hogy ismered és elfogadod, az alábbi, a Ptk. (2013. évi V.törvény) 6: 77 - 6: 81.§ alapján megírt általános szerződési feltételeket.Kérünk, amennyiben vásárlója, illetve aktív használója kívánsz lenni a Webáruházunk által kínált lehetőségeknek, figyelmesen olvasd el az Általános Szerződési Feltételeinket és kizárólag abban az esetben vedd igénybe szolgáltatásainkat, amennyiben minden pontjával egyetértesz, és azokat kötelező érvényűnek tekinted magadra nézve.
            </Typography>
            <Typography variant="body1" sx={bodyStyle}>
                Jelen dokumentum, kizárólag elektronikus formában kerül megkötésre.Az alábbi feltételekkel szabályozott szerződés a Ptk.szerint távollevők között létrejött szerződésnek minősül.
            </Typography>


            <Typography variant="body1" sx={bodyStyle}>
                A szolgáltató a jelen általános szerződési feltételekben a továbbiakban: <b>üzemeltető.</b>
            </Typography>

            <Typography sx={h2Style}>Üzemeltetői adatok:</Typography>
            <List>
                <ListItem>Cégnév: Farm2Fork Korlátolt Felelősségű Társaság</ListItem>
                <ListItem>Székhely: 2009 Pilisszentlászló Tölgyfa u. 21</ListItem>
                <ListItem>Átvételi pont címe: 1097 Budapest Ecseri út 14 - 16. C épület</ListItem>
                <ListItem>Adószám: 26680743 - 2 - 13</ListItem>
                <ListItem>Cégjegyzékszám: Cg. 13 -09 - 198592</ListItem>
                <ListItem>Kibocsájtó cégbíróság:</ListItem>
                <ListItem>Szerződés nyelve: magyar</ListItem>
                <ListItem>Elektronikus elérhetőség: info@farm2fork.hu</ListItem>
                <ListItem>Telefonos elérhetőség: +36205542280</ListItem>
                <ListItem>Számlaszám: 16200223 - 10105711</ListItem>
            </List>
            <Typography sx={h2Style}>
                A tárhelyszolgáltató elérhetőségei:
            </Typography>
            <Typography variant="body1" sx={bodyStyle}>Név: Google Cloud(Google Ireland Limited)</Typography>
            <Typography variant="body1" sx={bodyStyle}>Székhely: Gordon House, Barrow Street, Dublin 4, Írország</Typography>
            <Typography variant="body1" sx={bodyStyle}>
                Általános Szerződési feltételeiket és benne az adatkezelésre és adatvédelemre adott feltételeiket itt találod.
            </Typography>

            <Typography variant="body1" sx={bodyStyle}>
                <b>Megvásárolható termékek köre</b><br />
                Minden olyan, a Weboldalon feltüntetett vagy szereplő, a Farm2Fork kft.által eladásra kínált termék, amely vonatkozásában az Ügyfél a Weboldalon a megrendelését leadhatja.
            </Typography>
            <Typography variant="body1" sx={bodyStyle}>
                Figyelmeztetés: A termékek adatlapján megjelenített képek eltérhetnek a valóságtól, bizonyos esetekben csak illusztrációként szerepelnek.
            </Typography>

            <Typography variant="body1" sx={bodyStyle}>
                <b>Rendelési információk</b><br />
                A megjelenített termékek online kizárólag a Webáruházon keresztül rendelhetőek meg, futár által történő házhoz szállítással vagy személyesen a megrendelő, vagy meghatalmazottja általi átvétellel.A termékekre vonatkozóan megjelenített árak tartalmazzák a törvényben előírt 27 % -os ÁFA - t, azonban nem tartalmazzák a házhozszállítás díját.Amennyiben az üzemeltető hibás árat tüntet fel a termék mellett, a tőle elvárható gondosság ellenére, és a termék ára annak általánosan elfogadott árától eltér, úgy az üzemeltető nem köteles a terméket a hibás áron szolgáltatni, de köteles a megrendelés visszaigazolásában felajánlani a vásárló részére a valós áron történő vásárlás lehetőségét.Amennyiben a vásárló ezzel a lehetőséggel nem kíván élni, úgy megilleti a szerződéstől való egyoldalú elállás joga.Külön csomagolási költség nem kerül felszámításra.
            </Typography>
            <Typography variant="body1" sx={bodyStyle}>

                Ha bővebb információt szeretnél kapni a termékről, akkor kattints a termék képére vagy nevére.Ekkor a termék oldalára jutsz el, ahol a termékről részletesebb tájékoztatást kaphatsz.Amennyiben ennél még részletesebb tájékoztatásra van szükséged, úgy az üzemeltetői adatok között rögzített telefonszámon tudsz érdeklődni.
            </Typography>

            <Typography sx={h2Style}>A rendelés menete:</Typography>
            <Typography variant="body1" sx={bodyStyle}>
                Bejelentkezés után válogass az elérhető zöldségek, gyümölcsök és egyéb termékek között.Az árucikkeket szűrheted típus, termelő, és a bio - vagy konvencionális termelés módja szerint is.A kiválasztott terméknél add meg a rendelni kívánt mennyiséget, majd tedd a kosárba.A kosár megtekintésénél tudod ellenőrizni a kiválogatott termékeket.Itt módosíthatod a mennyiséget és leadhatod az extra igényeidet.A rendelés leadása után e - mailes visszaigazolást küldünk, amiben megadjuk a kiszállítás napját.A szerda 12:00 - ig leadott rendeléseket csütörtökön és pénteken szállítjuk ki, a vasárnap 12:00 - ig leadott rendeléseket pedig kedden és szerdán.
            </Typography>
            <Typography variant="body1" sx={bodyStyle}>
                Regisztráció<br />
                Amennyiben vásárolni szeretnél, úgy az első vásárlás alkalmával meg kell adnod a vásárláshoz szükséges adatokat is, így a neved, számlázási és szállítási adataidat, e - mail címed, valamint a későbbi belépéshez szükséges jelszavadat.A regisztráció véglegesítése előtt szükséges a regisztrációs feltételek elfogadása is.A regisztrációt e - mailben visszaigazolja a rendszer.A vevő köteles az általa megadott jelszót bizalmasan kezelni.Amennyiben az azonosítás során a vevő egyedi azonosítója és jelszava helyes megadását követően a vevő adatai arra jogosulatlan harmadik személy birtokába kerültek, az ebből eredő károkért, illetve hátrányokért az Adatkezelő felelősséget nem vállal.A felhasználók e - mail címük megadásával hozzájárulnak ahhoz, hogy az üzemeltető / szolgáltató technikai jellegű üzenetet küldjön számukra.A regisztrált adatokat az üzemeltető kérelemre törli a rendszerből.A törlési kérelem biztonsági okokból csak akkor lesz érvényes, ha a törlési kérelmet a felhasználó e - mailben megerősíti, így elkerülhető, hogy valaki szándékosan vagy tévedésből mást töröljön a regisztrációs adatbázisból.A regisztrációt az e - mail cím azonosítja, tehát egy e - mail címet csak egyszer lehet regisztrálni.A regisztráció kötelezettségekkel nem jár.
            </Typography>
            <Typography variant="body1" sx={bodyStyle}>

                A megrendelt termék ellenértékének és a házhoz szállítás díjának fizetésének módja.<br />
                A vásárlásod végösszegét pontosítjuk és egy visszaigazoló emailben elküldjük neked.Ezt az összeget SimplePay - el vagy készpénzben tudod kifizetni.
                A SimplePay elektronikus fizetéseket lebonyolító szolgáltatás, amivel kényelmesen és biztonságosan tudsz bankkártyával, vagy előre feltöltött egyenleggel fizetni.
                A bankkártyás fizetéshez nem kötelező a regisztráció, elég megadni bankkártyád számát, a lejárati dátumot és a hátoldalon található CVC kódot, valamint egy működő e - mail címet.Ha azonban regisztrálsz, nem kell begépelned a kártyaadataid egyetlen SimplePay elfogadóhelyen sem, a fizetéshez elég az e - mail címed és jelszavad.<br />Használható kártyák: Mastercard és Visa bankkártya.
            </Typography>
            <Typography variant="body1" sx={bodyStyle}>

                A fizetendő végösszeg a megrendelés összesítője és visszaigazoló levél alapján minden költséget tartalmaz.
            </Typography>
            <Typography variant="body1" sx={bodyStyle}>
                <b>Házhozszállítás díjszabása:</b><br />
            </Typography>
            <List >
                <ListItem>5000 - 15000 Ft között címenként 1290 Ft</ListItem>
                <ListItem>15000 Ft fölött ingyenes</ListItem>
            </List>
        </Container>
    );
}