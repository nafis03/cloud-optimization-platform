import { Container, Table } from "@mantine/core";
import { SpotInstance } from "../types/spot-instance.types";

interface SpotInstancesListProps {
    spotInstances: SpotInstance[];
}

export default function SpotInstancesList({ spotInstances }: SpotInstancesListProps) {
    const rows = spotInstances.map(spotInstance => (
        <tr
            key={spotInstance.id}
        >
            <td>{spotInstance.id}</td>
            <td>{spotInstance.name}</td>
            {/* <td>{spotInstance}</td> */}
        </tr>
    ));

    return (
        <Container>
            <Table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Time Stamp</th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </Table>
        </Container>
    );
}