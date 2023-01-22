import { AWSCredentials } from "../types/credentials.types";


export const login = async (credentials: AWSCredentials) => {
    const body = {
        'username': credentials.userName,
        'access_key': credentials.accessKeyId,
        'secret_key': credentials.secretAccessKey,
    };

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    const result = await fetch('/login', {
        method: 'POST',
        body: JSON.stringify(body),
        headers,
    });
    
    if (result.status !== 200) throw new Error('request failed');
};