import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";

interface RoomCardProps {
  slug: string;
  name: string;
  imageUrl: string;
}

const RoomCard = ({ slug, name, imageUrl }: RoomCardProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-40 w-full">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        <p className="absolute bottom-3 left-3 text-sm font-semibold text-white">
          {name}
        </p>
      </div>
      <CardFooter className="pt-3">
        <Button asChild className="w-full">
          <Link href={`/rooms/${slug}`}>Reservar</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RoomCard;
