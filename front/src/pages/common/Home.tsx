// src/pages/Home.tsx
// import AdminHome from "./admin/AdminHome";
// import ProHome from "./ProHome";
// import UserHome from "./UserHome";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import GuestHome from "../guest/GuestHome";

const Home = () => {
  const { user } = useAuth();

  // Redirect unauthenticated users
  if (!user) {
    return <GuestHome />;
  } else {
    // Render component based on role
    switch (user.role) {
      // admin can move freely between admin space and user space
      // TODO: add other home page for each role
      // case "pro":
      //   return <ProHome />;
      // case "user":
      //   return <UserHome />;
      default:
        // return <GuestHome />;

        // temporary
        return <GuestHome />;
    }
  }
};

export default Home;
