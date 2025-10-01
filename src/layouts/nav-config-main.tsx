import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import type { NavMainProps } from './main/nav/types';

// ----------------------------------------------------------------------

export const navData: NavMainProps['data'] = [
    {
        title: 'Termékek',
        path: '/termekek',
        children: [
            {
                subheader: '1',
                items: [
                    {
                        title: 'Összes termék',
                        path: paths.categories.root,
                        subtitle: 'Zöldségek, gyümölcsök, gombák...',
                        icon: `${CONFIG.assetsDir}/assets/illustrations/menu/f2f_ikonok-01.png`,
                    },
                    {
                        title: 'Gyümölcsök',
                        path: paths.categories.gyumolcsok,
                        subtitle: 'Alma, körte, barack, áfonya...',
                        icon: `${CONFIG.assetsDir}/assets/illustrations/menu/f2f_ikonok-06.png`,
                    },
                    {
                        title: 'Feldolgozott termékek',
                        path: paths.categories.feldolgozottTermekek,
                        subtitle: 'Liszt, rizs, méz, lekvár...',
                        icon: `${CONFIG.assetsDir}/assets/illustrations/menu/f2f_ikonok-07.png`,
                    },
                ],
            },
            {
                subheader: '2',
                items: [
                    {
                        title: 'Szezon box',
                        path: paths.categories.szezonBox,
                        subtitle: 'Heti zöldség és gyümölcs box',
                        icon: `${CONFIG.assetsDir}/assets/illustrations/menu/f2f_ikonok-08.png`,
                    },
                    {
                        title: 'Gombák',
                        path: paths.categories.gombak,
                        subtitle: 'Csiperke, laska, shiitake...',
                        icon: `${CONFIG.assetsDir}/assets/illustrations/menu/f2f_ikonok-04.png`,
                    },
                    {
                        title: 'Pékáru',
                        path: paths.categories.pekaru,
                        subtitle: 'Kenyér, baguette, kifli, gofri...',
                        icon: `${CONFIG.assetsDir}/assets/illustrations/menu/f2f_ikonok-09.png`,
                    },
                ],
            },
            {
                subheader: '3',
                items: [
                    {
                        title: 'Zöldségek',
                        path: paths.categories.zoldsegek,
                        subtitle: 'Bazsalikom, rozmaring...',
                        icon: `${CONFIG.assetsDir}/assets/illustrations/menu/f2f_ikonok-02.png`,
                    },
                    {
                        title: 'Fűszernövények',
                        path: paths.categories.fuszernovenyek,
                        subtitle: 'Bazsalikom, rozmaring...',
                        icon: `${CONFIG.assetsDir}/assets/illustrations/menu/f2f_ikonok-03.png`,
                    },
                    {
                        title: 'Egyéb termékek',
                        path: paths.categories.egyeb,
                        subtitle: 'Tojás, olajos magok...',
                        icon: `${CONFIG.assetsDir}/assets/illustrations/menu/f2f_ikonok-05.png`,
                    },
                ],
            },
        ],
    },
    { title: 'Termelők', path: '/termelok' },
    { title: 'Rólunk', path: '/rolunk' },
    {
        title: 'Tudnivalók',
        path: '#tudnivalok',
        children: [
            {
                subheader: '',
                items: [
                    {
                        title: 'Szezonalitás',
                        path: paths.szezonalitas,
                        subtitle: 'A természet ritmusában',
                        icon: `${CONFIG.assetsDir}/assets/illustrations/menu/f2f_ikonok-01.png`,
                    },
                    {
                        title: 'Tárolás',
                        path: paths.tarolas,
                        subtitle: 'Zöldségek és gyümölcsök helyes tárolása',
                        icon: `${CONFIG.assetsDir}/assets/illustrations/menu/f2f_ikonok-08.png`,
                    },
                    {
                        title: 'Rendelés menete',
                        path: paths.rendelesMenete,
                        subtitle: 'Így jutsz hozzá',
                        icon: `${CONFIG.assetsDir}/assets/illustrations/menu/f2f_ikonok-10.svg`,
                    },
                    {
                        title: 'GYIK',
                        path: paths.faqs,
                        subtitle: 'Kérdések és válaszok',
                        icon: `${CONFIG.assetsDir}/assets/illustrations/menu/f2f_ikonok-02.png`,
                    },
                ],
            },
        ],
    },
    /*{
    title: 'Components',
    path: paths.components,
    icon: <Iconify width={22} icon="solar:atom-bold-duotone" />,
  },*/
    /*{
    title: 'Pages',
    path: '/pages',
    icon: <Iconify width={22} icon="solar:file-bold-duotone" />,
    children: [
      {
        subheader: 'Other',
        items: [
          { title: 'About us', path: paths.about },
          { title: 'Contact us', path: paths.contact },
          { title: 'FAQs', path: paths.faqs },
          { title: 'Pricing', path: paths.pricing },
          { title: 'Payment', path: paths.payment },
          { title: 'Maintenance', path: paths.maintenance },
          { title: 'Coming soon', path: paths.comingSoon },
        ],
      },
      {
        subheader: 'Concepts',
        items: [
          { title: 'Shop', path: paths.product.root },
          { title: 'Product', path: paths.product.demo.details },
          { title: 'Checkout', path: paths.product.checkout },
          { title: 'Posts', path: paths.post.root },
          { title: 'Post', path: paths.post.demo.details },
        ],
      },
      {
        subheader: 'Auth Demo',
        items: [
          { title: 'Sign in', path: paths.authDemo.split.signIn },
          { title: 'Sign up', path: paths.authDemo.split.signUp },
          { title: 'Reset password', path: paths.authDemo.split.resetPassword },
          { title: 'Update password', path: paths.authDemo.split.updatePassword },
          { title: 'Verify', path: paths.authDemo.split.verify },
          { title: 'Sign in (centered)', path: paths.authDemo.centered.signIn },
          { title: 'Sign up (centered)', path: paths.authDemo.centered.signUp },
          { title: 'Reset password (centered)', path: paths.authDemo.centered.resetPassword },
          { title: 'Update password (centered)', path: paths.authDemo.centered.updatePassword },
          { title: 'Verify (centered)', path: paths.authDemo.centered.verify },
        ],
      },
      {
        subheader: 'Error',
        items: [
          { title: 'Page 403', path: paths.page403 },
          { title: 'Page 404', path: paths.page404 },
          { title: 'Page 500', path: paths.page500 },
        ],
      },
      { subheader: 'Dashboard', items: [{ title: 'Dashboard', path: CONFIG.auth.redirectPath }] },
    ],
  },
  {
    title: 'Docs',
    icon: <Iconify width={22} icon="solar:notebook-bold-duotone" />,
    path: paths.docs,
  },*/
];
