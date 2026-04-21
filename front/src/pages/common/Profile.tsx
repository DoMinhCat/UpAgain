import { useAuth } from "../../context/AuthContext";
import GuestHome from "../guest/GuestHome";
import UserProfilePage from "../user/UserProfilePage";

const Profile = () => {
  const { user } = useAuth();

  // Redirect unauthenticated users
  if (!user) {
    return <GuestHome />;
  } else {
    // Render component based on role
    switch (user.role) {
      // TODO:
      // case "pro":
      //   return <ProProfilePage />;
      // case "admin":
      //   return <AdminProfilePage />;
      case "user":
        return <UserProfilePage />;
      default:
        return <GuestHome />;
    }
  }
};

export default Profile;
