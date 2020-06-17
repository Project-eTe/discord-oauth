declare module '@ete/discord-oauth' {
    export class OauthApplication {
        constructor(config: config)
        public config: config
        public users: Map<string, User>
        public getUserToken(code: string): UserTokenInfo
    }

    interface config {
        client_id: string;
        redirect_uri: string;
        client_secret: string;
        scope: string;
        jwt?: jwtOption;
    }
    
    interface jwtOption {

    }

    interface User {
        id: string;
    }

    interface UserTokenInfo {

    }
}