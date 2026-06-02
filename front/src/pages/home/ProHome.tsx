import { useAccountDetails } from "../../hooks/accountHooks";
import { useAuth } from "../../context/AuthContext";
import ProHomeFree from "./ProHomeFree";
import ProHomePremium from "./ProHomePremium";
import FullScreenSkeleton from "../../components/common/FullScreenSkeleton";

export default function ProHome() {
  const { user } = useAuth();
  const { data: accountDetails, isLoading: isLoadingAccountDetails } =
    useAccountDetails(user?.id || 0);

  if (isLoadingAccountDetails) {
    return <FullScreenSkeleton />;
  }

  if (accountDetails?.is_premium) {
    return <ProHomePremium />;
  }
  return <ProHomeFree />;
}
