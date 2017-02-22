'use strict';
var Promise = require('bluebird');

function makePromise(name, delay) {
    return new Promise((resolve) => {
        console.log(`${name} started`);
        setTimeout(() => {
            console.log(`${name} completed`);
            resolve(name);
        }, delay);
    });
}

var data = [2000, 1, 1000];

Promise
    .all( data.map( (item, index) => makePromise(index, item)))
    .then( res => {
        console.log(res);
});