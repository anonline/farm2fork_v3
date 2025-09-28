import type { NavSectionProps } from 'src/components/nav-section';

import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

import { usePendingOrdersCount } from './use-pending-orders-count';

// ----------------------------------------------------------------------

const icon = (name: string) => (
    <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
    job: icon('ic-job'),
    blog: icon('ic-blog'),
    chat: icon('ic-chat'),
    mail: icon('ic-mail'),
    user: icon('ic-user'),
    file: icon('ic-file'),
    lock: icon('ic-lock'),
    tour: icon('ic-tour'),
    order: icon('ic-order'),
    label: icon('ic-label'),
    blank: icon('ic-blank'),
    kanban: icon('ic-kanban'),
    folder: icon('ic-folder'),
    course: icon('ic-course'),
    banking: icon('ic-banking'),
    booking: icon('ic-booking'),
    invoice: icon('ic-invoice'),
    product: icon('ic-product'),
    calendar: icon('ic-calendar'),
    disabled: icon('ic-disabled'),
    external: icon('ic-external'),
    menuItem: icon('ic-menu-item'),
    ecommerce: icon('ic-ecommerce'),
    analytics: icon('ic-analytics'),
    dashboard: icon('ic-dashboard'),
    parameter: icon('ic-parameter'),
    translations: icon('ic-label'),
};

// ----------------------------------------------------------------------

export function useDashboardNavData(): NavSectionProps['data'] {
    const { count: pendingOrdersCount } = usePendingOrdersCount();

    return useMemo(
        () => [
            /**
             * Overview
             */
            {
                subheader: 'Statisztikák',
                items: [
                    { title: 'Vezérlőpult', path: paths.dashboard.root, icon: ICONS.dashboard },
                    { title: 'Eladások', path: paths.dashboard.general.ecommerce, icon: ICONS.ecommerce },
                    { title: 'Összesítők', path: paths.dashboard.shipments.root, icon: ICONS.file },
                ],
            },
            /**
             * Management
             */
            {
                subheader: 'Kezelés',
                items: [
                    {
                        title: 'Rendelések',
                        path: paths.dashboard.order.root,
                        icon: ICONS.order,
                        info: (
                            <Label
                                color="success"
                                variant="inverted"
                                startIcon={<Iconify icon="solar:cart-3-bold" />}
                            >
                                {pendingOrdersCount}
                            </Label>
                        ),
                    },
                    {
                        title: 'Termékek',
                        path: paths.dashboard.product.root,
                        icon: ICONS.product,
                        children: [
                            { title: 'Összes termék', path: paths.dashboard.product.root },
                            { title: 'Új termék', path: paths.dashboard.product.new },
                            { title: 'Kategóriák', path: paths.dashboard.product.categories.root },
                        ],
                    },
                    {
                        title: 'Termelők',
                        path: paths.dashboard.producer.root,
                        icon: ICONS.course,
                        children: [
                            { title: 'Összes termelő', path: paths.dashboard.producer.root },
                            { title: 'Új termelő', path: paths.dashboard.producer.new },
                        ],
                    },
                    {
                        title: 'Felhasználók',
                        path: paths.dashboard.user.root,
                        icon: ICONS.user,
                        children: [
                            { title: 'Összes felhasználó', path: paths.dashboard.user.list },
                            { title: 'Új felhasználó', path: paths.dashboard.user.new },
                            { title: 'Profil', path: paths.dashboard.user.account },
                        ],
                    },
                    {
                        title: 'Hírek',
                        path: paths.dashboard.post.root,
                        icon: ICONS.blog,
                        children: [
                            { title: 'Összes hír', path: paths.dashboard.post.root },
                            { title: 'Kategóriák kezelése', path: paths.dashboard.post.categories.root },
                        ],
                    }
                    //{ title: 'File manager', path: paths.dashboard.fileManager, icon: ICONS.folder },
                ],
            },
            /**
             * Settings
             */
            {
                subheader: 'Beállítások',
                items: [
                    {
                        title: 'GYIK',
                        path: paths.dashboard.faqs.root,
                        icon: ICONS.menuItem,
                        caption: 'Gyakran Ismételt Kérdések',
                    },
                    {
                        title: 'Beállítások',
                        path: '#/dashboard/menu_level',
                        icon: ICONS.parameter,
                        children: [
                            /*{ 
                                title: 'Kezdőképernyő beállításai', 
                                path: '#/dashboard/settings/home' 
                            },*/
                            {
                                title: 'Vásárlás',
                                path: paths.dashboard.settings.purchase,
                                icon: ICONS.order,
                            },
                            {
                                title: 'Futárok',
                                path: paths.dashboard.delivery.root, icon: ICONS.job
                            },
                            {
                                title: 'Partnerek',
                                path: paths.dashboard.partners.root, icon: ICONS.kanban
                            },
                            {
                                title: 'Szállítási Zónák',
                                path: paths.dashboard.shipping.root,
                                icon: ICONS.tour,
                            },
                            {
                                title: 'Szállítási díjak és metódusok',
                                path: paths.dashboard.shippingCost.root,
                                icon: ICONS.banking,
                            },
                            {
                                title: 'Fizetésimódok',
                                path: paths.dashboard.paymentMethod.root,
                                icon: ICONS.external,
                            },
                            {
                                title: 'Átvételi pontok',
                                path: paths.dashboard.pickup.root,
                                icon: ICONS.folder,
                            },
                            {
                                title: 'Woocommerce API',
                                path: paths.dashboard.woocommerce.root,
                                icon: ICONS.external,
                            },
                            {
                                title: 'Email sablonok',
                                path: paths.dashboard.emailtemplates.root,
                                icon: ICONS.mail,
                            },
                            {
                                title: 'Fordítások',
                                path: paths.dashboard.translations.root,
                                icon: ICONS.translations,
                                children: [
                                    { title: 'Összes fordítás', path: paths.dashboard.translations.root },
                                    { title: 'Termékek', path: paths.dashboard.translations.products },
                                    { title: 'Termelők', path: paths.dashboard.translations.producers },
                                    { title: 'Kategóriák', path: paths.dashboard.translations.categories },
                                ],
                            },
                            /*{
                                title: 'Level 1a',
                                path: '#/dashboard/menu_level/menu_level_1a',
                                children: [
                                    {
                                        title: 'Level 2a',
                                        path: '#/dashboard/menu_level/menu_level_1a/menu_level_2a',
                                    },
                                    {
                                        title: 'Level 2b',
                                        path: '#/dashboard/menu_level/menu_level_1a/menu_level_2b',
                                        children: [
                                            {
                                                title: 'Level 3a',
                                                path: '#/dashboard/menu_level/menu_level_1a/menu_level_2b/menu_level_3a',
                                            },
                                            {
                                                title: 'Level 3b',
                                                path: '#/dashboard/menu_level/menu_level_1a/menu_level_2b/menu_level_3b',
                                            },
                                        ],
                                    },
                                ],
                            },*/
                        ],
                    },
                ],
            },
        ],
        [pendingOrdersCount]
    );
}
