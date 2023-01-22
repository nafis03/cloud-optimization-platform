import { CreateSpotInstanceRequest, SpotInstance } from "../types/spot-instance.types";

export const getSpotInstances = async (): Promise<SpotInstance[]> => {
    const result = await fetch('/db/users');
    
    if (result.status !== 200) throw new Error('request failed');

    const res = await result.json();

    return [
        {
            id: 'test',
            name: 'My Instance',
            timeStamp: new Date(),
        }
    ]
    return res.data;
};

export const createSpotInstance = async (input: CreateSpotInstanceRequest) => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    
    const body = {
        'image_name': input.imageName,
        'workload_name': input.workloadName,
        'ami_type': input.amiType,
        'port': input.port,
    };

    const result = await fetch('/launch', {
        method: 'POST',
        body: JSON.stringify(body),
        headers,
    });
    
    if (result.status !== 200) throw new Error('request failed');
};