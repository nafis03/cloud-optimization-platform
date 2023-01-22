import { CreateSpotInstanceRequest } from "../types/spot-instance.types";

export const createSpotInstance = async (input: CreateSpotInstanceRequest) => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    
    const body = {
        'image_name': input.imageName,
        'workload_name': input.workloadName,
        'ami_type': input.amiType,
        'port': input.port,
    };

    const result = await fetch('/create-instance', {
        method: 'POST',
        body: JSON.stringify(body),
        headers,
    });
    
    if (result.status !== 200) throw new Error('request failed');
};