#!/usr/bin/env node

const models = require('../../models/index');
const validator = require("email-validator");

const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

const WAValidator = require('wallet-address-validator');

import logger from '../modules/logger';

const env = process.env.NODE_ENV || 'development';
const config = require('../../config/config.js')[env];

export async function check() {
    logger.log('info', 'Quality data check started');
    return new Promise(function (resolve, reject) {
        // Get all new person data
        models.Users.findAll({
            where: {
                IsNew: true,
            },
            limit: config.readLimit
        }).then(users => {
            if (users.length > 0) {
                users.forEach(user => {
                    user.EMailOK = validator.validate(user.EMail);

                    const phone_number = phoneUtil.parse(user.Phone, "CH");

                    user.PhoneOK = phoneUtil.isValidNumberForRegion(phone_number, 'CH');

                    user.WalletIdOK = WAValidator.validate(user.WalletId, 'litecoin', config.networkType);

                    if (user.EMailOK && user.PhoneOK && user.WalletIdOK) {
                        user.IsNew = false;
                    }

                    user.save().then(() => {

                    });
                });
            }
            resolve(true);
        }).catch(err => {
            logger.log('error', err);
            reject(err);
        });
    });
}
