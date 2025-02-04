import { AppBar } from "./_components/AppBar";

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
    return (
            <div className="h-screen w-full overflow-hidden">
                <AppBar />
                {children}
            </div>
    );
};

export default HomeLayout;
