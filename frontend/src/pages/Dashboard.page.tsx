import { Button, Container, Flex, Grid, Modal, Title } from "@mantine/core";

export default function DashboardPage() {

    return (
        <Container h="100vh">
            <Grid>
                <Grid.Col span={12}>
                    <Flex mt={40} mb={20} justify="space-between">
                        <Title>Dashboard</Title>
                        {/* <Button
                            leftIcon={<IconPlus />}
                            onClick={() => setModalOpen(true)}>
                            Create new Instance
                        </Button> */}
                    </Flex>
                </Grid.Col>
            </Grid>
        </Container>
    );
}