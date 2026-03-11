import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { to: "/", label: "Preview Carta", hash: "#preview-carta" },
  { to: "/about", label: "Sobre Nosotros" },
  { to: "/manifesto", label: "Manifiesto" },
  { to: "/blog", label: "Blog" },
  { to: "/how-it-works", label: "Cómo Funciona" },
  { to: "/portal-preview", label: "Portal" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const { resolvedTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const logoSrc = resolvedTheme === "light" ? "/3SIN%20FONDO/logooriginal.png" : "/3SIN%20FONDO/logoblanco.png";

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate(isAdmin ? "/admin" : "/portal");
    } else {
      navigate("/login");
    }
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-background/70 backdrop-blur-2xl border-b border-border/30"
      >
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={logoSrc} alt="Astar" className="h-9 w-auto" />
          <span className="font-serif text-2xl tracking-[0.2em] text-gradient-gold font-semibold sr-only">ASTAR</span>
        </Link>
        <div className="hidden lg:flex items-center gap-6 text-sm tracking-wide">
          {navLinks.map((link) => (
            "hash" in link && link.hash ? (
              <a
                key={link.to + link.hash}
                href={link.to + link.hash}
                onClick={(e) => {
                  if (window.location.pathname === link.to) {
                    e.preventDefault();
                    document.getElementById(link.hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="relative text-muted-foreground hover:text-foreground transition-colors after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-px after:bottom-[-4px] after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.to}
                to={link.to}
                className="relative text-muted-foreground hover:text-foreground transition-colors after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-px after:bottom-[-4px] after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
              >
                {link.label}
              </Link>
            )
          ))}
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={handleCTA}
            className="hidden md:block text-sm px-5 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 tracking-wide premium-shadow"
          >
            {isAuthenticated ? "Mi Portal" : "Comenzar"}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 text-muted-foreground hover:text-foreground">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-[73px] left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/30 p-6 lg:hidden"
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              "hash" in link && link.hash ? (
                <a
                  key={link.to + link.hash}
                  href={link.to + link.hash}
                  onClick={(e) => {
                    setMenuOpen(false);
                    if (window.location.pathname === link.to) {
                      e.preventDefault();
                      document.getElementById(link.hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm py-2"
                >
                  {link.label}
                </a>
              ) : (
                <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors text-sm py-2">
                  {link.label}
                </Link>
              )
            ))}
            <button onClick={() => { handleCTA(); setMenuOpen(false); }} className="text-sm px-5 py-2.5 rounded-full shimmer-gold text-primary-foreground font-medium tracking-wide mt-2">
              {isAuthenticated ? "Mi Portal" : "Comenzar"}
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default Navbar;
