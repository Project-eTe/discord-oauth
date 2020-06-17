const fetch = require('node-fetch')

const BASEURL = 'https://discord.com/api'

module.exports = class OauthApplication {
    /**
     * Discord Oauth2 Application Class
     * @param {Object} config Discord Oauth2 Application Config
     */
    constructor(config){
        if(!config) throw '`config` is required.'
        if(!config.client_id || !config.redirect_uri || !config.client_secret || !config.scope) throw 'Please include full client information.'
        this.config = config
        this.users = new Map()
    }
    /**
     * Get User Token with code.
     * @param {string} code 
     * @returns {Object} Token Info from Discord.
     */

    async getUserToken(code) {
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
        user = user.json()
        
        return user
    }

    /**
     * Add User with code.
     * @param {string} code
     * @returns {Map} Map of Users
     */

     async addUser(code) {
        return await this.getUserToken(code)
        .then(r=> {
            r['expires_in'] = new Date(Number(new Date()) + r['expires_in'] * 1000)
            return this.getDiscordData({ token_type: r.token_type, access_token: r.access_token }).then(res=> {
                return res.id
            })
        })

     }
    
     async refreshToken(refresh_token) {
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
         user = user.json()

         return user
     }

     async getUser(id) {
        let user = this.users.get(id)
        if(!user) throw 'User not found.'
        if(new Date() >= user.expires_in) {
            this.refreshToken(user.refresh_token).then(r=> this.users.set(id, r))
        }

        user = this.users.get(id)

        return await this.getDiscordData({ token_type: user.token_type, access_token: user.access_token }).then(r=> r)

     }

     async refreshUserToken(id) {
        let user = this.users.get(id)
        if(!user) throw 'User not found.'
        
        return this.refreshToken(user.refresh_token).then(r=> {
            r['expires_in'] = new Date(Number(new Date()) + r['expires_in'] * 1000)
            return this.users.set(id, r)
        })

     }
     
     /* Discord EndPoints */

     /**
     * Get User Discord Data (/@me)
     * @param {Object} tokenData
     * tokenData.token_type Token Type(ex: Bearer)
     * tokenData.acess_token Access Token
     * @returns {Object} Token Info from Discord.
     */

    async getDiscordData(tokenData) {
        if(!tokenData || !tokenData.token_type || tokenData.access_token) throw '`tokenData` is required'
        let user = await fetch(BASEURL + '/v6/users/@me', {
            method: 'GET',
            headers: {
                Authorization: `${tokenData.token_type} ${tokenData.access_token}`
            }
        })
        if(user.status !== 200) throw 'Invaild `tokenData`.'
        user = user.json()

        return user
    }

    async getGuilds(tokenData) {
        if(!tokenData || !tokenData.token_type || tokenData.access_token) throw '`tokenData` is required'
        let user = await fetch(BASEURL + '/v6/users/@me/guilds', {
            method: 'GET',
            headers: {
                Authorization: `${tokenData.token_type} ${tokenData.access_token}`
            }
        })
        if(user.status !== 200) throw 'Invaild `tokenData`.'
        user = user.json()

        return user
    }

}


function formData(details) {
    var formBody = [];
    for (var property in details) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(details[property]);
    formBody.push(encodedKey + "=" + encodedValue);
    }
    return formBody.join("&");
}