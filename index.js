'use strict'
const assert = require('assert')
const merge = require('merge')
const ActiveDirectory = require('activedirectory')
const cache = require('memory-cache')
const messages = {
  urlRequired: 'config.url required',
  baseDNRequired: 'config.baseDN required',
  usernameRequired: 'config.username required',
  passwordRequired: 'config.password required',
  valuesRequired: 'properties.values required'
}
const defaultOptions = {
  userName: 'username',
  userObject: 'user',
  userObjectName: 'name',
  properties: {},
  useCache: false,
  customParseFunction: null
}
const debug = require('debug')('activedirectoryuserobject')

module.exports = activedirectoryuserobject

function activedirectoryuserobject (config, options) {
  assert(config.url, messages.urlRequired)
  assert(config.baseDN, messages.baseDNRequired)
  assert(config.username, messages.usernameRequired)
  assert(config.password, messages.passwordRequired)

  const opts = merge(true, defaultOptions, options)
  debug(`activedirectoryuserobject options object: ${JSON.stringify(opts)}`)

  const ad = new ActiveDirectory(config)
  debug(`Connected to ActiveDirectory using credentials: ${JSON.stringify}`)

  return function (req, res, next) {
    if (opts.useCache) {
      if (cache.get(req[opts.userName])) {
        req[opts.userObject] = cache.get(req[opts.userName])
        debug(`Fetched user object from cache:
          ${JSON.stringify(req[opts.userObject])}`)
        return next()
      }
    }

    req[opts.userObject] = {}
    req[opts.userObject][opts.userObjectName] = req[opts.userName]

    ad.getGroupMembershipForUser(req[opts.userName], function (err, groups) {
      if (err) return next()
      debug(`Raw groups fetched from ActiveDirectory for user
        ${req[opts.userName]}: ${JSON.stringify(groups)}`)

      const defaultParsingFunction = group => group.cn
      groups = groups.map(opts.customParseFunction || defaultParsingFunction)
      debug(`Raw ActiveDirectory groups parsed into ${JSON.stringify(groups)}`)

      Object.keys(opts.properties).forEach(key => {
        assert(opts.properties[key].values, messages.valuesRequired)
        debug(`Building group '${key}'`)

        req[opts.userObject][key] = groups

        const groupFilter = group => opts.properties[key].values.indexOf(group) !== -1
        if (opts.properties[key].values !== 'all') {
          debug(`Filtering groups to only results that match:
            ${JSON.stringify(opts.properties[key].values)}`)
          req[opts.userObject][key] = groups.filter(groupFilter)
        }

        if (req[opts.userObject][key].length === 0) {
          debug(`No matches after filtering, setting ${key} to null`)
          req[opts.userObject][key] = null
        }

        if (opts.properties[key].array === false) {
          debug(`Returning only first result for group '${key}':
            ${req[opts.userObject][key][0]}`)
          req[opts.userObject][key] = req[opts.userObject][key][0]
        }
      })

      if (opts.useCache) {
        debug(`Inserting user object into cache. Cache will expire in ${opts.ttl} ms`)
        cache.put(req[opts.userName], req[opts.userObject], opts.ttl)
      }

      debug(`User object set on request at req.${opts.userObject}: ${JSON.stringify(req[opts.userObject])}`)
      next()
    })
  }
}
