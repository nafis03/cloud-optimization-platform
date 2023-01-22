import { Container, Grid } from "@mantine/core";
import { useEffect, useState } from "react";
import SpotInstancesList from "../components/SpotInstancesList";
import { SpotInstance } from "../types/spot-instance.types";


export default function DashboardPage() {
    const [spotInstances, setSpotInstances] = useState<SpotInstance[]>([]);
    

    useEffect(() => {
        // setSpotInstances([]);
    });

    return (
        <Container h="100vh">
            <Grid>
                <Grid.Col span={12}>
                    <SpotInstancesList spotInstances={spotInstances} />
                </Grid.Col>
                <Grid.Col>
                    
                </Grid.Col>
            </Grid>
        </Container>
    );
}