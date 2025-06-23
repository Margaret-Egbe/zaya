import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";

type Props = {
 children: React.ReactNode;
 showHero?: boolean;
};

const Layout = ({ children, showHero = false }: Props) =>{
   return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F5]">
        <Header/>
        {showHero &&  <Hero />}
        <div className="flex-1 ">{children}</div>
        <Footer />
    </div>
   );
};

export default Layout;
