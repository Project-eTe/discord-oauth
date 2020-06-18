const Client = require('../')

const OauthApplication = new Client.OauthApplication({ client_id: '706846878129455134', client_secret: 'xutrFwJSTUeErmApo2pCcpBPIcXImsXf', redirect_uri: 'http://localhost:3000/api/auth/callback', scope: 'identify'})

OauthApplication.addUser('H1Jh2ApZmxM1l5Wd6c2QoJ3YZyTNss').then(r=> {
    console.log(r)
    OauthApplication.getUserGuild('285185716240252929', '653083797763522580').then(r=> console.log(r))
    
})


