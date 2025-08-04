'use client';

import type { IPostFilters } from 'src/types/blog';
import type { IArticleItem } from 'src/types/article';

import { orderBy } from 'es-toolkit';
import { useState, useCallback } from 'react';
import { useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { Dialog } from '@mui/material';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';

import { POST_SORT_OPTIONS } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import { useArticles } from "src/contexts/articles-context";

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PostSort } from '../post-sort';
import NewPostForm from './new-post-form';
import { PostSearch } from '../post-search';
import { PostListHorizontal } from '../post-list-horizontal';
// ----------------------------------------------------------------------

interface INewPostData {
    title: string;
    year: string;
    medium: string;
    link: string;
    image: string;
    publish_date: string; 
    publish: string;      
}


export function PostListView() {
    const { articles: posts, loading: postsLoading } = useArticles();
    const [sortBy, setSortBy] = useState('latest');
    const { state, setState } = useSetState<IPostFilters>({ publish: 'all' });

    const [isModalOpen, setIsModalOpen] = useState(false);

    const dataFiltered = applyFilter({ inputData: posts, filters: state, sortBy });

    const handleFilterPublish = useCallback(
        (event: React.SyntheticEvent, newValue: string) => {
            setState({ publish: newValue });
        },
        [setState]
    );

    const handleSaveNewPost = (newPost: INewPostData) => {
        console.log('Saving new post:', newPost);
        setIsModalOpen(false);
    };


    return (
        <>
            <DashboardContent>
                <CustomBreadcrumbs
                    heading="List"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Blog', href: paths.dashboard.post.root },
                        { name: 'List' },
                    ]}
                    action={
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            variant="contained"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                        >
                            New post
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
                    value={state.publish}
                    onChange={handleFilterPublish}
                    sx={{ mb: { xs: 3, md: 5 } }}
                >
                    {['all', 'published', 'draft'].map((tab) => (
                        <Tab
                            key={tab}
                            iconPosition="end"
                            value={tab}
                            label={tab}
                            icon={
                                <Label
                                    variant={
                                        ((tab === 'all' || tab === state.publish) && 'filled') || 'soft'
                                    }
                                    color={(tab === 'published' && 'info') || 'default'}
                                >
                                    {tab === 'all' && posts.length}
                                    {tab === 'published' &&
                                        posts.filter((post) => post.publish === 'published').length}
                                    {tab === 'draft' &&
                                        posts.filter((post) => post.publish === 'draft').length}
                                </Label>
                            }
                            sx={{ textTransform: 'capitalize' }}
                        />
                    ))}
                </Tabs>

                <PostListHorizontal posts={dataFiltered} loading={postsLoading} />
            </DashboardContent>

            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} fullWidth maxWidth="sm">
                <NewPostForm
                    onSave={handleSaveNewPost}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Dialog>
        </>
    );
}


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