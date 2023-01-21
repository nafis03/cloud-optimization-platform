import { AWSCredentials } from "../types/credentials.types";


export const login = async (credentials: AWSCredentials) => {
    const body = {
        'access_key': credentials.accessKeyId,
        'secret_key': credentials.secretAccessKey,
    };

    const result = await fetch('/login', {
        method: 'POST',
        body: JSON.stringify(body),
    });
    
    if (result.status !== 200) throw new Error('request failed');
};