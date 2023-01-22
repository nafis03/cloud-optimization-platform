export interface SpotInstance {
    id: string;
    name: string;
    timeStamp: Date;
}

export enum ImageType {
    LINUX = 'amazon_linux',
    MACOS = 'macos',
    UBUNTU = 'ubuntu',
    WINDOWS = 'windows',
    REDHAT = 'redhat_linux',
}

export const ImageTypeLabels = {
    [ImageType.LINUX]: {
        label: 'Amazon Linux',
        value: ImageType.LINUX,
    },
    [ImageType.MACOS]: {
        label: 'MacOS',
        value: ImageType.MACOS,
    },
    [ImageType.UBUNTU]: {
        label: 'Ubuntu',
        value: ImageType.UBUNTU,
    },
    [ImageType.WINDOWS]: {
        label: 'Windows',
        value: ImageType.WINDOWS,
    },
    [ImageType.REDHAT]: {
        label: 'Red Hat Linux',
        value: ImageType.REDHAT,
    },
};

export enum InstanceType {
    T1_MICRO = 't1.micro',
    T2_NANO = 't2.nano',
    T2_MICRO = 't2.micro',
    T2_SMALL = 't2.small',
}

export interface CreateSpotInstanceRequest {
    imageName: string;
    workloadName?: string;
    amiType: ImageType;
    instanceType: InstanceType;
}