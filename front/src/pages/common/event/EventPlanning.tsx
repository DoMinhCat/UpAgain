import { useAuth } from "../../../context/AuthContext";
import { UnauthorizedPage } from "../../error/403";
import { NotFoundPage } from "../../error/404";
import EmployeeEventsPlanning from "./EmployeeEventsPlanning";
import UpcomingEventsPage from "./UpcomingEventsPage";

const Home = () => {
  const { user } = useAuth();

  // Redirect unauthenticated users
  if (!user) {
    return <UnauthorizedPage />;
  } else {
    // Render component based on role
    switch (user.role) {
      // admin does not have event planning page (only employee host events)
      case "employee":
        return <EmployeeEventsPlanning />;
      case "pro":
        return <UpcomingEventsPage />;
      case "user":
        return <UpcomingEventsPage />;
      default:
        return <NotFoundPage />;
    }
  }
};

export default Home;
