import React from 'react';
import { Card, CardContent } from '../ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';

interface ImagesCarouselProps {
  plate: string;
  images: { name: string; url: string; className?: string }[];
}

const ImagesCarousel: React.FC<ImagesCarouselProps> = ({ plate, images }) => {
  return (
    <Carousel
      className="w-full max-w-[800px] text-white"
      opts={{
        align: 'start',
        loop: true,
      }}
    >
      <CarouselContent className="w-ful">
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <Card className="bg-black">
              <CardContent className="relative flex flex-col items-center justify-center p-1 w-[800px]">
                <img
                  src={image.url}
                  alt={image.name}
                  className={`${image.className} w-[700px] h-[500px] object-contain`}
                />
                <p className="text-white text-[30px] font-semibold px-4 py-1 rounded">
                  {plate}
                </p>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className='hover:bg-slate-800' />
      <CarouselNext className='hover:bg-slate-800' />
    </Carousel>
  );
};

export default ImagesCarousel;
