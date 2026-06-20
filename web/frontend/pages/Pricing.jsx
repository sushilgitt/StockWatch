import React, { useState, useEffect } from "react";
import "./Pricing.css";

function Pricing() {
    const [store, setStoreName] = useState(null);
    const [customPrice, setCustomPrice] = useState("");
    const [showCustomInput, setShowCustomInput] = useState(false);

    const packages = [
        { name: "Bronze", price: 100 },
        { name: "Silver", price: 300 }, 
        { name: "Gold", price: 500 },
    ];

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

    const handleCreateCustomPackage = async () => {
        if (!customPrice || isNaN(customPrice) || customPrice <= 0) {
            alert("Please enter a valid price amount.");
            return;
        }

        const data = {
            name: "Custom",
            price: parseFloat(customPrice),
            retrun_url: `https://${store?.domain}/admin/apps/50754b8055961b1fbd50d8fc05fe9ba4`,
        };

        try {
            const response = await fetch("/api/userPay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await response.json();

            if (response.ok) {
                window.open(result.confirmation_url);
                setShowCustomInput(false);
                setCustomPrice("");
            } else {
                console.error("Failed to create custom plan", result);
            }
        } catch (error) {
            console.error("Custom package error", error);
        }
    };

    const storehandle = store?.domain ? store.domain.split(".")[0] : "your-store";

    return (
        <div className="pricing-container">
            <h1 className="pricing-title">Pricing Plans for {storehandle}</h1>

            <div className="pricing-grid">
                {packages.map((pkg, index) => (
                    <div className="pricing-card" key={index}>
                        <h2 className="plan-name">{pkg.name}</h2>
                        <p className="plan-price">${pkg.price}</p>
                        <button
                            onClick={() =>
                                window.open(
                                    `https://admin.shopify.com/store/${storehandle}/charges/stockmail/pricing_plans`
                                )
                            }
                            className="choose-btn"
                        >
                            Choose Plan
                        </button>
                    </div>
                ))}

                {/* ✅ Custom Plan Box */}
                {/* <div className="pricing-card custom-card">
                    <h2 className="plan-name">Custom Plan</h2>
                    <p className="custom-subtext">
                        Enter your desired price and subscribe instantly.
                    </p>

                    {showCustomInput ? (
                        <>
                            <input
                                type="number"
                                placeholder="Enter custom price"
                                className="custom-input"
                                value={customPrice}
                                onChange={(e) => setCustomPrice(e.target.value)}
                            />
                            <button
                                onClick={handleCreateCustomPackage}
                                className="choose-btn"
                            >
                                Confirm Plan
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setShowCustomInput(true)}
                            className="choose-btn"
                        >
                            Custom Plan
                        </button>
                    )}
                </div> */}
                
            </div>
        </div>
    );
}

export default Pricing;
