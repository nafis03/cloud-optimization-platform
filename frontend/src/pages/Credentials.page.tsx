import { Button, Card, Center, Container, PasswordInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";

export default function CredentialsPage() {
    const form = useForm({
        initialValues: {
            accessKeyId: '',
            secretAccessKey: '',
        },
    });

    const submitForm = (values: any) => {
        console.log(values);
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
                    </form>
                </Card>
            </Center>
        </Container>
    );

}