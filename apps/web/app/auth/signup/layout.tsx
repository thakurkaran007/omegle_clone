const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="antialiased bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800 min-h-screen">
            {children}
        </div>
    );
};

export default AuthLayout;