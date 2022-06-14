declare type App = {
    id: string;
};
declare type User = {
    id?: string;
    groupId?: string;
};
declare type Capture = {
    groupId?: string;
    userIds?: string[];
};
declare type Access = {
    dataId?: string;
    groupId?: string;
};
declare class Token {
    private key;
    app: App;
    user: User;
    capture: Capture;
    access: Access;
    lifetime: number;
    constructor(key: Uint8Array);
    build(): Promise<string>;
}
export declare class TokenBuilder {
    private token;
    constructor(token: Token);
    static init(key: string): TokenBuilder;
    build(): Promise<string>;
    lifetime(time: number): this;
    forApp(appId: string): {
        forUser: {
            withId: (userId: string) => {
                inGroup: (groupId: string) => TokenBuilder;
            };
        };
        toCaptureData: {
            forGroup: (groupId: string) => TokenBuilder;
            forUsers: (userIds: string[]) => TokenBuilder;
        };
        toAccessData: {
            withId: (dataId: string) => void;
            inGroup: (groupId: string) => void;
        };
    };
}
export {};
