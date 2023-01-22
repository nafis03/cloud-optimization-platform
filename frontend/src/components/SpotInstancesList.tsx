import { ActionIcon, Button, Container, Flex, Modal, Table, Text } from "@mantine/core";
import { SpotInstance } from "../types/spot-instance.types";
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { IconBan } from "@tabler/icons";
import { useState } from "react";
dayjs.extend(localizedFormat);

interface SpotInstancesListProps {
    spotInstances: SpotInstance[];
    onTerminate: (spotInstance: SpotInstance) => Promise<void>;
}

export default function SpotInstancesList({ spotInstances, onTerminate }: SpotInstancesListProps) {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selectedInstance, setSelectedInstance] = useState<SpotInstance>();

    const rows = spotInstances.map(spotInstance => (
        <tr
            key={spotInstance.id}
        >
            <td>{spotInstance.id}</td>
            <td>{spotInstance.imageName}</td>
            <td>{dayjs(spotInstance.timeStamp).format('lll')}</td>
            <td>{spotInstance.instanceSize}</td>
            <td>
                <ActionIcon onClick={() => {
                        setModalOpen(true);
                        setSelectedInstance(spotInstance);
                    }}
                    color="red"
                >
                    <IconBan size={20} />
                </ActionIcon>
            </td>
        </tr>
    ));

    return (
        <Container>
            <Table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Time Created</th>
                        <th>Instance Type</th>
                        <th>Terminate</th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </Table>
            <Modal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
            >
                <Text>
                    { `Are you sure you want to terminate the instance "${selectedInstance?.imageName}"?` }
                </Text>
                <Flex>
                    <Button onClick={() => {
                        if (selectedInstance) onTerminate(selectedInstance);
                    }} color="red">Terminate</Button>
                    <Button onClick={() => {
                        setModalOpen(false);
                        setSelectedInstance(undefined);
                    }} variant="light">Cancel</Button>
                </Flex>
            </Modal>
        </Container>
    );
}