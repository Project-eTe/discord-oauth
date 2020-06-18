    export class OauthApplication {
        config: config
        users: Map<string, UserTokenInfo>
    }

    export interface config {
        client_id: string;
        redirect_uri: string;
        client_secret: string;
        scope: string;
    }
    
    export interface User {
        id: string;
        username: string;
        avatar: string;
        discriminator: string;
        flags: number;
        email: string;
        verified: boolean;
        locale: string;
        mfa_enabled: boolean;
        premium_type: number;
    }


    export enum GuildFeature {
        "ANIMATED_ICON",
        "VERIFIED",
        "NEWS",
        "VANITY_URL",
        "DISCOVERABLE",
        "MORE_EMOJI",
        "INVITE_SPLASH",
        "BANNER",
        "PUBLIC",
        "VIP_REGIONS",
        "PARTNERED",
        "COMMERCE",
        "FEATURABLE",
        "PUBLIC_DISABLED",
        "WELCOME_SCREEN_ENABLED"
    }
    export interface UserTokenInfo {
        access_token: string;
        expires_in: Date;
        refresh_token: string;
        scope: string;
        token_type: string;
    }

    export interface tokenData {
        token_type: string;
        access_token: string;
        expires_in?: Date;
    }