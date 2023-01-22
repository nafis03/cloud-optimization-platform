import { Button, Select, Space, TextInput } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { RequestStatus } from "../pages/Credentials.page";
import { CreateSpotInstanceRequest, ImageTypeLabels, InstanceType, Workload } from "../types/spot-instance.types";


interface CreateInstanceFormProps {
    onCreate: (inputs: CreateSpotInstanceRequest) => Promise<void>;
    status: RequestStatus;
}

export default function CreateInstanceForm({ onCreate, status }: CreateInstanceFormProps) {
    const form = useForm({
        initialValues: {
            imageName: '',
            amiType: '',
            instanceType: '',
            workload: '',
        },
        validate: {
            imageName: isNotEmpty('Please provide a name'),
            amiType: isNotEmpty('Please choose an image type'),
            instanceType: isNotEmpty('Please choose an instance type'),
            workload: isNotEmpty('Please choose a workload'),
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
            <Select
                label="Operating System"
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
            <Select
                label="Workload"
                placeholder="Choose one"
                data={Object.values(Workload)}
                withAsterisk
                {...form.getInputProps('workload')}
            />
            <Space h="xl" />
            <Button type="submit" loading={status === 'loading'}>
                Create
            </Button>
        </form>
    );
}