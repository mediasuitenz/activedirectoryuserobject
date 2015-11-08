'use strict'
const assert = require('assert')
const merge = require('merge')
const ActiveDirectory = require('activedirectory')
const messages = {
  urlRequired: 'config.url required',
  baseDNRequired: 'config.baseDN required',
  usernameRequired: 'config.username required',
  passwordRequired: 'config.password required'
}
const defaultOptions = {
  userName: 'username',
  userObject: 'user',
  userObjectName: 'name',
  properties: {}
}

module.exports = ldapuserobject

function ldapuserobject (config, options) {
  assert(config.url, messages.urlRequired)
  assert(config.baseDN, messages.baseDNRequired)
  assert(config.username, messages.usernameRequired)
  assert(config.password, messages.passwordRequired)

  const opts = merge(true, defaultOptions, options)
  const ad = new ActiveDirectory(config)

  return function (req, res, next) {
    req[opts.userObject] = {}
    req[opts.userObject][opts.userObjectName] = req[opts.userName]

    ad.getGroupMembershipForUser(req[opts.userName], function (err, groups) {
      if (err) return next()

      Object.keys(opts.properties).forEach(key => {
        req[opts.userObject][key] = groups.filter(group => opts.properties[key].values.indexOf(group) !== -1)
        if (req[opts.userObject][key].length === 0) req[opts.userObject][key] = null
        if (opts.properties[key].array === false) req[opts.userObject][key] = req[opts.userObject][key][0]
      })

      next()
    })
  }
}
