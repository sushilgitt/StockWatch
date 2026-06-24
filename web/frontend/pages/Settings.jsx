import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Page,
    AlphaCard,
    Layout,
    TextField,
    Text,
    ChoiceList,
    Button,
    HorizontalStack,
    VerticalStack,
    Banner,
    Divider,
    Box,
    Icon,
    Spinner
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { EmailMajor } from '@shopify/polaris-icons';

export default function Settings() {
    const navigate = useNavigate();
    const [threshold, setThreshold] = useState(10);
    const [notificationMethods, setNotificationMethods] = useState(['email']);
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [store, setStore] = useState({});
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch store data and existing threshold settings
    const getStore = async () => {
        try {
            const response = await fetch('/api/get-store');
            const data = await response.json();
            console.log("Store Data", data);
            setStore(data);

            // Fetch existing threshold settings for this store
            await getThresholdSettings(data.Store_Id);
        } catch (error) {
            console.error('Error fetching store info:', error);
        }
    };

    // Fetch existing threshold settings
    const getThresholdSettings = async (storeId) => {
        try {
            const response = await fetch(`/api/thresholds/${storeId}`);
            if (response.ok) {
                const thresholdData = await response.json();
                if (thresholdData.success && thresholdData.data) {
                    // Populate form with existing settings
                    setThreshold(thresholdData.data.thresholdValue);
                    setEmail(thresholdData.data.email);
                    setNotificationMethods(['email']); // Default to email since it's required
                }
            }
        } catch (error) {
            console.error('Error fetching threshold settings:', error);
        }
    };

    // Save threshold settings
    const saveThresholdSettings = async () => {
        setLoading(true);
        setError('');

        try {
            const thresholdData = {
                thresholdValue: parseInt(threshold),
                Store_Id: store.Store_Id,
                domain: store.domain,
                email: email
            };

            const response = await fetch('/api/create-update-threshold', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(thresholdData)
            });

            const result = await response.json();

            if (result.success) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
                console.log('Threshold settings saved:', result);
            } else {
                setError(result.message || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving threshold settings:', error);
            setError('An error occurred while saving settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (notificationMethods.includes('email') && (!email || !emailRegex.test(email))) {
            setEmailError("Please enter a valid email address.");
            return;
        }

        setEmailError('');
        saveThresholdSettings();
    };

    useEffect(() => {
        getStore();
    }, []);

    return (
        <Page narrowWidth>
            <TitleBar title="Stock Watch Settings" />
            <Layout>
                {saveSuccess && (
                    <Layout.Section>
                        <Box padding="4">
                            <Banner status="success">
                                Your settings have been saved successfully.
                            </Banner>
                        </Box>
                    </Layout.Section>
                )}

                {error && (
                    <Layout.Section>
                        <Box padding="4">
                            <Banner status="error">
                                {error}
                            </Banner>
                        </Box>
                    </Layout.Section>
                )}

                <Layout.Section>
                    <Box padding="4">
                        <AlphaCard>
                            <VerticalStack gap="4">
                                <Text variant="headingMd" as="h2">Inventory Alert Settings</Text>

                                <form onSubmit={handleSubmit}>
                                    <VerticalStack gap="4">
                                        <TextField
                                            label="Low Stock Threshold"
                                            type="number"
                                            value={threshold.toString()}
                                            onChange={(value) => setThreshold(parseInt(value) || 0)}
                                            helpText="Get notified when inventory falls below this quantity"
                                            min="1"
                                            autoComplete="off"
                                            disabled={loading}
                                        />

                                        <Divider />

                                        <Text variant="headingSm" as="h3">Notification Preferences</Text>

                                        <ChoiceList
                                            title="Notification Methods"
                                            choices={[
                                                {
                                                    label: (
                                                        <HorizontalStack gap="2" align="center">
                                                            <Icon source={EmailMajor} color="base" />
                                                            <span>Email</span>
                                                        </HorizontalStack>
                                                    ),
                                                    value: 'email'
                                                }
                                            ]}
                                            selected={notificationMethods}
                                            onChange={setNotificationMethods}
                                            allowMultiple
                                            disabled={loading}
                                        />

                                        {notificationMethods.includes('email') && (
                                            <TextField
                                                label="Email Address"
                                                type="email"
                                                value={email}
                                                onChange={setEmail}
                                                autoComplete="email"
                                                required
                                                error={emailError}
                                                disabled={loading}
                                            />
                                        )}

                                        <Divider />

                                        <HorizontalStack align="end" gap="3">
                                            {loading && <Spinner size="small" />}
                                            <Button submit primary disabled={loading}>
                                                {loading ? 'Saving...' : 'Save Settings'}
                                            </Button>
                                        </HorizontalStack>
                                    </VerticalStack>
                                </form>
                            </VerticalStack>
                        </AlphaCard>
                    </Box>
                </Layout.Section>
            </Layout>
        </Page>
    );
}