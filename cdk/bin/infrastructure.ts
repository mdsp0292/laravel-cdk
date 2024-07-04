#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {LaravelLambdaStack} from "../lib/laravel-lambda-stack";
import {getAccount, getRegion} from "../config/environment";


const app = new cdk.App();
new LaravelLambdaStack(app, 'laravel-lambda-app', {
    env: {
        region: getRegion(),
        account: getAccount(),
    },
})
