/** Ancla de la sección de planes en la landing (Inicio). */
export const LANDING_SUBSCRIBE_SECTION_ID = "subscribesection";

export function scrollToLandingSubscribeSection() {
  document.getElementById(LANDING_SUBSCRIBE_SECTION_ID)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

/** Sección «De abordar la astrología» en /about (id en el DOM). */
export const ABOUT_ENFOQUE_SECTION_ID = "enfoque";

export function scrollToAboutEnfoqueSection() {
  document.getElementById(ABOUT_ENFOQUE_SECTION_ID)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}
