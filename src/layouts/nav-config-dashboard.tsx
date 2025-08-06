import type { NavSectionProps } from 'src/components/nav-section';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

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
};

// ----------------------------------------------------------------------

/**
 * Input nav data is an array of navigation section items used to define the structure and content of a navigation bar.
 * Each section contains a subheader and an array of items, which can include nested children items.
 *
 * Each item can have the following properties:
 * - `title`: The title of the navigation item.
 * - `path`: The URL path the item links to.
 * - `icon`: An optional icon component to display alongside the title.
 * - `info`: Optional additional information to display, such as a label.
 * - `allowedRoles`: An optional array of roles that are allowed to see the item.
 * - `caption`: An optional caption to display below the title.
 * - `children`: An optional array of nested navigation items.
 * - `disabled`: An optional boolean to disable the item.
 */
export const navData: NavSectionProps['data'] = [
    /**
     * Overview
     */
    {
        subheader: 'Statisztikák',
        items: [
            { title: 'Vezérlőpult', path: paths.dashboard.root, icon: ICONS.dashboard },
            { title: 'Eladás', path: paths.dashboard.general.ecommerce, icon: ICONS.ecommerce },
            //{ title: 'Analitika', path: paths.dashboard.general.analytics, icon: ICONS.analytics },
            //{ title: 'Banking', path: paths.dashboard.general.banking, icon: ICONS.banking },
            //{ title: 'Booking', path: paths.dashboard.general.booking, icon: ICONS.booking },
            { title: 'Összesítők', path: paths.dashboard.general.file, icon: ICONS.file },
            //{ title: 'Course', path: paths.dashboard.general.course, icon: ICONS.course },
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
                        184
                    </Label>
                ),
            },
            {
                title: 'Termékek',
                path: paths.dashboard.product.root,
                icon: ICONS.product,
                children: [
                    { title: 'Összes termék', path: paths.dashboard.product.root },
                    { title: 'Részletek', path: paths.dashboard.product.demo.details },
                    { title: 'Új termék', path: paths.dashboard.product.new },
                    { title: 'Szerkesztés', path: paths.dashboard.product.demo.edit },
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
                    //{ title: 'Profile', path: paths.dashboard.user.root },
                    //{ title: 'Cards', path: paths.dashboard.user.cards },
                    { title: 'Összes felhasználó', path: paths.dashboard.user.list },
                    { title: 'Új felhasználó', path: paths.dashboard.user.new },
                    //{ title: 'Edit', path: paths.dashboard.user.demo.edit },
                    { title: 'Profil', path: paths.dashboard.user.account },
                ],
            },
            /*{
        title: 'Invoice',
        path: paths.dashboard.invoice.root,
        icon: ICONS.invoice,
        children: [
          { title: 'List', path: paths.dashboard.invoice.root },
          { title: 'Details', path: paths.dashboard.invoice.demo.details },
          { title: 'Create', path: paths.dashboard.invoice.new },
          { title: 'Edit', path: paths.dashboard.invoice.demo.edit },
        ],
      },*/
            {
                title: 'Hírek',
                path: paths.dashboard.post.root,
                icon: ICONS.blog,
                children: [
                    { title: 'List', path: paths.dashboard.post.root },
                    { title: 'Create', path: paths.dashboard.post.new },
                ],
            },
            /*{
        title: 'Job',
        path: paths.dashboard.job.root,
        icon: ICONS.job,
        children: [
          { title: 'List', path: paths.dashboard.job.root },
          { title: 'Details', path: paths.dashboard.job.demo.details },
          { title: 'Create', path: paths.dashboard.job.new },
          { title: 'Edit', path: paths.dashboard.job.demo.edit },
        ],
      },*/
            /*{
        title: 'Tour',
        path: paths.dashboard.tour.root,
        icon: ICONS.tour,
        children: [
          { title: 'List', path: paths.dashboard.tour.root },
          { title: 'Details', path: paths.dashboard.tour.demo.details },
          { title: 'Create', path: paths.dashboard.tour.new },
          { title: 'Edit', path: paths.dashboard.tour.demo.edit },
        ],
      },*/
            { title: 'File manager', path: paths.dashboard.fileManager, icon: ICONS.folder },
            /*{
        title: 'Mail',
        path: paths.dashboard.mail,
        icon: ICONS.mail,
        info: (
          <Label color="error" variant="inverted">
            +32
          </Label>
        ),
      },
      { title: 'Chat', path: paths.dashboard.chat, icon: ICONS.chat },
      { title: 'Calendar', path: paths.dashboard.calendar, icon: ICONS.calendar },
      { title: 'Kanban', path: paths.dashboard.kanban, icon: ICONS.kanban },*/
        ],
    },
    /**
     * Item state
     */
    {
        subheader: 'Beállítások',
        items: [
            {
                title: 'GYIK',
                path: paths.dashboard.faqs.root,
                icon: ICONS.menuItem,
                caption: 'Gyakran Ismételt Kérdések'
            },
            /*{
                /**
                 * Permissions can be set for each item by using the `allowedRoles` property.
                 * - If `allowedRoles` is not set (default), all roles can see the item.
                 * - If `allowedRoles` is an empty array `[]`, no one can see the item.
                 * - If `allowedRoles` contains specific roles, only those roles can see the item.
                 *
                 * Examples:
                 * - `allowedRoles: ['user']` - only users with the 'user' role can see this item.
                 * - `allowedRoles: ['admin']` - only users with the 'admin' role can see this item.
                 * - `allowedRoles: ['admin', 'manager']` - only users with the 'admin' or 'manager' roles can see this item.
                 *
                 * Combine with the `checkPermissions` prop to build conditional expressions.
                 * Example usage can be found in: src/sections/_examples/extra/navigation-bar-view/nav-vertical.{jsx | tsx}
                 
                title: 'Jogosultságok',
                path: paths.dashboard.permission,
                icon: ICONS.lock,
                allowedRoles: ['admin', 'manager'],
                caption: 'Only admin can see this item.',
            },*/
            {
                title: 'Beállítások',
                path: '#/dashboard/menu_level',
                icon: ICONS.parameter,
                children: [
                    { title: 'Kezdőképernyő beállításai', path: '#/dashboard/settings/home' },
                    {
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
                    },
                ],
            },
            /*{
                title: 'Disabled',
                path: '#disabled',
                icon: ICONS.disabled,
                disabled: true,
            },*/
            /*{
                title: 'Label',
                path: '#label',
                icon: ICONS.label,
                info: (
                    <Label
                        color="info"
                        variant="inverted"
                        startIcon={<Iconify icon="solar:bell-bing-bold-duotone" />}
                    >
                        NEW
                    </Label>
                ),
            },*/
            
            /*{
                title: 'Params',
                path: '/dashboard/params?id=e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1',
                icon: ICONS.parameter,
            },
            {
                title: 'External link',
                path: 'https://www.google.com/',
                icon: ICONS.external,
                info: <Iconify width={18} icon="eva:external-link-fill" />,
            },
            { title: 'Blank', path: paths.dashboard.blank, icon: ICONS.blank },*/
        ],
    },
];
