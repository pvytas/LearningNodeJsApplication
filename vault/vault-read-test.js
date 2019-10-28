
'use strict';

// this tells the node-vault module to accept self-signed certificates.
process.env.VAULT_SKIP_VERIFY = true;

/**
 * read in the token from the bitnobi-token file in the home directory
 * and use this token in connecting to the vault.
 */
const HOME = process.env.HOME;
const fs = require('fs');
const token = fs.readFileSync(HOME +'/bitnobi-token', "utf8").trim();
console.log(token);


const options = {
    apiVersion: 'v1', // default
    endpoint: 'https://Bitnobi:8200',
    token: token
};

console.log('options=', options);

const vault = require('node-vault')(options);


vault.write('secret/hello', { value: 'world', lease: '1s' })
    .then( () => {
        console.log('wrote value=world, lease=ls');
        return vault.read('secret/hello');
    })
    .then((result) => {
        console.log('key/value objects=', result.data);
        return vault.write('secret/hello', { value: 'new world', lease: '123' })
    })
    .then( () => {
        console.log('wrote value=new world, lease=123');
        return vault.read('secret/hello');
    })
    .then((result) => {
        console.log('key/value objects=', result.data);
        return vault.write('secret/hello', { newValue: 'stuff' })
    })
    .then( () => {
        console.log('wrote newValue=stuff');
        return vault.read('secret/hello');
    })
    .then((result) => {
        console.log('key/value objects=', result.data);
    })

    .catch(console.error);

