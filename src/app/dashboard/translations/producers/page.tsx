'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Grid,
  Button,
  Chip,
  Paper,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { 
  Edit as EditIcon,
  Agriculture as ProducerIcon,
} from '@mui/icons-material';

import { useI18n } from 'src/contexts/i18n-context';
import { TranslationEditor } from 'src/components/translation-editor';
import { getProducersWithTranslations } from 'src/actions/translations';
import type { Producer } from 'src/types/database.types';

export default function ProducerTranslationsPage() {
  const { t, translateProducer } = useI18n();
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);

  useEffect(() => {
    loadProducers();
  }, []);

  const loadProducers = async () => {
    setLoading(true);
    try {
      const data = await getProducersWithTranslations();
      setProducers(data);
    } catch (error) {
      console.error('Failed to load producers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTranslations = (producer: Producer) => {
    setSelectedProducer(producer);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedProducer(null);
    loadProducers(); // Reload to reflect changes
  };

  const getTranslationStatus = (producer: Producer) => {
    if (!producer.translations || producer.translations.length === 0) {
      return { color: 'error' as const, label: 'Nincs fordítás' };
    }
    
    const locales = new Set(producer.translations.map(t => t.locale));
    const hasEnglish = locales.has('en');
    const hasGerman = locales.has('de');
    
    if (hasEnglish && hasGerman) {
      return { color: 'success' as const, label: 'Teljes (EN, DE)' };
    } else if (hasEnglish || hasGerman) {
      return { color: 'warning' as const, label: hasEnglish ? 'Részleges (EN)' : 'Részleges (DE)' };
    } else {
      return { color: 'error' as const, label: 'Nincs fordítás' };
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <Typography>Termelők betöltése...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ProducerIcon />
          Termelő fordítások
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Termelők neveinek és leírásainak fordítása különböző nyelvekre
        </Typography>
      </Box>

      {/* Producers Grid */}
      <Grid container spacing={3}>
        {producers.map((producer) => {
          const translatedProducer = translateProducer(producer);
          const translationStatus = getTranslationStatus(producer);
          
          return (
            <Grid size={{xs:12, md:6, lg:4}} key={producer.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Producer Image and Name */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      src={producer.image_url || producer.featured_image}
                      alt={translatedProducer.name}
                      sx={{ width: 56, height: 56 }}
                    >
                      <ProducerIcon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {translatedProducer.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {producer.location}
                      </Typography>
                      {producer.bio && (
                        <Chip 
                          label="Bio" 
                          color="success" 
                          size="small" 
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Description */}
                  {translatedProducer.description && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {translatedProducer.description}
                    </Typography>
                  )}

                  {/* Short Description */}
                  {translatedProducer.short_description && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        fontStyle: 'italic',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {translatedProducer.short_description}
                    </Typography>
                  )}

                  {/* Translation Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Chip
                      label={translationStatus.label}
                      color={translationStatus.color}
                      size="small"
                    />
                    
                    <IconButton
                      color="primary"
                      onClick={() => handleEditTranslations(producer)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>

                  {/* Available translations indicator */}
                  {producer.translations && producer.translations.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Elérhető fordítások: {Array.from(new Set(producer.translations.map(t => t.locale.toUpperCase()))).join(', ')}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {producers.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ProducerIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nincsenek termelők
          </Typography>
        </Paper>
      )}

      {/* Edit Translation Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseEditDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Termelő fordítások szerkesztése
        </DialogTitle>
        <DialogContent>
          {selectedProducer && (
            <TranslationEditor
              recordId={selectedProducer.id}
              tableName="producers"
              record={selectedProducer}
              onSaved={handleCloseEditDialog}
              onCancel={handleCloseEditDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}