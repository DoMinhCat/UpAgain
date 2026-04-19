// src/pages/Home.tsx
// import AdminHome from "./admin/AdminHome";
// import ProHome from "./ProHome";
// import UserHome from "./UserHome";
import { useAuth } from "../../context/AuthContext";
import GuestHome from "../guest/GuestHome";
import UserHome from "../user/UserHome";

const Home = () => {
  const { user } = useAuth();

  // Redirect unauthenticated users
  if (!user) {
    return <GuestHome />;
  } else {
    // Render component based on role
    switch (user.role) {
      // admin can move freely between admin space and user space

      // TODO:
      // case "pro":
      //   return <ProHome />;
      case "user":
        return <UserHome />;
      default:
        return <GuestHome />;
    }
  }
};

export default Home;
