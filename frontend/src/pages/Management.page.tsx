import { Button, Container, Dialog, Flex, Grid, Modal, Text, Title } from "@mantine/core";
import { IconCheck, IconPlus, IconX } from "@tabler/icons";
import { useEffect, useState } from "react";
import { createSpotInstance, getSpotInstances } from "../api/spot-instance.api";
import CreateInstanceForm from "../components/CreateInstanceForm";
import SpotInstancesList from "../components/SpotInstancesList";
import { CreateSpotInstanceRequest, SpotInstance } from "../types/spot-instance.types";
import { RequestStatus } from "./Credentials.page";

export default function ManagementPage() {
    const [spotInstances, setSpotInstances] = useState<SpotInstance[]>();
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [createInstanceStatus, setCreateInstanceStatus] = useState<RequestStatus>('idle');
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    const create = async (inputs: CreateSpotInstanceRequest) => {
        setCreateInstanceStatus('loading');
        try {
            await createSpotInstance(inputs);
            setCreateInstanceStatus('succeeded');
        } catch (e) {
            console.log(e);
            setCreateInstanceStatus('failed');
        }
    }

    useEffect(() => {
        if (!spotInstances) {
            getSpotInstances()
                .then(instances => {
                    console.log(instances);
                    setSpotInstances(instances);
                });
        }
    }, [spotInstances]);

    useEffect(() => {
        if (createInstanceStatus === 'succeeded') {
            setTimeout(() => setCreateInstanceStatus('idle'), 5000);
        } else if (createInstanceStatus === 'failed') {
            setTimeout(() => setCreateInstanceStatus('idle'), 5000);
        }
    }, [createInstanceStatus])

    return (
        <Container h="100vh">
            <Grid>
                <Grid.Col span={12}>
                    <Flex mt={40} mb={20} justify="space-between">
                        <Title>Active Instances</Title>
                        <Button
                            loading={createInstanceStatus === 'loading'}
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
                <CreateInstanceForm onCreate={create} />
            </Modal>
            <Dialog
                opened={createInstanceStatus === 'succeeded' || createInstanceStatus === 'failed'}
                withCloseButton
                onClose={() => setCreateInstanceStatus('idle')}
                size="lg"
                radius="md"
            >
                { createInstanceStatus === 'succeeded' && (
                    <Flex align="center" gap={20}>
                        <IconCheck color="green" />
                        <Text size="sm">
                            Instance successfully created
                        </Text>
                    </Flex>
                )}
                { createInstanceStatus === 'failed' && (
                    <Flex align="center" gap={10}>
                        <IconX color="red" />
                        <Text size="sm">
                            Instance creation failed
                        </Text>
                    </Flex>
                )}
            </Dialog>
        </Container>
    );
}