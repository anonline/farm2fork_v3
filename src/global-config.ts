import { paths } from 'src/routes/paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
    appName: string;
    appVersion: string;
    serverUrl: string;
    assetsDir: string;
    isStaticExport: boolean;
    auth: {
        method: 'jwt' | 'amplify' | 'firebase' | 'supabase' | 'auth0';
        skip: boolean;
        redirectPathAdmin: string;
        redirectPath: string;
    };
    mapboxApiKey: string;
    firebase: {
        appId: string;
        apiKey: string;
        projectId: string;
        authDomain: string;
        storageBucket: string;
        measurementId: string;
        messagingSenderId: string;
    };
    amplify: { userPoolId: string; userPoolWebClientId: string; region: string };
    auth0: { clientId: string; domain: string; callbackUrl: string };
    supabase: { url: string; key: string; service_key: string };
    blob: { readWriteToken: string };
    pagination: {
        productsPerPage: number;
        producersPerPage: number;
        infiniteScrollThreshold: number;
    };
};

// ----------------------------------------------------------------------

export const CONFIG: ConfigValue = {
    appName: 'Farm2Fork',
    appVersion: packageJson.version,
    serverUrl: process.env.NEXT_PUBLIC_SERVER_URL ?? '',
    assetsDir: process.env.NEXT_PUBLIC_ASSETS_DIR ?? '',
    isStaticExport: JSON.parse(process.env.BUILD_STATIC_EXPORT ?? 'false'),
    /**
     * Auth
     * @method jwt | amplify | firebase | supabase | auth0
     */
    auth: {
        method: 'supabase',
        skip: false,
        redirectPathAdmin: paths.dashboard.root,
        redirectPath: paths.home,
    },
    /**
     * Mapbox
     */
    mapboxApiKey: process.env.NEXT_PUBLIC_MAPBOX_API_KEY ?? '',
    /**
     * Firebase
     */
    firebase: {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
        appId: process.env.NEXT_PUBLIC_FIREBASE_APPID ?? '',
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? '',
    },
    /**
     * Amplify
     */
    amplify: {
        userPoolId: process.env.NEXT_PUBLIC_AWS_AMPLIFY_USER_POOL_ID ?? '',
        userPoolWebClientId: process.env.NEXT_PUBLIC_AWS_AMPLIFY_USER_POOL_WEB_CLIENT_ID ?? '',
        region: process.env.NEXT_PUBLIC_AWS_AMPLIFY_REGION ?? '',
    },
    /**
     * Auth0
     */
    auth0: {
        clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID ?? '',
        domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN ?? '',
        callbackUrl: process.env.NEXT_PUBLIC_AUTH0_CALLBACK_URL ?? '',
    },
    /**
     * Supabase
     */
    supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
        service_key: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY ?? '',
    },
    blob: {
        readWriteToken: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN ?? '',
    },
    /**
     * Pagination
     */
    pagination: {
        productsPerPage: 25, // Number of products to load per page
        producersPerPage: 20, // Number of producers to load per page
        infiniteScrollThreshold: 1500, // Distance from bottom in pixels to trigger load more
    },
};
