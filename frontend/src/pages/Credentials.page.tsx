import { Button, Card, Center, Container, Loader, PasswordInput, Space, Text, TextInput, Title } from "@mantine/core";
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
            userName: '',
            accessKeyId: '',
            secretAccessKey: '',
        },
    });

    const submitForm = async (values: any) => {
        setUserCredentials(values);
        setRequestStatus('loading');
        try {
            await login(values);
            setRequestStatus('succeeded');
            navigate('/manage');
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
                        <TextInput
                            placeholder="Username"
                            label="Username"
                            withAsterisk
                            {...form.getInputProps('userName')}
                        />
                        <Space h="xl" />
                        <PasswordInput
                            placeholder="ACCESS_KEY_ID"
                            label="Access Key Id"
                            withAsterisk
                            {...form.getInputProps('accessKeyId')}
                        />
                        <Space h="xl" />
                        <PasswordInput
                            placeholder="SECRET_ACCESS_KEY"
                            label="Secret Access Key"
                            withAsterisk
                            {...form.getInputProps('secretAccessKey')}
                        />
                        <Space h="xl" />
                        <Button
                            type="submit"
                        >
                            Enter
                        </Button>
                        { requestStatus === 'failed' && <Text color="red">Request Failed</Text> }
                    </form>
                    { requestStatus === 'loading' && <Loader />}
                </Card>
            </Center>
        </Container>
    );

}