import { headers } from "next/headers";
import { redirect } from "next/navigation";

import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { getRooms } from "@/db/queries";
import { auth } from "@/lib/auth";

import RoomsList from "./components/rooms-list";

const Home = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/authentication");

  const rooms = await getRooms();

  return (
    <>
      <Header />

      <div className="space-y-6 pb-6">
        <section className="px-5">
          <h2 className="mb-4 text-lg font-semibold">Espaços disponíveis</h2>
          <RoomsList rooms={rooms} />
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Home;
