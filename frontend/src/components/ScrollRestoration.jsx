import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollRestoration() {
  const { pathname } = useLocation();

  useEffect(() => {
    const savedPosition = sessionStorage.getItem(
      `scroll-position-${pathname}`
    );

    if (savedPosition) {
      const position = parseInt(savedPosition, 10);

      setTimeout(() => {
        window.scrollTo(0, position);
      }, 0);
    } else {
      window.scrollTo(0, 0);
    }

    const saveScrollPosition = () => {
      sessionStorage.setItem(
        `scroll-position-${pathname}`,
        window.scrollY.toString()
      );
    };

    window.addEventListener("scroll", saveScrollPosition);

    return () => {
      saveScrollPosition();
      window.removeEventListener(
        "scroll",
        saveScrollPosition
      );
    };
  }, [pathname]);

  return null;
}

export default ScrollRestoration;