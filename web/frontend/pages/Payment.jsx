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

    const storehandle = store?.domain ? store.domain.split(".")[0] : "your-store";

    // https://admin.shopify.com/store/comodo24-2/charges/comodo24-2/pricing_plans


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
                        $150
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
                        onClick={() =>
                            window.open(
                                `https://admin.shopify.com/store/${storehandle}/charges/shopping-89/pricing_plans`
                            )
                        }
                    >
                        Activate Plan
                    </button>

                </div>

            </div>
        </div>
    );
}

export default Payment;