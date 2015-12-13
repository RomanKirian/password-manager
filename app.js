//console.log('Starting password manager');
var argv = require('yargs')
	.command('create', 'Create account', function(yargs){
		yargs.options({
			'name': {
				demand: true,
				alias: 'n',
				type: 'string',
				description: 'Account name'
			},
			'username': {
				demand: true,
				alias: 'u',
				type: 'string',
				description: 'Login username'
			},
			'password': {
				demand: true,
				alias: 'p',
				type: 'string',
				description: 'Login password'
			},
			"masterPassword": {
				demand: true,
				description: 'Master password',
				alias: 'm',
				type: 'string'
			}
		})
		.help('help')
		.argv;
	})
	.command('get', 'Get account', function(yargs){
		yargs.options({
			'name': {
				demand: true,
				alias: 'n',
				type: 'string',
				description: 'Account name'
			},
			"masterPassword": {
				demand: true,
				description: 'Master password',
				alias: 'm',
				type: 'string'
			}
		})
		.help('help')
		.argv;
	})
	.help('help')
	.argv;

var command = argv._[0];

var storage = require('node-persist');
storage.initSync();

var crypto = require('crypto-js');

function getAccounts(masterPassword){
	var encryptedAccounts = storage.getItemSync('accounts');
	var accounts = [];
	if (typeof encryptedAccounts !== 'undefined') {
		var bytes = crypto.AES.decrypt(encryptedAccounts, masterPassword);
		accounts = JSON.parse(bytes.toString(crypto.enc.Utf8));
	}
	return accounts;
}

function saveAccounts(accounts, masterPassword){
	var encrypted = crypto.AES.encrypt(JSON.stringify(accounts), masterPassword);
	storage.setItemSync('accounts', encrypted.toString());
}

function createAccount(account, masterPassword){
	// check account object sent by user
	if (typeof account.name === 'undefined' 
		|| typeof account.username === 'undefined'
		|| typeof account.password === 'undefined') {
		console.log('Cannot create account');
		return;
	}

	var accounts = getAccounts(masterPassword);
	accounts.push(account);
	saveAccounts(accounts, masterPassword);
	return account;
}

function getAccount(name, masterPassword){
	var accounts = getAccounts(masterPassword);
	var matchedAccount;
	//if (typeof accounts !== 'undefined'){
		accounts.forEach(function(account){
			if(account.name === name){
				matchedAccount = account;
			}
		});
	//}
	return matchedAccount;
}

if (command === 'create') {
	try{
		var createdAccount = createAccount({
				name: argv.name,
				username: argv.username,
				password: argv.password
			},
			argv.masterPassword
		);
		console.log('Account created! '+JSON.stringify(createdAccount));
	}
	catch(e){
		console.log('Unable to create account!');
		console.log(e.message)
	}
} 
else if (command === 'get'){
	try{
		var fetchedAccount = getAccount(argv.name, argv.masterPassword);
		if(typeof fetchedAccount !== 'undefined'){
			console.log(fetchedAccount);
		}
		else {
			console.log('Account not found');
		}
	}
	catch(e){
		console.log('Unable to fetch account!');
		console.log(e.message)
	}
}
