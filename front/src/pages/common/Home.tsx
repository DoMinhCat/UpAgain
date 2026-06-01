import { useAuth } from "../../context/AuthContext";
import GuestHome from "../guest/GuestHome";
import EmployeeHome from "../home/EmployeeHome";
import ProHome from "../home/ProHome";
import UserHome from "../home/UserHome";

const Home = () => {
  const { user } = useAuth();

  // Redirect unauthenticated users
  if (!user) {
    return <GuestHome />;
  } else {
    // Render component based on role
    switch (user.role) {
      case "pro":
        return <ProHome />;
      case "user":
        return <UserHome />;
      case "employee":
        return <EmployeeHome />;
      case "admin":
        return <GuestHome />;
      default:
        return <GuestHome />;
    }
  }
};

export default Home;
