import { Button, Card, Center, Container, Loader, PasswordInput, Text, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth.api";
import { UserContext } from "../App";

export type RequestStatus = 'idle' | 'failed' | 'loading' | 'succeeded'

export default function CredentialsPage() {
    const { setUserCredentials } = useContext(UserContext);
    const [requestStatus, setRequestStatus] = useState<RequestStatus>('idle');
    const navigate = useNavigate();
    const form = useForm({
        initialValues: {
            accessKeyId: '',
            secretAccessKey: '',
        },
    });

    const submitForm = async (values: any) => {
        setUserCredentials(values);
        try {
            await login(values);
            setRequestStatus('succeeded');
            navigate('/dashboard');
        } catch (e) {
            setRequestStatus('failed');
            console.log(e);
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
                        { requestStatus === 'loading' && <Loader />}
                        { requestStatus === 'failed' && <Text color="red">Request Failed</Text> }
                    </form>
                </Card>
            </Center>
        </Container>
    );

}