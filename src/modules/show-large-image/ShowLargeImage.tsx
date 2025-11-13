import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@mui/material';

// Components
import ImagesCarousel from '../../components/images-carousel/ImagesCarousel';

interface ShowLargeImageProps {
  open: boolean;
  onClose: () => void;
  plate: string;
  images: { name: string; url: string; className?: string }[];
}

const ShowLargeImage: React.FC<ShowLargeImageProps> = ({
  open,
  onClose,
  plate,
  images,
}) => {
  return (
    <Dialog
      id="show-large-image"
      open={open}
      onClose={onClose}
      keepMounted
      maxWidth={false}
      fullWidth
      slotProps={{
        paper: {
          style: { 
            backgroundColor: 'transparent', 
            boxShadow: 'none',
            margin: 0,
            maxWidth: '100vw',
            maxHeight: '100vh',
          },
        },
        backdrop: {
          style: { backgroundColor: 'rgba(0, 0, 0, 0.6)' }
        },
      }}
    >
      <DialogContent
        className="relative flex items-center justify-center min-h-screen p-0"
        onClick={onClose}
        style={{ margin: 0, padding: 0 }}
      >
        <div
          className="m-4"
          onClick={(e) => e.stopPropagation()}
        >
          <ImagesCarousel plate={plate} images={images} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShowLargeImage;
