'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { 
  Card, 
  CardHeader, 
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Search as SearchIcon,
  Add as AddIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';

import { useI18n } from 'src/contexts/i18n-context';
import { TranslationEditor } from 'src/components/translation-editor';
import { 
  getProductsWithTranslations, 
  getProducersWithTranslations,
  getCategoriesWithTranslations 
} from 'src/actions/translations';
import type { Product, Producer, Category } from 'src/types/database.types';

type TranslatableRecord = Product | Producer | Category;
type TableType = 'products' | 'producers' | 'categories';

export default function TranslationsManagementPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<TableType>('products');
  const [records, setRecords] = useState<TranslatableRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<TranslatableRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [translationStatus, setTranslationStatus] = useState<'all' | 'translated' | 'missing'>('all');
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TranslatableRecord | null>(null);

  // Load records based on active tab
  useEffect(() => {
    loadRecords();
  }, [activeTab]);

  // Filter records based on search and status
  useEffect(() => {
    let filtered = records;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((record) =>
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.description && record.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Translation status filter
    if (translationStatus !== 'all') {
      filtered = filtered.filter((record) => {
        const hasTranslations = record.translations && record.translations.length > 0;
        return translationStatus === 'translated' ? hasTranslations : !hasTranslations;
      });
    }

    setFilteredRecords(filtered);
  }, [records, searchTerm, translationStatus]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      let data: TranslatableRecord[] = [];
      
      switch (activeTab) {
        case 'products':
          data = await getProductsWithTranslations();
          break;
        case 'producers':
          data = await getProducersWithTranslations();
          break;
        case 'categories':
          data = await getCategoriesWithTranslations();
          break;
      }
      
      setRecords(data);
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTranslations = (record: TranslatableRecord) => {
    setSelectedRecord(record);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedRecord(null);
    // Reload records to reflect changes
    loadRecords();
  };

  const getTranslationStatus = (record: TranslatableRecord) => {
    if (!record.translations || record.translations.length === 0) {
      return { status: 'missing', color: 'error' as const, label: 'Nincs fordítás' };
    }
    
    const locales = new Set(record.translations.map(t => t.locale));
    const hasEnglish = locales.has('en');
    const hasGerman = locales.has('de');
    
    if (hasEnglish && hasGerman) {
      return { status: 'complete', color: 'success' as const, label: 'Teljes' };
    } else if (hasEnglish || hasGerman) {
      return { status: 'partial', color: 'warning' as const, label: 'Részleges' };
    } else {
      return { status: 'missing', color: 'error' as const, label: 'Nincs fordítás' };
    }
  };

  const tabs = [
    { key: 'products' as const, label: t('dashboard.products'), icon: '🛒' },
    { key: 'producers' as const, label: t('dashboard.producers'), icon: '👨‍🌾' },
    { key: 'categories' as const, label: t('categories.title'), icon: '📂' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LanguageIcon />
          {t('translations.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Termékek, termelők és kategóriák fordításainak kezelése
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'contained' : 'outlined'}
              onClick={() => setActiveTab(tab.key)}
              startIcon={<span>{tab.icon}</span>}
              sx={{ textTransform: 'none' }}
            >
              {tab.label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder={`Keresés ${activeTab} között...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Fordítás állapot</InputLabel>
              <Select
                value={translationStatus}
                onChange={(e) => setTranslationStatus(e.target.value as any)}
                label="Fordítás állapot"
              >
                <MenuItem value="all">Összes</MenuItem>
                <MenuItem value="translated">Lefordítva</MenuItem>
                <MenuItem value="missing">Fordítás hiányzik</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={loadRecords}
              disabled={loading}
            >
              Frissítés
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader
          title={`${tabs.find(t => t.key === activeTab)?.label} (${filteredRecords.length})`}
        />
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Név</TableCell>
                  <TableCell>Leírás</TableCell>
                  <TableCell>Fordítás állapot</TableCell>
                  <TableCell>Utolsó módosítás</TableCell>
                  <TableCell align="right">Műveletek</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      Betöltés...
                    </TableCell>
                  </TableRow>
                ) : filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      Nincs találat
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => {
                    const translationStatus = getTranslationStatus(record);
                    return (
                      <TableRow key={record.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {record.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              maxWidth: 200, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {record.description || 'Nincs leírás'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={translationStatus.label}
                            color={translationStatus.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(record.updated_at).toLocaleDateString('hu-HU')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditTranslations(record)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Edit Translation Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseEditDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {t('translations.editTranslations')}
        </DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <TranslationEditor
              recordId={selectedRecord.id}
              tableName={activeTab}
              record={selectedRecord}
              onSaved={handleCloseEditDialog}
              onCancel={handleCloseEditDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}