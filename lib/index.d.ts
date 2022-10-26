export declare class TokenBuilder {
    private token;
    constructor(appId: string, key: string);
    static init(appId: string, key: string): TokenBuilder;
    expiration(exp: number): this;
    user(usr: string): Promise<string>;
    app(): Promise<string>;
    anon(): Promise<string>;
}
