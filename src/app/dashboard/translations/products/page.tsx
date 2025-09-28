'use client';

import type { Product } from 'src/types/database.types';

import { useState, useEffect } from 'react';

import { 
  Edit as EditIcon,
  ShoppingCart as ProductIcon,
} from '@mui/icons-material';
import { 
  Box, 
  Card, 
  Grid, 
  Chip,
  Paper,
  Avatar,
  Dialog,
  Typography,
  IconButton,
  CardContent,
  DialogTitle,
  DialogContent,
} from '@mui/material';

import { useI18n } from 'src/contexts/i18n-context';
import { getProductsWithTranslations } from 'src/actions/translations';

import { TranslationEditor } from 'src/components/translation-editor';

export default function ProductTranslationsPage() {
  const { t, translateProduct } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProductsWithTranslations();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTranslations = (product: Product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedProduct(null);
    loadProducts(); // Reload to reflect changes
  };

  const getTranslationStatus = (product: Product) => {
    if (!product.translations || product.translations.length === 0) {
      return { color: 'error' as const, label: 'Nincs fordítás' };
    }
    
    const locales = new Set(product.translations.map(tr => tr.locale));
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
        <Typography>Termékek betöltése...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ProductIcon />
          Termék fordítások
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Termékek neveinek és leírásainak fordítása különböző nyelvekre
        </Typography>
      </Box>

      {/* Products Grid */}
      <Grid container spacing={3}>
        {products.map((product) => {
          const translatedProduct = translateProduct(product);
          const translationStatus = getTranslationStatus(product);
          
          return (
            <Grid size={{xs:12, md:6, lg:4}} key={product.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Product Image and Name */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      src={product.image_url || product.featured_image}
                      alt={translatedProduct.name}
                      sx={{ width: 56, height: 56 }}
                    >
                      <ProductIcon />
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
                        {translatedProduct.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.price.toLocaleString()} Ft / {product.unit}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Description */}
                  {translatedProduct.description && (
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
                      {translatedProduct.description}
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
                      onClick={() => handleEditTranslations(product)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>

                  {/* Available translations indicator */}
                  {product.translations && product.translations.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Elérhető fordítások: {Array.from(new Set(product.translations.map(tr => tr.locale.toUpperCase()))).join(', ')}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {products.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ProductIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nincsenek termékek
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
          Termék fordítások szerkesztése
        </DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <TranslationEditor
              recordId={selectedProduct.id}
              tableName="products"
              record={selectedProduct}
              onSaved={handleCloseEditDialog}
              onCancel={handleCloseEditDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}