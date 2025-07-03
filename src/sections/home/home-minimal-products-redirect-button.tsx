import { Box, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { paths } from 'src/routes/paths';

export default function HomeMinimalProductsRedirectButton() {
  const router = useRouter();
  const handleRedirect = () => {
    router.push(paths.product.root);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
      <Button
        variant="outlined"
        onClick={handleRedirect}
        sx={{
          paddingY: "10px",
          paddingX: "16px",
          lineHeight: "20px",
          fontSize: "16px",
          borderRadius: "8px",
          border: "2px solid black",
          color: 'black',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.3s ease-in-out',

          '&:hover': {
            backgroundColor: 'rgb(70, 110, 80)',
            color: 'white',
            border: '2px solid rgb(70, 110, 80)',
          },
        }}
      >
        Összes termék
      </Button>
    </Box>
  );
}
