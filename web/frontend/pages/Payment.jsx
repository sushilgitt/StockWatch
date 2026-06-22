import React, { useEffect, useState } from "react";
import "./Payment.css";

function Payment() {
    const [store, setStoreName] = useState(null);

    const getStore = async () => {
        try {
            const response = await fetch("/api/get-store");
            const data = await response.json();
            setStoreName(data);
            console.log("Store info:", data);
        } catch (error) {
            console.error("Error fetching store info:", error);
        }
    };

    useEffect(() => {
        getStore();
    }, []);

    const [activating, setActivating] = useState(false);

    // Create a $15/month recurring charge via the Billing API and send the
    // merchant to Shopify's confirmation page to approve it.
    const handleActivate = async () => {
        try {
            setActivating(true);
            const response = await fetch("/api/createSubscription", {
                method: "POST",
            });
            const data = await response.json();
            if (data?.success && data?.confirmationUrl) {
                // Top-level redirect so it breaks out of the embedded iframe.
                window.open(data.confirmationUrl, "_top");
            } else {
                console.error("Failed to create subscription:", data);
                setActivating(false);
            }
        } catch (error) {
            console.error("Error creating subscription:", error);
            setActivating(false);
        }
    };


    return (
        <div className="payment-container">
            <div className="payment-wrapper">

                <h1 className="payment-title">Choose Your Plan</h1>
                <p className="payment-subtitle">
                    Activate your subscription to start using the app
                </p>

                <div className="pricing-card">

                    <div className="plan-name">
                        Premium Plan
                    </div>

                    <div className="plan-price">
                        $15
                        <span>/month</span>
                    </div>

                    {/* <ul className="plan-features">
                        <li>✔ Unlimited Order Exports</li>
                        <li>✔ CSV Automation</li>
                        <li>✔ Shopify Store Integration</li>
                        <li>✔ Priority Support</li>
                    </ul> */}

                    <button
                        className="payment-btn"
                        onClick={handleActivate}
                        disabled={activating}
                    >
                        {activating ? "Redirecting..." : "Activate Plan"}
                    </button>

                </div>

            </div>
        </div>
    );
}

export default Payment;