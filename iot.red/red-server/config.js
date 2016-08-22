module.exports = {

    secret: 'wq803rhqfnan8rfqaa9fa-sf-as',

    github:{
    	CLIENT_ID: '9fbb1f5979357a21298f',
    	CLIENT_SECRET: '8de2de0c3609cb2d470f88b2057e94e52491fed5',
    	CALLBACK: 'http://192.168.101.87/auth/github/callback'
    },
    
    appstore: {
                URL: 'http://192.168.101.87/das'
    },

    red: {
        URL : 'http://127.0.0.1:1880',
    },

    mongo:{
    	url : 'mongodb://user:pass@localhost/db',
    },
    
    redis: {
    	host: '127.0.0.1',
    	port: '6379'
    }
}
