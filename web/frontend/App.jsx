import { BrowserRouter, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";

import { QueryProvider, PolarisProvider } from "./components";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import { useEffect, useState } from "react";
import Payment from "./pages/Payment";

// Subscription gate. When false, the app requires an ACTIVE subscription (the
// $15/month Billing API charge created in Payment.jsx -> /api/createSubscription,
// which uses test mode so it never bills real money during testing).
// Set to true to bypass the gate entirely while developing other features.
const BYPASS_BILLING = false;

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });
  const { t } = useTranslation();


  const [loading, setLoading] = useState(true);
  const [isActivePlan, setIsActivePlan] = useState(false);

  const getPayment = async () => {
    try {
      const response = await fetch("/api/getPayment");
      const data = await response.json();

      console.log("Payment data", data);

      if (
        data?.data?.length > 0 &&
        data.data[0].status === "ACTIVE"
      ) {
        setIsActivePlan(true);
      } else {
        setIsActivePlan(false);
      }
    } catch (error) {
      console.error(error);
      setIsActivePlan(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPayment();
  }, []);

  if (loading) return null;


  return (
    <PolarisProvider>
      <BrowserRouter>
        <QueryProvider>

          {!isActivePlan && !BYPASS_BILLING ? (
            <>
              <Payment />
            </>
          ) : (
            <>
              <NavMenu>
                <Link to="/" rel="home" />
                <Link to="/Settings">SETTINGS</Link>
                <Link to="/Payment">Payment</Link>
              </NavMenu>

              <Routes pages={pages} />
            </>
          )}

        </QueryProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
