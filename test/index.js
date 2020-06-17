const Client = require('../')
const OauthApplication = new Client({ client_id: '706846878129455134', client_secret: 'xutrFwJSTUeErmApo2pCcpBPIcXImsXf', redirect_uri: 'http://localhost:3000/api/auth/callback', scope: 'identify'})

OauthApplication.addUser('Jye5LnAX7m0DhwCQWHIZhbMU3MAw6C').then(r=> {
    console.log(r)

})

