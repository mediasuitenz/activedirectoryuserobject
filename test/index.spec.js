'use strict'
/* global describe, Given, When, Then */
const ldapuserobject = require('../index')
const expect = require('chai').expect
const config = {
  url: 'ldap://mediasuite.local',
  baseDN: 'dc=mediasuite, dc=local',
  username: 'manager@mediasuite.local',
  password: 'password'
}
let req, middleware, options

describe('ldapuserobject middleware', () => {
  describe('called with no connection details', () => {
    Then(function () { expect(ldapuserobject).to.throw(Error) })
  })

  describe('called with connection details and no options', () => {
    Given(() => req = {username: 'andrew'})
    When(() => middleware = ldapuserobject(config))
    When(done => middleware(req, {}, done))
    Then(function () { expect(req.user.name).to.equal('andrew') })
  })

  describe('called with connection details and userName option', () => {
    Given(() => req = {logon: 'andrew'})
    Given(() => options = {userName: 'logon'})
    When(() => middleware = ldapuserobject(config, options))
    When(done => middleware(req, {}, done))
    Then(function () { expect(req.user.name).to.equal('andrew') })
  })

  describe('called with connection details and userObject option', () => {
    Given(() => req = {username: 'andrew'})
    Given(() => options = {userObject: 'userObject'})
    When(() => middleware = ldapuserobject(config, options))
    When(done => middleware(req, {}, done))
    Then(function () { expect(req.userObject.name).to.equal('andrew') })
  })

  describe('called with connection details and userObject option', () => {
    Given(() => req = {username: 'andrew'})
    Given(() => options = {userObjectName: 'username'})
    When(() => middleware = ldapuserobject(config, options))
    When(done => middleware(req, {}, done))
    Then(function () { expect(req.user.username).to.equal('andrew') })
  })
})
