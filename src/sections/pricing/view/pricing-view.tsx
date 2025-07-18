'use client';

import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import SvgIcon from '@mui/material/SvgIcon';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { _pricingPlans } from 'src/_mock';

import { PricingCard } from '../pricing-card';

// ----------------------------------------------------------------------

export function PricingView() {
    const arrowIcon = () => (
        <SvgIcon
            viewBox="0 0 48 48"
            sx={{
                width: 48,
                height: 48,
                color: 'grey.500',
            }}
        >
            <path
                fill="currentColor"
                d="M10.2147 30.6123C6.71243 22.9891 10.1906 14.9695 17.1738 11.0284C24.2834 7.01748 33.9187 7.08209 41.1519 10.6817C42.6578 11.4331 41.4507 13.5427 39.9511 12.945C33.399 10.3368 25.7611 10.0919 19.3278 13.1729C16.5269 14.4946 14.2131 16.6643 12.7143 19.3746C10.7314 22.9202 11.202 26.5193 11.6878 30.3396C11.8055 31.2586 10.5388 31.3074 10.2147 30.6123Z"
                fillOpacity="0.24"
            />
            <path
                fill="currentColor"
                d="M11.8126 39.0341C9.56032 35.9944 6.83856 32.7706 6.01828 28.9795C5.98242 28.8458 5.99937 28.7036 6.0656 28.5821C6.13183 28.4607 6.24226 28.3694 6.374 28.3271C6.50573 28.2849 6.64867 28.295 6.77316 28.3553C6.89765 28.4157 6.99414 28.5216 7.04263 28.6511C8.43444 31.8092 10.4092 34.463 12.553 37.1099C13.8625 35.3195 14.915 33.2716 16.4773 31.7142C16.6164 31.5741 16.8007 31.4879 16.9974 31.471C17.1941 31.4541 17.3905 31.5075 17.5515 31.6218C17.7125 31.736 17.8277 31.9037 17.8767 32.095C17.9257 32.2863 17.9052 32.4887 17.8189 32.6663C16.5996 35.0298 15.0564 37.2116 13.2339 39.1484C13.1391 39.2464 13.0238 39.3222 12.8963 39.3703C12.7688 39.4185 12.6321 39.4378 12.4963 39.4268C12.3604 39.4159 12.2286 39.375 12.1104 39.3071C11.9922 39.2392 11.8905 39.1459 11.8126 39.0341Z"
                fillOpacity="0.24"
            />
        </SvgIcon>
    );

    return (
        <Container sx={{ pt: { xs: 3, md: 5 }, pb: 10 }}>
            <Typography variant="h3" align="center" sx={{ mb: 2 }}>
                Flexible plans for your
                <br /> {`community's size and needs`}
            </Typography>

            <Typography align="center" sx={{ color: 'text.secondary' }}>
                Choose your plan and make modern online conversation magic
            </Typography>

            <Box sx={{ mt: 9, mb: 5, position: 'relative' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="overline">MONTHLY</Typography>

                    <Switch
                        sx={{ mx: 1 }}
                        slotProps={{
                            input: {
                                id: 'yearly-pricing-switch',
                                'aria-label': 'Yearly pricing switch',
                            },
                        }}
                    />

                    <Box sx={{ position: 'relative' }}>
                        <Box
                            sx={{
                                left: 12,
                                bottom: 12,
                                display: 'flex',
                                position: 'absolute',
                            }}
                        >
                            {arrowIcon()}
                            <Box
                                component="span"
                                sx={{
                                    whiteSpace: 'nowrap',
                                    color: 'success.main',
                                    typography: 'overline',
                                }}
                            >
                                save 10%
                            </Box>
                        </Box>

                        <Typography variant="overline">YEARLY</Typography>
                    </Box>
                </Box>
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gap: { xs: 3, md: 0 },
                    alignItems: { md: 'center' },
                    gridTemplateColumns: { md: 'repeat(3, 1fr)' },
                }}
            >
                {_pricingPlans.map((card, index) => (
                    <PricingCard key={card.subscription} card={card} index={index} />
                ))}
            </Box>
        </Container>
    );
}
