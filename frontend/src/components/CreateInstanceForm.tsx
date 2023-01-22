import { Button, Select, Space, TextInput } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { CreateSpotInstanceRequest, ImageTypeLabels, InstanceType } from "../types/spot-instance.types";


interface CreateInstanceFormProps {
    onCreate: (inputs: CreateSpotInstanceRequest) => Promise<void>;
}

export default function CreateInstanceForm({ onCreate }: CreateInstanceFormProps) {
    const form = useForm({
        initialValues: {
            imageName: '',
            workloadName: '',
            amiType: '',
            instanceType: '',
        },
        validate: {
            imageName: isNotEmpty('Please provide a name'),
            workloadName: isNotEmpty('Please provide a name'),
            amiType: isNotEmpty('Please choose an image type'),
            instanceType: isNotEmpty('Please choose an instance type'),
        }
    });

    const submitForm = async (values: any) => {
        onCreate(values);
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
            <Select
                label="Instance Type"
                placeholder="Choose one"
                data={Object.values(InstanceType)}
                withAsterisk
                {...form.getInputProps('instanceType')}
            />
            <Space h="xl" />
            <Button type="submit">
                Create
            </Button>
        </form>
    );
}