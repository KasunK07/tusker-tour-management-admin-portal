import {
  HomeIcon,
  UserCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, ManagePackages, FetchDayTours } from "@/pages/dashboard";
import { SignIn } from "@/pages/auth";
import { PhotoIcon, CubeIcon, DocumentTextIcon} from "@heroicons/react/24/outline";


const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "Customer Inquries",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Manage Profile",
        path: "/profile",
        element: <Profile />,
      },
      {
        icon: <CubeIcon {...icon} />,
        name: "Manage Packages",
        path: "/managePackages",
        element: <ManagePackages />,
      },
      {
        icon: <DocumentTextIcon {...icon} />,
        name: "Day Tours & Destinations",
        path: "/fetchDayTours",
        element: <FetchDayTours />,
      },
    ],
  },
  // {
  //   title: "auth pages",
  //   layout: "auth",
  //   pages: [
  //     {
  //       icon: <ServerStackIcon {...icon} />,
  //       name: "sign in",
  //       path: "/sign-in",
  //       element: <SignIn />,
  //     },
  //   ],
  // },
];

export default routes;
