"use client";

import type { IPostFilters } from 'src/types/blog';
import type { IArticleItem } from 'src/types/article';

import { orderBy } from 'es-toolkit';
import { useState, useCallback } from 'react';
import { useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { useArticles } from "src/contexts/articles-context";
import { POST_SORT_OPTIONS, POST_PUBLISH_OPTIONS_LABELS } from 'src/_mock';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PostSort } from '../post-sort';
import NewPostForm from './new-post-form';
import PostListHorizontal from '../post-list-horizontal';


export default function PostListView() {
    const { articles = [], loading, createArticle, updateArticle, deleteArticle, refetchArticles } = useArticles();

    const [sortBy, setSortBy] = useState('latest');
    const { state: filters, setState: setFilters } = useSetState<IPostFilters>({ publish: 'all' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<IArticleItem | undefined>(undefined);

    const dataFiltered = applyFilter({ inputData: articles, filters, sortBy });

    const handleFilterPublish = useCallback(
        (event: React.SyntheticEvent, newValue: string) => { setFilters({ publish: newValue }); },
        [setFilters]
    );

    const handleOpenCreateModal = () => {
        setSelectedPost(undefined);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (post: IArticleItem) => {
        setSelectedPost(post);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPost(undefined);
    };

    const handleSave = async (data: any, categoryIds: number[]) => {
        const { category, ...articleData } = data;
        try {
            if (selectedPost) {
                await updateArticle(selectedPost.id, articleData, categoryIds);
            } else {
                await createArticle(articleData, categoryIds);
            }
            await refetchArticles();
            handleCloseModal();
            toast.success(`A(z) ${data.title} bejegyzés sikeresen mentve.`);
        } catch (err) {
            // --- JAVÍTÁS ITT ---
            console.error("Mentési hiba:", err);
            // Típus-ellenőrzés a biztonságos hibakezeléshez
            if (err instanceof Error) {
                toast.error(`Hiba történt a mentés során: ${err.message}`);
            } else {
                toast.error('Ismeretlen hiba történt a mentés során.');
            }
        }
    };

    const handleDeletePost = async (postToDelete: IArticleItem) => {
        try {
            await deleteArticle(postToDelete.id);
            await refetchArticles();
            toast.warning(`A(z) ${postToDelete.title} bejegyzés sikeresen törölve.`);
        } catch (err) {
            // --- JAVÍTÁS ITT ---
            console.error("Törlési hiba:", err);
            // Típus-ellenőrzés a biztonságos hibakezeléshez
            if (err instanceof Error) {
                alert(`Hiba történt a törlés során: ${err.message}`);
            } else {
                alert('Ismeretlen hiba történt a törlés során.');
            }
        }
    };

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Hírek kezelése"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Hírek', href: paths.dashboard.post.root },
                    { name: 'Összes hír' },
                ]}
                action={
                    <Button onClick={handleOpenCreateModal} variant="contained" startIcon={<Iconify icon="mingcute:add-line" />}>
                        Új hír
                    </Button>
                }
                
            />

            <Box sx={{ gap: 3, display: 'flex', justifyContent: 'end', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-end', sm: 'center' } }}>
                <PostSort sort={sortBy} onSort={(newValue: string) => setSortBy(newValue)} sortOptions={POST_SORT_OPTIONS} />
            </Box>

            <Tabs value={filters.publish} onChange={handleFilterPublish} sx={{ mb: { xs: 3, md: 3 } }}>
                {['all', 'published', 'draft'].map((tab) => (
                    <Tab
                        key={tab}
                        iconPosition="end"
                        value={tab}
                        label={POST_PUBLISH_OPTIONS_LABELS.find(label => label.value === tab)?.label}
                        icon={
                            <Label
                                variant={((tab === 'all' || tab === filters.publish) && 'filled') || 'soft'}
                                color={(tab === 'published' && 'info') || 'default'}
                            >
                                {tab === 'all' && articles.length}
                                {tab === 'published' && articles.filter((post) => post.publish === 'published').length}
                                {tab === 'draft' && articles.filter((post) => post.publish === 'draft').length}
                            </Label>
                        }
                        sx={{ textTransform: 'capitalize' }}
                    />
                ))}
            </Tabs>

            {loading && <p>Betöltés...</p>}
            {!loading && <PostListHorizontal posts={dataFiltered} onEditPost={handleOpenEditModal} onDeletePost={handleDeletePost} />}

            <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
                <NewPostForm
                    currentPost={selectedPost}
                    onSave={handleSave}
                    onCancel={handleCloseModal}
                />
            </Dialog>
        </DashboardContent>
    );
}


type ApplyFilterProps = {
    inputData: IArticleItem[];
    filters: IPostFilters;
    sortBy: string;
};

function applyFilter({ inputData, filters, sortBy }: ApplyFilterProps): IArticleItem[] {
    if (!inputData) {
        return [];
    }
    const { publish } = filters;
    let filteredData = [...inputData];
    if (sortBy === 'latest') {
        filteredData = orderBy(filteredData, ['publish_date'], ['desc']);
    }
    if (sortBy === 'oldest') {
        filteredData = orderBy(filteredData, ['publish_date'], ['asc']);
    }
    if (publish !== 'all') {
        filteredData = filteredData.filter((post) => post.publish === publish);
    }
    return filteredData;
}
