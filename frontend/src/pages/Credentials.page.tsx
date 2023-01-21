import { Button, Card, Center, Container, Loader, PasswordInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useContext, useState } from "react";
import { login } from "../api/auth.api";
import { UserContext } from "../App";

export default function CredentialsPage() {
    const { setUserCredentials } = useContext(UserContext);
    const [loading, setLoading] = useState<boolean>(false);
    const form = useForm({
        initialValues: {
            accessKeyId: '',
            secretAccessKey: '',
        },
    });

    const submitForm = async (values: any) => {
        setUserCredentials(values);
        try {
            setLoading(true);
            login(values);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container h="100vh">
            <Center sx={{ width: '100%', height: '100%' }}>
                <Card shadow="sm" p="lg" radius="md" withBorder w={400}>
                    <Title order={3}>Enter your credentials</Title>
                    <form onSubmit={form.onSubmit(submitForm)}>
                        <PasswordInput
                            placeholder="ACCESS_KEY_ID"
                            label="Access Key Id"
                            withAsterisk
                            {...form.getInputProps('accessKeyId')}
                        />
                        <PasswordInput
                            placeholder="SECRET_ACCESS_KEY"
                            label="Secret Access Key"
                            withAsterisk
                            {...form.getInputProps('secretAccessKey')}
                        />
                        <Button
                            type="submit"
                        >
                            Enter
                        </Button>
                        { loading && <Loader />}
                    </form>
                </Card>
            </Center>
        </Container>
    );

}