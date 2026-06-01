import { useAccountDetails } from "../../hooks/accountHooks";
import { useAuth } from "../../context/AuthContext";
import ProHomeFree from "./ProHomeFree";
import ProHomePremium from "./ProHomePremium";
import FullScreenLoader from "../../components/common/FullScreenLoader";

export default function ProHome() {
  const { user } = useAuth();
  const { data: accountDetails, isLoading: isLoadingAccountDetails } =
    useAccountDetails(user?.id || 0);

  if (isLoadingAccountDetails) {
    return <FullScreenLoader />;
  }

  if (accountDetails?.is_premium) {
    return <ProHomePremium />;
  }
  return <ProHomeFree />;
}
