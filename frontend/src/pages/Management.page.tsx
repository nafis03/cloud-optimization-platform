import { Button, Container, Grid, Modal } from "@mantine/core";
import { IconPlus } from "@tabler/icons";
import { useEffect, useState } from "react";
import CreateInstanceForm from "../components/CreateInstanceForm";
import SpotInstancesList from "../components/SpotInstancesList";
import { SpotInstance } from "../types/spot-instance.types";

export default function ManagementPage() {
    const [spotInstances, setSpotInstances] = useState<SpotInstance[]>([]);
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    useEffect(() => {
        // setSpotInstances([]);
    });

    return (
        <Container h="100vh">
            <Grid>
                <Grid.Col span={12}>
                    <Button
                        leftIcon={<IconPlus />}
                        onClick={() => setModalOpen(true)}>Create new Instance</Button>
                    <SpotInstancesList spotInstances={spotInstances} />
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