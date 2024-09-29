import { hideNavbarPaths } from "./config";

export const shouldHideNavbar = (pathname) => {
  return hideNavbarPaths.some((path) => {
    const regex = new RegExp(`^${path.replace(/:\w+/g, "[^/]+")}$`);
    return regex.test(pathname);
  });
};
