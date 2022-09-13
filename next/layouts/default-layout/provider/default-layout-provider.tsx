import { createContext, useContext, useEffect, useState } from "react";
import { useInterval } from "../../../lib/hooks/useInterval";
var didScroll;
var lastScrollTop = 0;
var delta = 50;
export const DefaultLayoutContext = createContext<
  Partial<{
    showAndHiddenSearch: boolean;
  }>
>({});
export function DefaulLayoutProvider(props) {
  const [showAndHiddenSearch, setShowAndHiddenSearch] = useState<boolean>(true);

  // const hasScrolled = () => {
  //   const st = window.pageYOffset || document.documentElement.scrollTop;
  //   // Make sure they scroll more than delta
  //   if (Math.abs(lastScrollTop - st) <= delta)
  //     return;
  //   if (st > lastScrollTop) {
  //     // Scroll Down
  //     setShowAndHiddenSearch(false);
  //   } else {
  //     // Scroll Up
  //     if (st + window.innerHeight < document.body.scrollHeight) {
  //       setShowAndHiddenSearch(true);

  //     }
  //   }
  //   lastScrollTop = st;
  // }
  // useEffect(() => {
  //   window.addEventListener('scroll', function () {
  //     didScroll = true;
  //   });
  //   return () => {
  //     window.removeEventListener('scroll', function () {
  //       didScroll = true;
  //     });
  //   }

  // }, []);


  // useInterval(() => {
  //   if (didScroll) {
  //     hasScrolled();
  //     didScroll = false;
  //   }
  // }, 350);

  // cach 2

  const threshold = 100;

  useEffect(() => {
    let previousScrollYPosition = window.scrollY;

    const scrolledMoreThanThreshold = (currentScrollYPosition: number) =>
      Math.abs(currentScrollYPosition - previousScrollYPosition) > threshold;

    const isScrollingUp = (currentScrollYPosition: number) =>
      currentScrollYPosition > previousScrollYPosition &&
      !(previousScrollYPosition > 0 && currentScrollYPosition === 0) &&
      !(currentScrollYPosition > 0 && previousScrollYPosition === 0);

    const updateScrollDirection = () => {
      const currentScrollYPosition = window.scrollY;

      if (scrolledMoreThanThreshold(currentScrollYPosition)) {
        const newScrollDirection = isScrollingUp(currentScrollYPosition)
          ? false
          : true;
        setShowAndHiddenSearch(newScrollDirection);
        previousScrollYPosition =
          currentScrollYPosition > 0 ? currentScrollYPosition : 0;
      }
    };

    const onScroll = () => window.requestAnimationFrame(updateScrollDirection);

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <DefaultLayoutContext.Provider value={{
    showAndHiddenSearch: showAndHiddenSearch,
  }}>{props.children}</DefaultLayoutContext.Provider>;
}
export const useDefaultLayoutContext = () => useContext(DefaultLayoutContext);
