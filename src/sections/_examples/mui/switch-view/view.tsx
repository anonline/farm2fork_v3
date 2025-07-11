'use client';

import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';

import { ComponentBox, ComponentLayout } from '../../layout';

// ----------------------------------------------------------------------

const COLORS = ['default', 'primary', 'secondary', 'info', 'success', 'warning', 'error'] as const;

const PLACEMENTS = ['top', 'start', 'bottom', 'end'] as const;

const DEMO_COMPONENTS = [
    {
        name: 'Basic',
        component: (
            <ComponentBox>
                <Switch defaultChecked slotProps={{ input: { id: 'checked-switch' } }} />
                <Switch slotProps={{ input: { id: 'unchecked-switch' } }} />
                <Switch disabled slotProps={{ input: { id: 'disabled-unchecked-switch' } }} />
                <Switch disabled checked slotProps={{ input: { id: 'disabled-checked-switch' } }} />
                <Switch
                    defaultChecked
                    color="default"
                    slotProps={{ input: { id: 'color-checked-switch' } }}
                />
            </ComponentBox>
        ),
    },
    {
        name: 'Sizes',
        component: (
            <ComponentBox>
                <FormGroup row>
                    <FormControlLabel
                        label="Small"
                        control={
                            <Switch
                                size="small"
                                slotProps={{ input: { id: 'size-small-switch' } }}
                            />
                        }
                    />
                    <FormControlLabel
                        label="Normal"
                        control={<Switch slotProps={{ input: { id: 'size-normal-switch' } }} />}
                    />
                </FormGroup>
            </ComponentBox>
        ),
    },
    {
        name: 'Placement',
        component: (
            <ComponentBox>
                <FormGroup row>
                    {PLACEMENTS.map((placement) => (
                        <FormControlLabel
                            key={placement}
                            value={placement}
                            label={placement}
                            labelPlacement={placement}
                            control={
                                <Switch slotProps={{ input: { id: `${placement}-switch` } }} />
                            }
                            sx={{ textTransform: 'capitalize' }}
                        />
                    ))}
                </FormGroup>
            </ComponentBox>
        ),
    },
    {
        name: 'Colors',
        component: (
            <ComponentBox>
                <FormControl component="fieldset">
                    <FormGroup>
                        {COLORS.map((color) => (
                            <FormControlLabel
                                key={color}
                                label={color}
                                control={
                                    <Switch
                                        defaultChecked
                                        color={color}
                                        slotProps={{ input: { id: `${color}-switch` } }}
                                    />
                                }
                                sx={{ textTransform: 'capitalize' }}
                            />
                        ))}

                        <FormControlLabel
                            disabled
                            label="Disabled"
                            control={
                                <Switch
                                    color="error"
                                    slotProps={{ input: { id: 'error-disabled-switch' } }}
                                />
                            }
                        />
                    </FormGroup>
                </FormControl>
            </ComponentBox>
        ),
    },
];

// ----------------------------------------------------------------------

export function SwitchView() {
    return (
        <ComponentLayout
            sectionData={DEMO_COMPONENTS}
            heroProps={{
                heading: 'Switch',
                moreLinks: ['https://mui.com/material-ui/react-switch/'],
            }}
        />
    );
}
