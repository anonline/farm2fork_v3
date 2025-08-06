import type { IArticleItem } from 'src/types/article';

import { Grid } from '@mui/material';

import { paths } from 'src/routes/paths';

import { PostItemHorizontal } from './post-item-horizontal';

interface Props {
  posts: IArticleItem[];
  onEditPost: (post: IArticleItem) => void;
}

export default function PostListHorizontal({ posts, onEditPost }: Readonly<{ posts: IArticleItem[], onEditPost: (post: IArticleItem) => void }>) {
  return (
    <Grid container spacing={3}>
      {posts.map((post) => (
        <Grid size={{xs:12, md:6,}} key={post.id}>
          <PostItemHorizontal
            post={post}
            detailsHref={paths.dashboard.post.details(post.title)}
            onEdit={() => onEditPost(post)}
          />
        </Grid>
      ))}
    </Grid>
  );
}