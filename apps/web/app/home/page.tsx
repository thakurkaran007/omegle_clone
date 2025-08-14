import { auth } from "@/auth";
import Room from "./_components/Room";

const HomePage = async () => {
    const user = await auth();
    return (
        <Room user={user} />
    );
};

export default HomePage;
