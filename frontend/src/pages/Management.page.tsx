import { Button, Container, Flex, Grid, Modal, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons";
import { useEffect, useState } from "react";
import { getSpotInstances } from "../api/spot-instance.api";
import CreateInstanceForm from "../components/CreateInstanceForm";
import SpotInstancesList from "../components/SpotInstancesList";
import { SpotInstance } from "../types/spot-instance.types";

export default function ManagementPage() {
    const [spotInstances, setSpotInstances] = useState<SpotInstance[]>();
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    useEffect(() => {
        if (!spotInstances) {
            getSpotInstances()
                .then(instances => {
                    console.log(instances);
                    setSpotInstances(instances);
                });
        }
    }, [spotInstances]);

    return (
        <Container h="100vh">
            <Grid>
                <Grid.Col span={12}>
                    <Flex mt={40} mb={20} justify="space-between">
                        <Title>Active Instances</Title>
                        <Button
                            leftIcon={<IconPlus />}
                            onClick={() => setModalOpen(true)}>
                            Create new Instance
                        </Button>
                    </Flex>
                    { spotInstances && <SpotInstancesList spotInstances={spotInstances} /> }
                </Grid.Col>
            </Grid>
            <Modal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Create a new Spot Instance"
            >
                <CreateInstanceForm />
            </Modal>
        </Container>
    );
}