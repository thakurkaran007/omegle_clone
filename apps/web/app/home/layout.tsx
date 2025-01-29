import { AppBar } from "./_components/AppBar";

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <AppBar/>
            {children}
        </div>
    );
};

export default HomeLayout;
