import { Button, Card, Center, Container, Flex, Grid, Modal, Stack, Text, Title } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { getCostAnalysis } from "../api/spot-instance.api";
import LineGraph from "../components/LineGraph";
import { CostAnalysis } from "../types/dashboard-types";
import { CostRates } from "../types/spot-instance.types";

const dataTemplate: CostAnalysis[] = [
    {
        id: 'Regular EC2 Instance',
        name: 'Regular EC2 Instance',
        data: [
            // { date: new Date('2022-12-13'), cost: 5.35 },
            // { date: new Date('2022-12-14'), cost: 10.56 },
            // { date: new Date('2022-12-15'), cost: 21.21 },
            // { date: new Date('2022-12-16'), cost: 38.91 },
            // { date: new Date('2022-12-17'), cost: 48.72 },
            // { date: new Date('2022-12-18'), cost: 59.24 },
        ],
    },
    {
        id: 'Spot Instance',
        name: 'Spot Instance',
        data: [
            // { date: new Date('2022-12-13'), cost: 2.35 },
            // { date: new Date('2022-12-14'), cost: 6.56 },
            // { date: new Date('2022-12-15'), cost: 7.21 },
            // { date: new Date('2022-12-16'), cost: 8.91 },
            // { date: new Date('2022-12-17'), cost: 10.72 },
            // { date: new Date('2022-12-18'), cost: 11.24 },
        ],
    },
];

export default function DashboardPage() {
    const [costRates, setCostRates] = useState<CostRates>();
    const [username] = useLocalStorage({ key: 'username-aws' });

    const generateCostAnalysisData = (data: CostRates): CostAnalysis[] => {
        const costAnalysisArray = dataTemplate;

        let regTotalCost = 0;
        let spotTotalCost = 0;
        let currentDate = new Date();
        
        for (let i = 0; i < 10; i++) {
            costAnalysisArray[0].data.push({
                date: new Date(currentDate),
                cost: regTotalCost,
            });
            costAnalysisArray[1].data.push({
                date: new Date(currentDate),
                cost: spotTotalCost,
            });

            regTotalCost += 24 * data.onDemandPerHour;
            spotTotalCost += 24 * data.spotPerHour;
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return costAnalysisArray;
    };

    const getSavingsPerMonth = (costRates: CostRates) => {
        const total = costRates.totalSavedPerHour * 24 * 30;
        return `$${total.toFixed(2)}`;
    };

    useEffect(() => {
        if (username) {
            getCostAnalysis(username)
                .then(data => setCostRates(data));
        }
    }, [costRates, username]);

    return (
        <Container h="100vh">
            <Grid>
                <Grid.Col span={12}>
                    <Flex mt={40} mb={20} justify="space-between">
                        <Title>Dashboard</Title>
                    </Flex>
                </Grid.Col>
                <Grid.Col span={12}>
                    <Grid gutter={1} sx={{ alignItems: 'stretch'}}>
                        <Grid.Col span={12} md={8}>
                            <Card shadow="sm" p="lg" radius="md" withBorder
                                sx={{ height: '450px', width: '600px' }}
                            >
                                <Title order={3}>Projected Costs</Title>
                                <Container
                                    sx={{ height: '400px', width: '500px' }}
                                >
                                    { costRates && (
                                        <LineGraph 
                                            data={generateCostAnalysisData(costRates)}
                                        />
                                    ) }
                                </Container>
                            </Card>
                        </Grid.Col>
                        <Grid.Col span={12} md={4}>
                            <Card shadow="sm" p="lg" radius="md" withBorder
                                sx={{ height: '100%' }}
                            >
                                <Stack align="center" spacing={5}>
                                    <Title order={4}>
                                        Savings
                                    </Title>
                                    <Text>per hour</Text>
                                    <Text
                                        color="dark"
                                        fw={700}
                                        fz={70}
                                    >
                                        { costRates && `$${costRates.totalSavedPerHour.toFixed(2)}` }
                                    </Text>
                                </Stack>
                                <Stack align="center" mt={30} spacing={5}>
                                    <Title order={4}>
                                        Projected Savings
                                    </Title>
                                    <Text>per month</Text>
                                    <Text
                                        color="green"
                                        fw={700}
                                        fz={70}
                                    >
                                        { costRates && getSavingsPerMonth(costRates) }
                                    </Text>
                                </Stack>
                            </Card>
                        </Grid.Col>
                    </Grid>
                </Grid.Col>
            </Grid>
        </Container>
    );
}