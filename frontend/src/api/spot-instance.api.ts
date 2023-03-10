import { CostRates, CreateSpotInstanceRequest, SpotInstance } from "../types/spot-instance.types";

export const getSpotInstances = async (): Promise<SpotInstance[]> => {
    const result = await fetch('/db/instances');
    
    if (result.status !== 200) throw new Error('request failed');

    const res = await result.json();

    return res.data.map((x: any) => {
        return {
            id: x.id,
            imageName: x.imageName,
            timestamp: new Date(x.timestamp),
            instanceSize: x.instanceSize,
        }
    });
};

export const createSpotInstance = async (input: CreateSpotInstanceRequest, username: string) => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    
    const body = {
        imageName: input.imageName,
        operatingSystem: input.amiType,
        instanceSize: input.instanceType,
        workload: input.workload,
        username
    };

    const result = await fetch('/launch', {
        method: 'POST',
        body: JSON.stringify(body),
        headers,
    });

    if (result.status !== 200) throw new Error('request failed');
};

export const terminateInstance = async (instance: SpotInstance, username: string) => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    const body = {
        instanceID: instance.id,
        username,
    };

    const result = await fetch('/terminateInstance', {
        method: 'POST',
        body: JSON.stringify(body),
        headers,
    });
    
    if (result.status !== 200) throw new Error('request failed');
};

export const getCostAnalysis = async (username: string): Promise<CostRates> => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    const body = {
        username,
    };

    const result = await fetch('/dashboard', {
        method: 'POST',
        body: JSON.stringify(body),
        headers,
    });

    if (result.status !== 200) throw new Error('request failed');

    const res = await result.json();

    return res.data;
};