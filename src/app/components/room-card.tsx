import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RoomCardProps {
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
}

const RoomCard = ({ slug, name, description, imageUrl }: RoomCardProps) => {
  return (
    <Card>
      <Image
        src={imageUrl}
        alt={name}
        width={0}
        height={0}
        sizes="100vw"
        className="h-40 w-full object-cover"
      />
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/rooms/${slug}`}>Reservar</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RoomCard;
