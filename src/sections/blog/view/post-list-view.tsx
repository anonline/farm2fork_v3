"use client";

import type { IPostFilters } from 'src/types/blog';
import type { IArticleItem } from 'src/types/article';

// Szükséges importok a szűréshez és rendezéshez
import { orderBy } from 'es-toolkit';
import { useState, useCallback } from 'react';
import { useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';

import { POST_PUBLISH_OPTIONS_LABELS, POST_SORT_OPTIONS } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import { useArticles } from "src/contexts/articles-context";

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PostSort } from '../post-sort';
import NewPostForm from './new-post-form';
import { PostSearch } from '../post-search';
import PostListHorizontal from '../post-list-horizontal';


type NewPostFormData = {
    title: string;
    year: string;
    medium: string;
    link: string;
    image: string;
    publish_date: string;
    publish: boolean;
    categoryId: number;
};



export default function PostListView() {
    const { articles, loading, createArticle, updateArticle } = useArticles();

    const [sortBy, setSortBy] = useState('latest');
    const { state: filters, setState: setFilters } = useSetState<IPostFilters>({ publish: 'all' });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<IArticleItem | null>(null);

    const dataFiltered = applyFilter({ inputData: articles, filters, sortBy });

    const handleFilterPublish = useCallback(
        (event: React.SyntheticEvent, newValue: string) => {
            setFilters({ publish: newValue });
        },
        [setFilters]
    );

    const handleOpenCreateModal = () => {
        setSelectedPost(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (post: IArticleItem) => {
        setSelectedPost(post);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPost(null);
    };

    const handleSave = (data: any, categoryId: number | undefined) => {
        if (typeof categoryId !== 'number' || categoryId <= 0) {
            alert("Hiba: Kérlek, válassz egy érvényes kategóriát!");
            return;
        }

        const { category, ...articleData } = data;

        if (selectedPost) {
            updateArticle(selectedPost.id ?? 0, articleData, categoryId);
        } else {
            createArticle(articleData, categoryId);
        }

        
        handleCloseModal();
    };

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="List"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Hírek', href: paths.dashboard.post.root },
                    { name: 'Összes' },
                ]}
                action={
                    <Button
                        onClick={handleOpenCreateModal}
                        variant="contained"
                        startIcon={<Iconify icon="mingcute:add-line" />}
                    >
                        Új hír hozzáadása
                    </Button>
                }
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <Box
                sx={{
                    gap: 3,
                    display: 'flex',
                    mb: { xs: 3, md: 5 },
                    justifyContent: 'space-between',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-end', sm: 'center' },
                }}
            >
                <PostSearch redirectPath={(title: string) => paths.dashboard.post.details(title)} />
                <PostSort
                    sort={sortBy}
                    onSort={(newValue: string) => setSortBy(newValue)}
                    sortOptions={POST_SORT_OPTIONS}
                />
            </Box>

            <Tabs
                value={filters.publish}
                onChange={handleFilterPublish}
                sx={{ mb: { xs: 3, md: 5 } }}
            >
                {['all', 'published', 'draft'].map((tab) => (
                    <Tab
                        key={tab}
                        iconPosition="end"
                        value={tab}
                        label={POST_PUBLISH_OPTIONS_LABELS.find((label) => label.value === tab)?.label || 'N/A'}
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

            {!loading && <PostListHorizontal posts={dataFiltered} onEditPost={handleOpenEditModal} />}

            <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
                <NewPostForm
                    currentPost={selectedPost}
                    onSave={handleSave}
                    onCancel={handleCloseModal}
                />
            </Dialog>
        </DashboardContent>
    );
};

type ApplyFilterProps = {
    inputData: IArticleItem[];
    filters: IPostFilters;
    sortBy: string;
};

function applyFilter({ inputData, filters, sortBy }: ApplyFilterProps) {
    const { publish } = filters;

    if (sortBy === 'latest') {
        inputData = orderBy(inputData, ['publish_date'], ['desc']);
    }

    if (sortBy === 'oldest') {
        inputData = orderBy(inputData, ['publish_date'], ['asc']);
    }

    if (publish !== 'all') {
        inputData = inputData.filter((post) => post.publish === publish);
    }

    return inputData;
}