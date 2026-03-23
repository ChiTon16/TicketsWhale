import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import FeaturedMatchesSection from "@/components/sections/FeaturedMatchesSection";
import LeaguesSection from "@/components/sections/LeaguesSection";
import NewsletterSection from "@/components/sections/NewsletterSection";

const HomePage: React.FC = () => (
    <div className="bg-background text-on-background antialiased">
        <Navbar />
        <main>
            <HeroSection />
            <FeaturedMatchesSection />
            <LeaguesSection />
            <NewsletterSection />
        </main>
        <Footer />
    </div>
);

export default HomePage;