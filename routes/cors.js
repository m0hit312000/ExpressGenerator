const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['http://localhost:3000', 'https://localhost:3443', '*'];
var corsOptionsDelegate = (req, callback) => {
    var corsOPtions;
    if(whitelist.indexOf(req.header('Origin')) != -1) {
        corsOPtions = { origin: true };
    }
    else {
        corsOPtions = { origin: false };
    }
    callback(null, corsOPtions);
};

exports.cors = cors();
exports.corsWithOPtions = cors(corsOptionsDelegate);