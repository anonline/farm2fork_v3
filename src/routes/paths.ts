import { kebabCase } from 'es-toolkit';

import { _id, _postTitles } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];
const MOCK_TITLE = _postTitles[2];

const ROOTS = {
    AUTH: '/auth',
    AUTH_DEMO: '/auth-demo',
    DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
    home: '/',
    comingSoon: '/coming-soon',
    maintenance: '/maintenance',
    pricing: '/pricing',
    payment: '/payment',
    about: '/about-us',
    contact: '/contact-us',
    faqs: '/faqs',
    rolunk: '/rolunk',
    profile: {
        root: '/profil',
        orders: '/profil/rendelesek',
        editAddress: '/profil/edit-address',
        editProfile: '/profil/edit-account',
    },
    rendelesMenete: '/rendeles-menete',
    szezonalitas:'/szezonalitas/Jan',
    tarolas:'/tarolas',
    page403: '/error/403',
    page404: '/error/404',
    page500: '/error/500',
    components: '/components',
    docs: 'https://docs.minimals.cc/',
    changelog: 'https://docs.minimals.cc/changelog/',
    zoneStore: 'https://mui.com/store/items/zone-landing-page/',
    minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
    freeUI: 'https://mui.com/store/items/minimal-dashboard-free/',
    figmaUrl:
        'https://www.figma.com/design/oAxS3CUFO0ou7rH2lTS8oI/%5BPreview%5D-Minimal-Web.v7.0.0',
    categories: {
        list: (slug: string) => `/termekek/${slug}`,
        root: '/termekek',
        zoldsegek: '/termekek/zoldsegek',
        gyumolcsok: '/termekek/gyumolcsok',
        feldolgozottTermekek: '/termekek/feldolgozott-termekek',
        szezonBox: '/termekek/szezon-box',
        gombak: '/termekek/gombak',
        pekaru: '/termekek/pekaru',
        fuszernovenyek: '/termekek/fuszernovenyek',
        egyeb: '/termekek/egyeb',
    },
    api: {
        search: {
            products: '/api/search/products',
            producers: 'api/search/producers'
        }
    },
    product: {
        root: `/termekek`,
        checkout: `/product/checkout`,
        details: (slug: string) => `/termek/${slug}`,
        demo: { details: `/termek/${MOCK_ID}` },
    },
    producers: {
        root: `/termelok`,
        details: (slug: string) => `/termelok/${slug}`,
    },
    post: {
        root: `/post`,
        details: (title: string) => `/post/${kebabCase(title)}`,
        demo: { details: `/post/${kebabCase(MOCK_TITLE)}` },
    },
    // AUTH
    auth: {
        amplify: {
            signIn: `${ROOTS.AUTH}/amplify/sign-in`,
            verify: `${ROOTS.AUTH}/amplify/verify`,
            signUp: `${ROOTS.AUTH}/amplify/sign-up`,
            updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
            resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
        },
        jwt: {
            signIn: `${ROOTS.AUTH}/jwt/sign-in`,
            signUp: `${ROOTS.AUTH}/jwt/sign-up`,
        },
        firebase: {
            signIn: `${ROOTS.AUTH}/firebase/sign-in`,
            verify: `${ROOTS.AUTH}/firebase/verify`,
            signUp: `${ROOTS.AUTH}/firebase/sign-up`,
            resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
        },
        auth0: { signIn: `${ROOTS.AUTH}/auth0/sign-in` },
        supabase: {
            signIn: `${ROOTS.AUTH}/supabase/sign-in`,
            verify: `${ROOTS.AUTH}/supabase/verify`,
            signUp: `${ROOTS.AUTH}/supabase/sign-up`,
            updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
            resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
        },
    },
    authDemo: {
        split: {
            signIn: `${ROOTS.AUTH_DEMO}/split/sign-in`,
            signUp: `${ROOTS.AUTH_DEMO}/split/sign-up`,
            resetPassword: `${ROOTS.AUTH_DEMO}/split/reset-password`,
            updatePassword: `${ROOTS.AUTH_DEMO}/split/update-password`,
            verify: `${ROOTS.AUTH_DEMO}/split/verify`,
        },
        centered: {
            signIn: `${ROOTS.AUTH_DEMO}/centered/sign-in`,
            signUp: `${ROOTS.AUTH_DEMO}/centered/sign-up`,
            resetPassword: `${ROOTS.AUTH_DEMO}/centered/reset-password`,
            updatePassword: `${ROOTS.AUTH_DEMO}/centered/update-password`,
            verify: `${ROOTS.AUTH_DEMO}/centered/verify`,
        },
    },
    // DASHBOARD
    dashboard: {
        root: ROOTS.DASHBOARD,
        mail: `${ROOTS.DASHBOARD}/mail`,
        chat: `${ROOTS.DASHBOARD}/chat`,
        blank: `${ROOTS.DASHBOARD}/blank`,
        kanban: `${ROOTS.DASHBOARD}/kanban`,
        calendar: `${ROOTS.DASHBOARD}/calendar`,
        fileManager: `${ROOTS.DASHBOARD}/file-manager`,
        permission: `${ROOTS.DASHBOARD}/permission`,
        faqs: {
            root: `${ROOTS.DASHBOARD}/faqs`,
            new: `${ROOTS.DASHBOARD}/faqs/new`,
            edit: (id: number) => `${ROOTS.DASHBOARD}/faqs/${id}/edit`,
            categories : {
                root: `${ROOTS.DASHBOARD}/faqs/categories`,
                new: `${ROOTS.DASHBOARD}/faqs/categories/new`,
                edit: (id: number) => `${ROOTS.DASHBOARD}/faqs/categories/${id}/edit`,
            }
        },
        general: {
            app: `${ROOTS.DASHBOARD}/app`,
            ecommerce: `${ROOTS.DASHBOARD}/ecommerce`,
            analytics: `${ROOTS.DASHBOARD}/analytics`,
            banking: `${ROOTS.DASHBOARD}/banking`,
            booking: `${ROOTS.DASHBOARD}/booking`,
            file: `${ROOTS.DASHBOARD}/file`,
            course: `${ROOTS.DASHBOARD}/course`,
        },
        user: {
            root: `${ROOTS.DASHBOARD}/user`,
            new: `${ROOTS.DASHBOARD}/user/new`,
            list: `${ROOTS.DASHBOARD}/user/list`,
            cards: `${ROOTS.DASHBOARD}/user/cards`,
            profile: `${ROOTS.DASHBOARD}/user/profile`,
            account: `${ROOTS.DASHBOARD}/user/account`,
            edit: (id: string) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
            demo: { edit: `${ROOTS.DASHBOARD}/user/${MOCK_ID}/edit` },
        },
        producer: {
            root: `${ROOTS.DASHBOARD}/producer`,
            new: `${ROOTS.DASHBOARD}/producer/new`,
            details: (id: string) => `${ROOTS.DASHBOARD}/producer/${id}`,
            edit: (id: string) => `${ROOTS.DASHBOARD}/producer/${id}/edit`,
        },
        product: {
            root: `${ROOTS.DASHBOARD}/product`,
            new: `${ROOTS.DASHBOARD}/product/new`,
            details: (id: string) => `${ROOTS.DASHBOARD}/product/${id}`,
            edit: (slug: string) => `${ROOTS.DASHBOARD}/product/${slug}/edit`,
            demo: {
                details: `${ROOTS.DASHBOARD}/product/${MOCK_ID}`,
                edit: `${ROOTS.DASHBOARD}/product/${MOCK_ID}/edit`,
            },
            categories: {
                root: `${ROOTS.DASHBOARD}/product/categories`,
                new: `${ROOTS.DASHBOARD}/product/categories/new`,
                edit: (id: string) => `${ROOTS.DASHBOARD}/product/categories/${id}`,
            },
        },
        invoice: {
            root: `${ROOTS.DASHBOARD}/invoice`,
            new: `${ROOTS.DASHBOARD}/invoice/new`,
            details: (id: string) => `${ROOTS.DASHBOARD}/invoice/${id}`,
            edit: (id: string) => `${ROOTS.DASHBOARD}/invoice/${id}/edit`,
            demo: {
                details: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}`,
                edit: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}/edit`,
            },
        },
        post: {
            root: `${ROOTS.DASHBOARD}/post`,
            categories: {
                root: `${ROOTS.DASHBOARD}/post/categories`
            }
        },
        order: {
            root: `${ROOTS.DASHBOARD}/order`,
            details: (id: string) => `${ROOTS.DASHBOARD}/order/${id}`,
            demo: { details: `${ROOTS.DASHBOARD}/order/${MOCK_ID}` },
        },
        job: {
            root: `${ROOTS.DASHBOARD}/job`,
            new: `${ROOTS.DASHBOARD}/job/new`,
            details: (id: string) => `${ROOTS.DASHBOARD}/job/${id}`,
            edit: (id: string) => `${ROOTS.DASHBOARD}/job/${id}/edit`,
            demo: {
                details: `${ROOTS.DASHBOARD}/job/${MOCK_ID}`,
                edit: `${ROOTS.DASHBOARD}/job/${MOCK_ID}/edit`,
            },
        },
        tour: {
            root: `${ROOTS.DASHBOARD}/tour`,
            new: `${ROOTS.DASHBOARD}/tour/new`,
            details: (id: string) => `${ROOTS.DASHBOARD}/tour/${id}`,
            edit: (id: string) => `${ROOTS.DASHBOARD}/tour/${id}/edit`,
            demo: {
                details: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}`,
                edit: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}/edit`,
            },
        },
        delivery: {
            root: `${ROOTS.DASHBOARD}/delivery`,
            new: `${ROOTS.DASHBOARD}/delivery/new`,
            edit: (id: string | number) => `${ROOTS.DASHBOARD}/delivery/edit/${id}`,
        },
    },
};
