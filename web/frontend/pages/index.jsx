import {
  Page,
  Box,
  Card,
  Layout,
  TextContainer,
  Heading,
  Text,
  Button,
  Stack,
  Icon,
  Banner
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { ProductsMajor, InventoryMajor, NotificationMajor } from '@shopify/polaris-icons';
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <Page narrowWidth>
      <TitleBar title="Stock Watch" />
      <Layout>
        <Layout.Section>
          <Box padding="4">
            <Card sectioned>
              <TextContainer>
                <Heading>Never miss a low stock alert</Heading>
                <Text as="p" variant="bodyMd">
                  Stock Watch monitors your inventory and notifies you when products fall below your specified threshold.
                </Text>

                <Box paddingBlockStart="4">
                  <Banner status="info">
                    Get started by setting up your inventory alert threshold below.
                  </Banner>
                </Box>
              </TextContainer>
            </Card>
          </Box>
        </Layout.Section>

        <Layout.Section>
          <Box padding="4">
            <Stack vertical spacing="loose">
              <Stack distribution="fillEvenly">
                <Card sectioned>
                  <Stack vertical spacing="tight">
                    <Icon source={InventoryMajor} color="highlight" />
                    <Heading>Real-time Monitoring</Heading>
                    <Text as="p" variant="bodyMd">
                      Tracks inventory levels 24/7 and updates instantly
                    </Text>
                  </Stack>
                </Card>

                <Card sectioned>
                  <Stack vertical spacing="tight">
                    <Icon source={NotificationMajor} color="highlight" />
                    <Heading>Smart Alerts</Heading>
                    <Text as="p" variant="bodyMd">
                      Get notified when stock runs low
                    </Text>
                  </Stack>
                </Card>
              </Stack>

              <Card sectioned>
                <Stack vertical spacing="tight">
                  <Icon source={ProductsMajor} color="highlight" />
                  <Heading>Product Insights</Heading>
                  <Text as="p" variant="bodyMd">
                    View all monitored products at a glance
                  </Text>
                </Stack>
              </Card>
            </Stack>
          </Box>
        </Layout.Section>

        <Layout.Section>
          <Box padding="4">
            <Card sectioned>
              <Stack distribution="trailing">
                <Button primary onClick={() => navigate('/Settings')}>
                  Set Alert Threshold
                </Button>
              </Stack>
            </Card>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}