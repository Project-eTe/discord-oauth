import fetch from 'node-fetch'
import { config, UserTokenInfo, User, tokenData } from './types'
const BASEURL = 'https://discord.com/api'

export class OauthApplication {
    config: config
    /**
     * Discord Oauth2 Application Class
     * @param config Discord Oauth2 Application Config
     */
    constructor(config: config){
        if(!config) throw '`config` is required.'
        if(!config.client_id || !config.redirect_uri || !config.client_secret || !config.scope) throw 'Please include full client information.'
        
        this.config = config
    }

    async _getToken(code: string):Promise<UserTokenInfo> {
        if(!code) throw '`code` is required'
        let user = await fetch(BASEURL + '/oauth2/token', {
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
        })
        
        if(user.status !== 200) throw 'Invaild `code`.'

        return user.json()
    }

    /**
     * Get User Token with code.
     * @param code 
     * @returns Token Info from Discord.
     */

    async getToken(code: string):Promise<UserTokenInfo> {
        return await this._getToken(code).then(r=> {
            r['expires_in'] = new Date(Number(new Date()) + Number(r['expires_in']) * 1000)
            return r
        })
    }


     async _refreshToken(refresh_token: string):Promise<UserTokenInfo> {
         let user = await fetch(BASEURL + '/oauth2/token', {
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
         })
         if(user.status !== 200) throw 'Fail to Refresh Token'

         return user.json()
     }

    /**
      * Force refresh token for user
      * @param refresh_token Refresh Token for user
      * @returns Token Info from Discord.
      */

     async refreshToken(refresh_token: string):Promise<UserTokenInfo> {
        return await this._refreshToken(refresh_token).then(r=> {
            r['expires_in'] = new Date(Number(new Date()) + Number(r['expires_in']) * 1000)
            return r
        })
    }
     /* Discord EndPoints */

     /**
     * Get User Discord Data (/@me)
     * @param tokenData
     * tokenData.token_type Token Type(ex: Bearer)
     * tokenData.acess_token Access Token
     * @returns User Profile Info
     */

    async getDiscordData(tokenData: tokenData):Promise<User> {
        if(!tokenData || !tokenData.token_type || !tokenData.access_token) throw '`tokenData` is required'
        let user = await fetch(BASEURL + '/v6/users/@me', {
            method: 'GET',
            headers: {
                Authorization: `${tokenData.token_type} ${tokenData.access_token}`
            }
        })
        if(user.status !== 200) throw 'Invaild `tokenData`.'

        return user.json()
    }

    /**
     * Get Guilds Data (/@me/guilds)
     * @param tokenData
     * tokenData.token_type Token Type(ex: Bearer)
     * tokenData.acess_token Access Token
     * 
     * @returns User Guilds Info
     */
    async getGuilds(tokenData: tokenData) {
        if(!tokenData || !tokenData.token_type || !tokenData.access_token) throw '`tokenData` is required'
        let user = await fetch(BASEURL + '/v6/users/@me/guilds', {
            method: 'GET',
            headers: {
                Authorization: `${tokenData.token_type} ${tokenData.access_token}`
            }
        })
        if(user.status !== 200) throw 'Invaild `tokenData`.'

        return user.json()
    }

}


function formData(params: { [x: string]: any; }) {
    const searchParams = Object.keys(params).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
      }).join('&');
    
      return searchParams
}