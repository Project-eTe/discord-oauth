import fetch from 'node-fetch'
import { config, UserTokenInfo, User, tokenData } from './types'
const BASEURL = 'https://discord.com/api'

export class OauthApplication {
    config: config
    users: Map<string, UserTokenInfo>
    /**
     * Discord Oauth2 Application Class
     * @param config Discord Oauth2 Application Config
     */
    constructor(config: config){
        if(!config) throw '`config` is required.'
        if(!config.client_id || !config.redirect_uri || !config.client_secret || !config.scope) throw 'Please include full client information.'
        
        this.config = config
        this.users = new Map()
    }
    /**
     * Get User Token with code.
     * @param code 
     * @returns Token Info from Discord.
     */

    async getUserToken(code: string):Promise<UserTokenInfo> {
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
     * Add User with code.
     * @param code
     * @returns User ID
     */

     async addUser(code: string):Promise<User> {
        return await this.getUserToken(code)
        .then(r=> {
            r['expires_in'] = new Date(Number(new Date()) + Number(r['expires_in']) * 1000)
            return this.getDiscordData({ token_type: r.token_type, access_token: r.access_token }).then(res=> {
                this.users.set(res.id, r)
                return res
            })
        })

     }
    
     /**
      * Force refresh token for user
      * @param refresh_token Refresh Token for user
      * @returns Token Info from Discord.
      */
     async refreshToken(refresh_token: string):Promise<UserTokenInfo> {
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
      * Get Stored User By User ID
      * @param id User ID
      * 
      * @returns User Discord Data (/@me)
      */
     async getUser(id: string):Promise<User> {
        let user = this.users.get(id)
        if(!user) throw 'User not found.'
        if(new Date() >= user.expires_in) {
            this.refreshToken(user.refresh_token).then(r=> this.users.set(id, r))
        }

        user = this.users.get(id)

        return await this.getDiscordData({ token_type: user.token_type, access_token: user.access_token }).then(r=> r)

     }

     /**
      * Get User Guild List
      * @param id User ID
      * 
      * @returns User Guild Data
      */
     async getUserGuilds(id: string):Promise<User> {
        let user = this.users.get(id)
        if(!user) throw 'User not found.'
        if(new Date() >= user.expires_in) {
            this.refreshToken(user.refresh_token).then(r=> this.users.set(id, r))
        }

        user = this.users.get(id)

        return await this.getGuilds({ token_type: user.token_type, access_token: user.access_token }).then(r=> r)

     }
     /**
      * Get User Guild by ID
      * @param id User ID
      * @param guildID Guild ID
      */
     async getUserGuild(id: string, guildID: string):Promise<User> {
        let user = this.users.get(id)
        if(!user) throw 'User not found.'
        if(new Date() >= user.expires_in) {
            this.refreshToken(user.refresh_token).then(r=> this.users.set(id, r))
        }

        user = this.users.get(id)

        return await this.getGuild({ token_type: user.token_type, access_token: user.access_token }, guildID).then(r=> r)

     }


     /**
      * Refresh User Token By User ID
      * @param id User ID
      * 
      * @returns Token Info
      */
     async refreshUserToken(id: string):Promise<UserTokenInfo> {
        let user = this.users.get(id)
        if(!user) throw 'User not found.'
        
        return this.refreshToken(user.refresh_token).then(r=> {
            r['expires_in'] = new Date(Number(new Date()) + Number(r['expires_in']) * 1000)
            this.users.set(id, r)

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
    /**
     * Get Guild Data by ID
     * @param tokenData 
     * tokenData.token_type Token Type(ex: Bearer)
     * tokenData.acess_token Access Token
     * @param id Guild ID
     */
    async getGuild(tokenData: tokenData, id: string) {
        if(!tokenData || !tokenData.token_type || !tokenData.access_token) throw '`tokenData` is required'
        if(!id) throw '`id` is required'
        let user = await fetch(BASEURL + '/v6/guilds/' + id, {
            method: 'GET',
            headers: {
                Authorization: `${tokenData.token_type} ${tokenData.access_token}`
            }
        })
        // if(user.status !== 200) throw 'Invaild `tokenData`.'

        return user.json()
    }

}



function formData(params: { [x: string]: any; }) {
    const searchParams = Object.keys(params).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
      }).join('&');
    
      return searchParams
}