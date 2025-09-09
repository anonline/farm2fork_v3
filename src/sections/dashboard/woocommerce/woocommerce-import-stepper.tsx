'use client';

import { useState } from 'react';

import {
    Box,
    Card,
    Step,
    Chip,
    Grid,
    Stack,
    Alert,
    Paper,
    Button,
    Stepper,
    Divider,
    Checkbox,
    StepLabel,
    CardHeader,
    Typography,
    CardContent,
    StepContent,
    LinearProgress,
    FormControlLabel,
    CircularProgress
} from '@mui/material';

import { themeConfig } from 'src/theme';
import { syncProducers, syncCategories } from 'src/actions/woocommerce-sync';

import { Iconify } from 'src/components/iconify';

type ImportStep = {
    id: string;
    label: string;
    description: string;
    icon: string;
    status: 'pending' | 'running' | 'completed' | 'error' | 'skipped';
    progress: number;
    processedCount: number;
    totalCount: number;
    details?: string;
    enabled: boolean; // New field for checkbox state
};

type Props = {
    wooCategories: any[];
    wooProducers: any[];
    wooProducts: any[];
};

export default function WooCommerceImportStepper({ wooCategories, wooProducers, wooProducts }: Props) {
    const [activeStep, setActiveStep] = useState(0);
    const [isImporting, setIsImporting] = useState(false);
    const [importStarted, setImportStarted] = useState(false);

    const [steps, setSteps] = useState<ImportStep[]>([
        {
            id: 'categories',
            label: 'Termék kategóriák importálása',
            description: 'WooCommerce termék kategóriák szinkronizálása a rendszerrel',
            icon: 'solar:file-text-bold',
            status: 'pending',
            progress: 0,
            processedCount: 0,
            totalCount: wooCategories?.length || 0,
            details: 'Várakozás az importálás indítására...',
            enabled: true
        },
        {
            id: 'producers',
            label: 'Termelők importálása',
            description: 'WooCommerce termelők adatainak szinkronizálása',
            icon: 'solar:users-group-rounded-bold',
            status: 'pending',
            progress: 0,
            processedCount: 0,
            totalCount: wooProducers?.length || 0,
            details: 'Várakozás az importálás indítására...',
            enabled: true
        },
        {
            id: 'products',
            label: 'Termékek importálása',
            description: 'WooCommerce termékek részletes adatainak szinkronizálása',
            icon: 'solar:box-minimalistic-bold',
            status: 'pending',
            progress: 0,
            processedCount: 0,
            totalCount: wooProducts?.length || 0,
            details: 'Várakozás az importálás indítására...',
            enabled: true
        }
    ]);

    // Handle step checkbox changes
    const handleStepToggle = (stepId: string) => {
        if (isImporting) return; // Prevent changes during import
        
        setSteps(prevSteps => 
            prevSteps.map(step => 
                step.id === stepId 
                    ? { ...step, enabled: !step.enabled }
                    : step
            )
        );
    };

    // Get next enabled step index
    const getNextEnabledStep = (currentIndex: number): number => {
        for (let i = currentIndex + 1; i < steps.length; i++) {
            if (steps[i].enabled) {
                return i;
            }
        }
        return -1; // No more enabled steps
    };

    // Real import process for categories, simulation for others
    const processStep = async (stepIndex: number) => {
        const step = steps[stepIndex];
        if (!step || step.status === 'completed') return;

        // Skip if step is disabled
        if (!step.enabled) {
            setSteps(prevSteps => {
                const newSteps = [...prevSteps];
                newSteps[stepIndex].status = 'skipped';
                newSteps[stepIndex].details = 'Lépés kihagyva';
                return newSteps;
            });

            // Move to next enabled step
            const nextStep = getNextEnabledStep(stepIndex);
            if (nextStep !== -1) {
                setTimeout(() => {
                    setActiveStep(nextStep);
                    processStep(nextStep);
                }, 500);
            } else {
                setIsImporting(false);
            }
            return;
        }

        if (step.id === 'categories') {
            // Real category synchronization
            try {
                setSteps(prevSteps => {
                    const newSteps = [...prevSteps];
                    newSteps[stepIndex].status = 'running';
                    newSteps[stepIndex].details = 'Kategóriák szinkronizálása megkezdve...';
                    return newSteps;
                });

                const result = await syncCategories(wooCategories, (processed, total, currentItem) => {
                    setSteps(prevSteps => {
                        const newSteps = [...prevSteps];
                        const currentStep = newSteps[stepIndex];
                        currentStep.processedCount = processed;
                        currentStep.progress = (processed / total) * 100;
                        currentStep.details = `${currentItem} feldolgozása...`;
                        return newSteps;
                    });
                });

                // Update final status
                setSteps(prevSteps => {
                    const newSteps = [...prevSteps];
                    const currentStep = newSteps[stepIndex];
                    currentStep.status = 'completed';
                    currentStep.progress = 100;
                    currentStep.details = `Befejezve! ${result.success} sikeres, ${result.errors} hiba.`;
                    return newSteps;
                });

                // Move to next step after a short delay
                setTimeout(() => {
                    const nextStep = getNextEnabledStep(stepIndex);
                    if (nextStep !== -1) {
                        setActiveStep(nextStep);
                        processStep(nextStep);
                    } else {
                        setIsImporting(false);
                    }
                }, 1000);

            } catch (error) {
                setSteps(prevSteps => {
                    const newSteps = [...prevSteps];
                    const currentStep = newSteps[stepIndex];
                    currentStep.status = 'error';
                    currentStep.details = `Hiba történt: ${error}`;
                    return newSteps;
                });
                setIsImporting(false);
            }
        } else if (step.id === 'producers') {
            // Real producer synchronization
            try {
                setSteps(prevSteps => {
                    const newSteps = [...prevSteps];
                    newSteps[stepIndex].status = 'running';
                    newSteps[stepIndex].details = 'Termelők szinkronizálása megkezdve...';
                    return newSteps;
                });
                const result = await syncProducers(wooProducers, (processed, total, currentItem) => {
                    setSteps(prevSteps => {
                        const newSteps = [...prevSteps];
                        const currentStep = newSteps[stepIndex];
                        currentStep.processedCount = processed;
                        currentStep.progress = (processed / total) * 100;
                        currentStep.details = `${currentItem} feldolgozása...`;
                        return newSteps;
                    });
                });

                // Update final status
                setSteps(prevSteps => {
                    const newSteps = [...prevSteps];
                    const currentStep = newSteps[stepIndex];
                    currentStep.status = 'completed';
                    currentStep.progress = 100;
                    currentStep.details = `Befejezve! ${result.success} sikeres, ${result.errors} hiba.`;
                    return newSteps;
                });

                // Move to next step after a short delay
                setTimeout(() => {
                    const nextStep = getNextEnabledStep(stepIndex);
                    if (nextStep !== -1) {
                        setActiveStep(nextStep);
                        processStep(nextStep);
                    } else {
                        setIsImporting(false);
                    }
                }, 1000);

            } catch (error) {
                setSteps(prevSteps => {
                    const newSteps = [...prevSteps];
                    const currentStep = newSteps[stepIndex];
                    currentStep.status = 'error';
                    currentStep.details = `Hiba történt: ${error}`;
                    return newSteps;
                });
                setIsImporting(false);
            }
        } else {
            // Simulation for products (to be implemented later)
            simulateStepProgress(stepIndex);
        }
    };

    // Simulate import process for producers and products (will be replaced later)
    const simulateStepProgress = (stepIndex: number) => {
        const step = steps[stepIndex];
        if (!step || step.status === 'completed') return;

        const interval = setInterval(() => {
            setSteps(prevSteps => {
                const newSteps = [...prevSteps];
                const currentStep = newSteps[stepIndex];

                if (currentStep.processedCount < currentStep.totalCount) {
                    currentStep.processedCount += 1;
                    currentStep.progress = (currentStep.processedCount / currentStep.totalCount) * 100;
                    currentStep.status = 'running';
                    currentStep.details = `${currentStep.processedCount}/${currentStep.totalCount} elem feldolgozva...`;
                } else {
                    currentStep.status = 'completed';
                    currentStep.progress = 100;
                    currentStep.details = 'Sikeresen befejezve!';
                    clearInterval(interval);
                    
                    // Move to next step after a short delay
                    setTimeout(() => {
                        const nextStep = getNextEnabledStep(stepIndex);
                        if (nextStep !== -1) {
                            setActiveStep(nextStep);
                            processStep(nextStep);
                        } else {
                            setIsImporting(false);
                        }
                    }, 1000);
                }

                return newSteps;
            });
        }, 100 + Math.random() * 200); // Random delay between 100-300ms for more realistic feel
    };

    const startImport = () => {
        setIsImporting(true);
        setImportStarted(true);
        
        // Find first enabled step
        const firstEnabledStep = steps.findIndex(step => step.enabled);
        if (firstEnabledStep === -1) {
            // No steps enabled
            setIsImporting(false);
            return;
        }
        
        setActiveStep(firstEnabledStep);
        
        // Reset all steps
        setSteps(prevSteps => 
            prevSteps.map((step, index) => ({
                ...step,
                status: index === firstEnabledStep && step.enabled ? 'running' : step.enabled ? 'pending' : 'skipped',
                progress: 0,
                processedCount: 0,
                details: index === firstEnabledStep && step.enabled 
                    ? 'Importálás megkezdve...' 
                    : step.enabled 
                        ? 'Várakozás...'
                        : 'Lépés kihagyva'
            }))
        );

        // Start first enabled step
        setTimeout(() => processStep(firstEnabledStep), 500);
    };

    const getStepStatusColor = (status: ImportStep['status']) => {
        switch (status) {
            case 'completed': return themeConfig.palette.success.main;
            case 'running': return themeConfig.palette.primary.main;
            case 'error': return themeConfig.palette.error.main;
            case 'skipped': return themeConfig.palette.grey[500];
            default: return themeConfig.palette.grey[400];
        }
    };

    const getStepStatusIcon = (status: ImportStep['status']) => {
        switch (status) {
            case 'completed': return 'solar:check-circle-bold';
            case 'running': return 'solar:info-circle-bold';
            case 'error': return 'solar:close-circle-bold';
            case 'skipped': return 'solar:forbidden-circle-bold';
            default: return 'solar:clock-circle-bold';
        }
    };

    const getTotalProgress = () => {
        const enabledSteps = steps.filter(step => step.enabled);
        const totalItems = enabledSteps.reduce((sum, step) => sum + step.totalCount, 0);
        const processedItems = enabledSteps.reduce((sum, step) => sum + step.processedCount, 0);
        return totalItems > 0 ? (processedItems / totalItems) * 100 : 0;
    };

    const getCompletedStepsCount = () => {
        const enabledSteps = steps.filter(step => step.enabled);
        const completedSteps = enabledSteps.filter(step => step.status === 'completed');
        return completedSteps.length;
    };

    const getEnabledStepsCount = () => steps.filter(step => step.enabled).length;

    return (
        <Card sx={{ mt: 3 }}>
            <CardHeader
                title={
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Iconify icon="solar:download-bold" width={32} height={32} />
                        <Typography variant="h5">
                            WooCommerce Szinkronizálás
                        </Typography>
                    </Stack>
                }
                subheader="Adatok automatikus importálása a WooCommerce rendszerből"
            />
            <CardContent>
                <Stack spacing={3}>
                    {/* Overall Progress Summary */}
                    {importStarted && (
                        <Paper sx={{ p: 3, bgcolor: 'background.neutral' }}>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 8 }}>
                                    <Stack spacing={2}>
                                        <Typography variant="h6">
                                            Összesített előrehaladás
                                        </Typography>
                                        <Box>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {getCompletedStepsCount()}/{getEnabledStepsCount()} lépés befejezve
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {getTotalProgress().toFixed(1)}%
                                                </Typography>
                                            </Stack>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={getTotalProgress()} 
                                                sx={{ height: 8, borderRadius: 4 }}
                                            />
                                        </Box>
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Stack spacing={1} alignItems="center">
                                        <Typography variant="body2" color="text.secondary">
                                            Státusz
                                        </Typography>
                                        <Chip
                                            icon={<Iconify icon={isImporting ? "solar:info-circle-bold" : getCompletedStepsCount() === getEnabledStepsCount() ? "solar:check-circle-bold" : "solar:clock-circle-bold"} />}
                                            label={
                                                isImporting 
                                                    ? "Importálás folyamatban..." 
                                                    : getCompletedStepsCount() === getEnabledStepsCount() 
                                                        ? "Befejezve" 
                                                        : "Várakozik"
                                            }
                                            color={
                                                isImporting 
                                                    ? "primary" 
                                                    : getCompletedStepsCount() === getEnabledStepsCount() 
                                                        ? "success" 
                                                        : "default"
                                            }
                                            variant="filled"
                                        />
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Paper>
                    )}

                    {/* Step Selection */}
                    {!importStarted && (
                        <Paper sx={{ p: 3, bgcolor: 'background.neutral' }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Válaszd ki a végrehajtandó lépéseket:
                            </Typography>
                            <Grid container spacing={2}>
                                {steps.map((step) => (
                                    <Grid key={step.id} size={{ xs: 12, md: 4 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={step.enabled}
                                                    onChange={() => handleStepToggle(step.id)}
                                                    disabled={isImporting}
                                                />
                                            }
                                            label={
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {step.label}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {step.totalCount} elem
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                            {getEnabledStepsCount() === 0 && (
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    Legalább egy lépést ki kell választani az importálás megkezdéséhez.
                                </Alert>
                            )}
                        </Paper>
                    )}

                    {/* Start Import Button */}
                    {!importStarted && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                Az importálás megkezdéséhez kattintson az alábbi gombra. A folyamat automatikusan végighalad a kiválasztott lépéseken:
                            </Typography>
                            <Box sx={{ ml: 2 }}>
                                {steps.filter(step => step.enabled).map(step => (
                                    <Typography key={step.id} variant="body2">
                                        • {step.totalCount} {step.label.toLowerCase()}
                                    </Typography>
                                ))}
                            </Box>
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={startImport}
                            disabled={isImporting || getEnabledStepsCount() === 0}
                            startIcon={
                                isImporting ? (
                                    <CircularProgress size={20} color="inherit" />
                                ) : (
                                    <Iconify icon="solar:play-circle-bold" width={24} height={24} />
                                )
                            }
                            sx={{ px: 4, py: 1.5 }}
                        >
                            {isImporting 
                                ? 'Importálás folyamatban...' 
                                : getEnabledStepsCount() === 0 
                                    ? 'Válassz legalább egy lépést'
                                    : 'Szinkronizálás indítása'
                            }
                        </Button>
                    </Box>

                    <Divider />

                    {/* Stepper */}
                    <Stepper activeStep={activeStep} orientation="vertical">
                        {steps.map((step, index) => (
                            <Step key={step.id}>
                                <StepLabel
                                    StepIconComponent={({ active, completed }) => (
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: getStepStatusColor(step.status),
                                                color: 'white',
                                                border: step.status === 'running' ? '3px solid' : 'none',
                                                borderColor: step.status === 'running' ? themeConfig.palette.primary.light : 'transparent',
                                                opacity: step.status === 'skipped' ? 0.6 : 1
                                            }}
                                        >
                                            {step.status === 'running' ? (
                                                <CircularProgress size={20} color="inherit" />
                                            ) : (
                                                <Iconify 
                                                    icon={step.status === 'pending' ? step.icon as any : getStepStatusIcon(step.status)} 
                                                    width={24} 
                                                    height={24} 
                                                />
                                            )}
                                        </Box>
                                    )}
                                >
                                    <Stack spacing={0.5}>
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                fontWeight: 600,
                                                opacity: step.status === 'skipped' ? 0.6 : 1,
                                                textDecoration: step.status === 'skipped' ? 'line-through' : 'none'
                                            }}
                                        >
                                            {step.label}
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            sx={{ opacity: step.status === 'skipped' ? 0.6 : 1 }}
                                        >
                                            {step.description}
                                        </Typography>
                                    </Stack>
                                </StepLabel>
                                <StepContent>
                                    {step.status === 'skipped' ? (
                                        <Paper sx={{ p: 3, mt: 2, mb: 2, bgcolor: 'background.neutral', opacity: 0.6 }}>
                                            <Alert severity="info">
                                                <Typography variant="body2">
                                                    Ez a lépés ki lett hagyva.
                                                </Typography>
                                            </Alert>
                                        </Paper>
                                    ) : (
                                        <Paper sx={{ p: 3, mt: 2, mb: 2, bgcolor: 'background.neutral' }}>
                                        <Stack spacing={2}>
                                            {/* Progress Bar */}
                                            <Box>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Előrehaladás
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {step.progress.toFixed(1)}%
                                                    </Typography>
                                                </Stack>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={step.progress} 
                                                    sx={{ height: 6, borderRadius: 3 }}
                                                    color={step.status === 'completed' ? 'success' : 'primary'}
                                                />
                                            </Box>

                                            {/* Stats */}
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 6 }}>
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <Iconify icon="solar:list-bold" width={16} height={16} />
                                                        <Typography variant="body2">
                                                            Feldolgozva: <strong>{step.processedCount}/{step.totalCount}</strong>
                                                        </Typography>
                                                    </Stack>
                                                </Grid>
                                                <Grid size={{ xs: 6 }}>
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <Iconify 
                                                            icon={getStepStatusIcon(step.status) as any} 
                                                            width={16} 
                                                            height={16} 
                                                            color={getStepStatusColor(step.status)}
                                                        />
                                                        <Typography variant="body2" color="text.secondary">
                                                            {step.details}
                                                        </Typography>
                                                    </Stack>
                                                </Grid>
                                            </Grid>

                                            {/* Estimated Time (placeholder for now) */}
                                            {step.status === 'running' && (
                                                <Alert severity="info" sx={{ mt: 1 }}>
                                                    <Typography variant="body2">
                                                        Becsült hátralévő idő: ~{Math.ceil((step.totalCount - step.processedCount) * 0.2)} másodperc
                                                    </Typography>
                                                </Alert>
                                            )}

                                            {step.status === 'completed' && (
                                                <Alert severity="success" sx={{ mt: 1 }}>
                                                    <Typography variant="body2">
                                                        ✅ {step.label} sikeresen befejezve! {step.totalCount} elem importálva.
                                                    </Typography>
                                                </Alert>
                                            )}
                                        </Stack>
                                        </Paper>
                                    )}
                                </StepContent>
                            </Step>
                        ))}
                    </Stepper>

                    {/* Completion Message */}
                    {importStarted && !isImporting && getCompletedStepsCount() === getEnabledStepsCount() && getEnabledStepsCount() > 0 && (
                        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.lighter' }}>
                            <Stack spacing={2} alignItems="center">
                                <Iconify icon="solar:check-circle-bold" width={48} height={48} color="success.main" />
                                <Typography variant="h5" color="success.main">
                                    Szinkronizálás befejezve!
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Minden adat sikeresen importálva lett a WooCommerce rendszerből.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    onClick={() => window.location.reload()}
                                    startIcon={<Iconify icon="solar:eye-bold" />}
                                >
                                    Oldal frissítése
                                </Button>
                            </Stack>
                        </Paper>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}
