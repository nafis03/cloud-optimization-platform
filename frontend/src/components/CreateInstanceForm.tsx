import { Button, NumberInput, Select, Space, TextInput } from "@mantine/core";
import { isInRange, isNotEmpty, useForm } from "@mantine/form";
import { createSpotInstance } from "../api/spot-instance.api";
import { ImageTypeLabels } from "../types/spot-instance.types";


export default function CreateInstanceForm() {
    const form = useForm({
        initialValues: {
            imageName: '',
            workloadName: '',
            amiType: '',
            port: 3000,
        },
        validate: {
            imageName: isNotEmpty('Please provide a name'),
            workloadName: isNotEmpty('Please provide a name'),
            amiType: isNotEmpty('Please choose an image type'),
            port: isInRange({ min: 1, max: 65535 }, 'Port number must be between 1 to 65535')
        }
    });

    const submitForm = async (values: any) => {
        try {
            await createSpotInstance({
                port: Number(values.port),
                ...values,
            });
        } catch (e) {

        }
    };

    return (
        <form onSubmit={form.onSubmit(submitForm)}>
            <TextInput
                placeholder="My Image"
                label="Image Name"
                withAsterisk
                {...form.getInputProps('imageName')}
            />
            <Space h="xl" />
            <TextInput
                placeholder="My Workload"
                label="Workload Name"
                withAsterisk
                {...form.getInputProps('workloadName')}
            />
            <Space h="xl" />
            <Select
                label="AMI Type"
                placeholder="Choose one"
                data={Object.values(ImageTypeLabels)}
                withAsterisk
                {...form.getInputProps('amiType')}
            />
            <Space h="xl" />
            <NumberInput
                type="number"
                placeholder="ex: 3000"
                label="Port Number"
                {...form.getInputProps('port')}
            />
            <Space h="xl" />
            <Button type="submit">
                Create
            </Button>
        </form>
    );
}