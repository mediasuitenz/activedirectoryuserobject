'use strict'
const assert = require('assert')
const merge = require('merge')
const messages = {
  urlRequired: 'config.url required',
  baseDNRequired: 'config.baseDN required',
  usernameRequired: 'config.username required',
  passwordRequired: 'config.password required'
}
const defaultOptions = {
  userName: 'username',
  userObject: 'user',
  userObjectName: 'name'
}

module.exports = ldapuserobject

function ldapuserobject (config, options) {
  assert(config.url, messages.urlRequired)
  assert(config.baseDN, messages.baseDNRequired)
  assert(config.username, messages.usernameRequired)
  assert(config.password, messages.passwordRequired)

  const opts = merge(true, defaultOptions, options)

  return function (req, res, next) {
    req[opts.userObject] = {}
    req[opts.userObject][opts.userObjectName] = req[opts.userName]
    next()
  }
}
