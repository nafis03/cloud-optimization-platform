import { Button, Card, Center, Container, Flex, Grid, Modal, Stack, Text, Title } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { getCostAnalysis } from "../api/spot-instance.api";
import LineGraph from "../components/LineGraph";
import { CostAnalysis } from "../types/dashboard-types";

const data: CostAnalysis[] = [
    {
        id: 'Regular EC2 Instance',
        name: 'Regular EC2 Instance',
        data: [
            { date: new Date('2022-12-13'), cost: 5.35 },
            { date: new Date('2022-12-14'), cost: 10.56 },
            { date: new Date('2022-12-15'), cost: 21.21 },
            { date: new Date('2022-12-16'), cost: 38.91 },
            { date: new Date('2022-12-17'), cost: 48.72 },
            { date: new Date('2022-12-18'), cost: 59.24 },
        ],
    },
    {
        id: 'Spot Instance',
        name: 'Spot Instance',
        data: [
            { date: new Date('2022-12-13'), cost: 2.35 },
            { date: new Date('2022-12-14'), cost: 6.56 },
            { date: new Date('2022-12-15'), cost: 7.21 },
            { date: new Date('2022-12-16'), cost: 8.91 },
            { date: new Date('2022-12-17'), cost: 10.72 },
            { date: new Date('2022-12-18'), cost: 11.24 },
        ],
    },
];

export default function DashboardPage() {
    const [costAnalysisData, setCostAnalysisData] = useState<CostAnalysis[]>();
    const [username] = useLocalStorage({ key: 'username-aws' });

    useEffect(() => {
        if (!costAnalysisData && username) {
            getCostAnalysis(username)
                // .then();
            // setCostAnalysisData();
        }
    }, [costAnalysisData]);

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
                                <Title order={3}>Projected Costs + Savings</Title>
                                <Container
                                    sx={{ height: '400px', width: '500px' }}
                                >
                                    { costAnalysisData && (
                                        <LineGraph 
                                            data={costAnalysisData}
                                        />
                                    ) }
                                </Container>
                            </Card>
                        </Grid.Col>
                        <Grid.Col span={12} md={4}>
                            <Card shadow="sm" p="lg" radius="md" withBorder
                                sx={{ height: '100%' }}
                            >
                                <Stack align="center">
                                    <Title order={4}>
                                        Projected Savings
                                    </Title>
                                    <Text
                                        fw={700}
                                        fz={70}
                                    >
                                        35%
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