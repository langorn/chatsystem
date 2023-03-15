const dotenv = require("dotenv");
const assert = require("assert");
dotenv.config();

// normally we should not commit to github, but this is for testing purpose.
REDIS_PASSWORD = 'n3HRWbC2Jm1OnGOpB98qNTN5NG4ZYkan';
REDIS_SERVER = 'redis-12464.c93.us-east-1-3.ec2.cloud.redislabs.com';
REDIS_PORT = 12464

module.exports = { 
    REDIS_PASSWORD: REDIS_PASSWORD,
    REDIS_SERVER: REDIS_SERVER,
    REDIS_PORT: REDIS_PORT
 }; 