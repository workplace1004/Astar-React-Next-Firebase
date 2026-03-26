import { Link, useLocation } from "react-router-dom";
import { LANDING_SUBSCRIBE_SECTION_ID, scrollToLandingSubscribeSection } from "@/lib/landingAnchors";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  children: React.ReactNode;
};

/**
 * En Inicio hace scroll suave a #subscribesection; desde otras rutas navega a /#subscribesection.
 */
export default function LandingSubscribeSectionLink({ className, children }: Props) {
  const { pathname } = useLocation();

  if (pathname === "/") {
    return (
      <a
        href={`#${LANDING_SUBSCRIBE_SECTION_ID}`}
        className={cn(className)}
        onClick={(e) => {
          e.preventDefault();
          scrollToLandingSubscribeSection();
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={{ pathname: "/", hash: LANDING_SUBSCRIBE_SECTION_ID }} className={className}>
      {children}
    </Link>
  );
}
