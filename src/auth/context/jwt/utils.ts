import { paths } from 'src/routes/paths';

import axios from 'src/lib/axios';

import { JWT_STORAGE_KEY } from './constant';

// ----------------------------------------------------------------------

export function jwtDecode(token: string) {
    try {
        if (!token) return null;

        const parts = token.split('.');
        if (parts.length < 2) {
            throw new Error('Invalid token!');
        }

        const base64Url = parts[1];
        const base64 = base64Url.replaceAll(/-/g, '+').replaceAll(/_/g, '/');

        // Ez a funkció biztonságosan kezeli az UTF-8 karaktereket (pl. 'á', 'ó')
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decoded = JSON.parse(jsonPayload);

        return decoded;
    } catch (error) {
        console.error('Error decoding token:', error);
        throw error;
    }
}

// ----------------------------------------------------------------------

export function isValidToken(accessToken: string) {
    if (!accessToken) {
        return false;
    }

    try {
        const decoded = jwtDecode(accessToken);

        if (!decoded || !('exp' in decoded)) {
            return false;
        }

        const currentTime = Date.now() / 1000;

        return decoded.exp > currentTime;
    } catch (error) {
        console.error('Error during token validation:', error);
        return false;
    }
}

// ----------------------------------------------------------------------

export function tokenExpired(exp: number) {
    const currentTime = Date.now();
    const timeLeft = exp * 1000 - currentTime;

    setTimeout(() => {
        try {
            alert('Token expired!');
            sessionStorage.removeItem(JWT_STORAGE_KEY);
            window.location.href = paths.auth.jwt.signIn;
        } catch (error) {
            console.error('Error during token expiration:', error);
            throw error;
        }
    }, timeLeft);
}

// ----------------------------------------------------------------------

export async function setSession(accessToken: string | null) {
    try {
        if (accessToken) {
            sessionStorage.setItem(JWT_STORAGE_KEY, accessToken);

            axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

            const decodedToken = jwtDecode(accessToken); // ~3 days by minimals server

            if (decodedToken && 'exp' in decodedToken) {
                tokenExpired(decodedToken.exp);
            } else {
                throw new Error('Invalid access token!');
            }
        } else {
            sessionStorage.removeItem(JWT_STORAGE_KEY);
            delete axios.defaults.headers.common.Authorization;
        }
    } catch (error) {
        console.error('Error during set session:', error);
        throw error;
    }
}
