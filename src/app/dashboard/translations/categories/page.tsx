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
  Category as CategoryIcon,
} from '@mui/icons-material';

import { useI18n } from 'src/contexts/i18n-context';
import { TranslationEditor } from 'src/components/translation-editor';
import { getCategoriesWithTranslations } from 'src/actions/translations';
import type { Category } from 'src/types/database.types';

export default function CategoryTranslationsPage() {
  const { t, translateCategory } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategoriesWithTranslations();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTranslations = (category: Category) => {
    setSelectedCategory(category);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedCategory(null);
    loadCategories(); // Reload to reflect changes
  };

  const getTranslationStatus = (category: Category) => {
    if (!category.translations || category.translations.length === 0) {
      return { color: 'error' as const, label: 'Nincs fordítás' };
    }
    
    const locales = new Set(category.translations.map(t => t.locale));
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
        <Typography>Kategóriák betöltése...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CategoryIcon />
          Kategória fordítások
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Kategóriák neveinek és leírásainak fordítása különböző nyelvekre
        </Typography>
      </Box>

      {/* Categories Grid */}
      <Grid container spacing={3}>
        {categories.map((category) => {
          const translatedCategory = translateCategory(category);
          const translationStatus = getTranslationStatus(category);
          
          return (
            <Grid size={{xs:12, md:6, lg:4}} key={category.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Category Icon and Name */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      src={category.cover_url}
                      alt={translatedCategory.name}
                      sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}
                    >
                      {category.icon ? (
                        <span style={{ fontSize: '24px' }}>{category.icon}</span>
                      ) : (
                        <CategoryIcon />
                      )}
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
                        {translatedCategory.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sorrend: {category.order}
                      </Typography>
                      {category.enabled ? (
                        <Chip 
                          label="Aktív" 
                          color="success" 
                          size="small" 
                          sx={{ mt: 0.5 }}
                        />
                      ) : (
                        <Chip 
                          label="Inaktív" 
                          color="default" 
                          size="small" 
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Description */}
                  {translatedCategory.description && (
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
                      {translatedCategory.description}
                    </Typography>
                  )}

                  {/* Parent Category Info */}
                  {category.parent_id && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>Szülő kategória:</strong> {category.parent_id}
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
                      onClick={() => handleEditTranslations(category)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>

                  {/* Available translations indicator */}
                  {category.translations && category.translations.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Elérhető fordítások: {Array.from(new Set(category.translations.map(t => t.locale.toUpperCase()))).join(', ')}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {categories.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nincsenek kategóriák
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
          Kategória fordítások szerkesztése
        </DialogTitle>
        <DialogContent>
          {selectedCategory && (
            <TranslationEditor
              recordId={selectedCategory.id}
              tableName="categories"
              record={selectedCategory}
              onSaved={handleCloseEditDialog}
              onCancel={handleCloseEditDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}