module.exports = {
	apps: [
		{
			name: 'whose-turn-cscms',
			script: 'build/main.js',
			autorestart: true,
			env: {
				NODE_ENV: 'production',
				PORT: 4050
			}
		}
	]

	// deploy : {
	//   production : {
	//     user : 'SSH_USERNAME',
	//     host : 'SSH_HOSTMACHINE',
	//     ref  : 'origin/master',
	//     repo : 'GIT_REPOSITORY',
	//     path : 'DESTINATION_PATH',
	//     'pre-deploy-local': '',
	//     'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
	//     'pre-setup': ''
	//   }
	// }
}
