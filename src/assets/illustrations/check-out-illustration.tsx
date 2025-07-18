import type { SvgIconProps } from '@mui/material/SvgIcon';

import { memo } from 'react';

import SvgIcon from '@mui/material/SvgIcon';

// ----------------------------------------------------------------------

function CheckoutIllustration({ sx, ...other }: SvgIconProps) {
    return (
        <SvgIcon
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            sx={[
                (theme) => ({
                    '--primary-light': theme.vars.palette.primary.light,
                    '--primary-main': theme.vars.palette.primary.main,
                    '--primary-dark': theme.vars.palette.primary.dark,
                    '--primary-darker': theme.vars.palette.primary.darker,
                    width: 120,
                    maxWidth: 1,
                    flexShrink: 0,
                    height: 'auto',
                }),
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...other}
        >
            <path
                fill="url(#a)"
                d="M85.6 134.7c-3.7-5.5-33-10.5-35.3-12 0 0-5.4-2-7.8 3.4-2.4 5.4-16.6 49.8-16.6 49.8s27.8 14.9 36 16.5c3.3.4 6.9-1.1 9.7-2.9l15.8-47.2c-.1 0 2.1-5.2-1.8-7.6z"
            />
            <path
                fill="var(--primary-darker)"
                d="M85.6 134.7c2.6 4.5-17.3 52.2-17.2 55.4v.1c2.5 4-4.6 6.9-5.6 2.3-.3 0-.6 0-.9-.1.2-.1.5-.2.8-.4-.1-1.8 1.2-3.2 2.9-3.3 1.6-4.7 17-51 17.3-51.6 0 0-.5-3.5-1.8-5.7 1.8.7 3.4 1.7 4.5 3.3zm2.4-29.4c-.3.5-17.4-7.9-14.5.4l-8 21.2c1 .3 2 .6 3 .8 1.7-5.2 6.9-20.9 7.4-22.2.5-1.5 6 .8 8.1 1.4 1.6.4 1.1 2 1.1 2l-7.4 21.4c1 .3 1.8.5 2.5.7l6.7-21.2c4.2-4.2 1.1-4.5 1.1-4.5zm-61.9 70.5c-4 0-4 6.2 0 6.2s4-6.2 0-6.2zm30.1 13c-4 0-4 6.2 0 6.2s4-6.2 0-6.2zm116.3 5.4v.2h-19.1v-7.7c6.1.3 19.4-2.3 19.1 7.5zm-65-11.4l-9.8-6.3-4.1 6.5 16.1 10.3c2.3-3.5 1.4-8.3-2.2-10.5zm56.3-2.1L156.7 94l-13.2-24.5-22.5 3.9c.8 15.9-1.6 50.8-3.2 66.8l-16.1 29.9 7.7 5.5 21.9-28.5 8.7-28.3 13.6 62.5 10.2-.6z"
            />
            <path
                fill="var(--primary-light)"
                d="M138 57.5s4.6-5.5-.5-10.6c0 0-6.5-10.5-8.4-12.4 0 0 0 .2-10.9.6l-.2.2c12.8 2.3 18 22.9 12 38.7l14-3.5-6-13z"
            />
            <path
                fill="var(--primary-main)"
                d="M161.4 93.8c2.4 8.2 3.9 14.1 3.9 14.1s-2.9.2-7.4.9L156.7 94c-4.4-7.8-15.8-28.3-18.8-36.4 0 0 4.7-5.5-.4-10.6 0 0-6.4-10.5-8.4-12.4 2.1-.3 4.4 1.5 6.8 4.1v-.2c10.1 13.8 23.7 37.9 33.3 51.8l-7.8 3.5zm-38.6-57c-6.8-4.5-16.7 2.2-15 10.2L80.7 92.9l8.8 3.6 23.8-31.3c.9 12.1-9.7 32.4-16.2 36.9-4.6 4.4 2 12.3 5.5 13.7v.1s7.7 3.6 17 3.5c.4-5.3 1.9-21.2 1.5-26.2 11.8-18.9 18.1-42.4 1.7-56.4z"
            />
            <path
                fill="var(--primary-darker)"
                d="M109.6 29.8c2.1-.4 11.1 1.4 13.3 1.8 1.1.1 2.1-.7 2-1.8 12.4.5 8.6-.2 9.2-10.7h3.1c.2-4.6-3.1-8.2-7-10.2-7.7-8.4-22.8-2-22.5 9.3.5 1.6-1.5 12 1.9 11.6z"
            />
            <path
                fill="#FBCDBE"
                d="M154.9 181.2l6.2-.4-.2 5.8h-6v-5.4zM99 177.3l5.2 3.3 4.6-5.5-5.8-4.1-4 6.3zM80.7 92.9l.9-1.6-5.2 6.4c-10 9.6 11.4 15.2 7.6 2.1l3.8-4-7.1-2.9zm95.5 4.9c-1-2.3-6.9-7.5-8.4-9.7l1.4 2.2-6.9 3.1 4 3.9c-3.5 9.4 12.5 10.2 9.9.5zm-52.9-80.6l-.7 2h-.7c0 3.9 1.9 7.5 3.1 10.3 5-.6 8.7-5.2 8.4-10.3h-10l-.1-2z"
            />
            <defs>
                <linearGradient
                    id="a"
                    x1="25.9"
                    x2="25.9"
                    y1="122.338"
                    y2="192.465"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="var(--primary-light)" />
                    <stop offset="1" stopColor="var(--primary-dark)" />
                </linearGradient>
            </defs>
        </SvgIcon>
    );
}

export default memo(CheckoutIllustration);
