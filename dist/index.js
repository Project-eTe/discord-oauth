"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
const BASEURL = 'https://discord.com/api';
class OauthApplication {
    constructor(config) {
        if (!config)
            throw '`config` is required.';
        if (!config.client_id || !config.redirect_uri || !config.client_secret || !config.scope)
            throw 'Please include full client information.';
        this.config = config;
        this.users = new Map();
    }
    async getUserToken(code) {
        if (!code)
            throw '`code` is required';
        let user = await node_fetch_1.default(BASEURL + '/oauth2/token', {
            method: 'post',
            body: formData({
                client_id: this.config.client_id,
                redirect_uri: this.config.redirect_uri,
                client_secret: this.config.client_secret,
                scope: this.config.scope,
                grant_type: 'authorization_code',
                code: code
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        if (user.status !== 200)
            throw 'Invaild `code`.';
        return user.json();
    }
    async addUser(code) {
        return await this.getUserToken(code)
            .then(r => {
            r['expires_in'] = new Date(Number(new Date()) + Number(r['expires_in']) * 1000);
            return this.getDiscordData({ token_type: r.token_type, access_token: r.access_token }).then(res => {
                this.users.set(res.id, r);
                return res;
            });
        });
    }
    async refreshToken(refresh_token) {
        let user = await node_fetch_1.default(BASEURL + '/oauth2/token', {
            method: 'post',
            body: formData({
                client_id: this.config.client_id,
                redirect_uri: this.config.redirect_uri,
                client_secret: this.config.client_secret,
                scope: this.config.scope,
                grant_type: 'refresh_token',
                refresh_token
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        if (user.status !== 200)
            throw 'Fail to Refresh Token';
        return user.json();
    }
    async getUser(id) {
        let user = this.users.get(id);
        if (!user)
            throw 'User not found.';
        if (new Date() >= user.expires_in) {
            this.refreshToken(user.refresh_token).then(r => this.users.set(id, r));
        }
        user = this.users.get(id);
        return await this.getDiscordData({ token_type: user.token_type, access_token: user.access_token }).then(r => r);
    }
    async getUserGuilds(id) {
        let user = this.users.get(id);
        if (!user)
            throw 'User not found.';
        if (new Date() >= user.expires_in) {
            this.refreshToken(user.refresh_token).then(r => this.users.set(id, r));
        }
        user = this.users.get(id);
        return await this.getGuilds({ token_type: user.token_type, access_token: user.access_token }).then(r => r);
    }
    async getUserGuild(id, guildID) {
        let user = this.users.get(id);
        if (!user)
            throw 'User not found.';
        if (new Date() >= user.expires_in) {
            this.refreshToken(user.refresh_token).then(r => this.users.set(id, r));
        }
        user = this.users.get(id);
        return await this.getGuild({ token_type: user.token_type, access_token: user.access_token }, guildID).then(r => r);
    }
    async refreshUserToken(id) {
        let user = this.users.get(id);
        if (!user)
            throw 'User not found.';
        return this.refreshToken(user.refresh_token).then(r => {
            r['expires_in'] = new Date(Number(new Date()) + Number(r['expires_in']) * 1000);
            this.users.set(id, r);
            return r;
        });
    }
    async getDiscordData(tokenData) {
        if (!tokenData || !tokenData.token_type || !tokenData.access_token)
            throw '`tokenData` is required';
        let user = await node_fetch_1.default(BASEURL + '/v6/users/@me', {
            method: 'GET',
            headers: {
                Authorization: `${tokenData.token_type} ${tokenData.access_token}`
            }
        });
        if (user.status !== 200)
            throw 'Invaild `tokenData`.';
        return user.json();
    }
    async getGuilds(tokenData) {
        if (!tokenData || !tokenData.token_type || !tokenData.access_token)
            throw '`tokenData` is required';
        let user = await node_fetch_1.default(BASEURL + '/v6/users/@me/guilds', {
            method: 'GET',
            headers: {
                Authorization: `${tokenData.token_type} ${tokenData.access_token}`
            }
        });
        if (user.status !== 200)
            throw 'Invaild `tokenData`.';
        return user.json();
    }
    async getGuild(tokenData, id) {
        if (!tokenData || !tokenData.token_type || !tokenData.access_token)
            throw '`tokenData` is required';
        if (!id)
            throw '`id` is required';
        let user = await node_fetch_1.default(BASEURL + '/v6/guilds/' + id, {
            method: 'GET',
            headers: {
                Authorization: `${tokenData.token_type} ${tokenData.access_token}`
            }
        });
        return user.json();
    }
}
exports.OauthApplication = OauthApplication;
function formData(params) {
    const searchParams = Object.keys(params).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');
    return searchParams;
}
//# sourceMappingURL=index.js.map