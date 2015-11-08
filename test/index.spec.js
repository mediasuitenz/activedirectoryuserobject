'use strict'
/* global describe, Given, When, Then, And */
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const config = {
  url: 'ldap://mediasuite.local',
  baseDN: 'dc=mediasuite, dc=local',
  username: 'manager@mediasuite.local',
  password: 'password'
}
const adStub = require('./stubs/activedirectory')
const ldapuserobject = proxyquire('../index', {activedirectory: adStub})
let req, middleware, options

describe('ldapuserobject middleware', () => {
  describe('called with no connection details', () => {
    Then(function () { expect(ldapuserobject).to.throw(Error) })
  })

  describe('called with no options', () => {
    Given(() => req = {username: 'andrew'})
    When(() => middleware = ldapuserobject(config))
    When(done => middleware(req, {}, done))
    Then(function () { expect(req.user.name).to.equal('andrew') })
  })

  describe('called with userName option', () => {
    Given(() => req = {logon: 'andrew'})
    Given(() => options = {userName: 'logon'})
    When(() => middleware = ldapuserobject(config, options))
    When(done => middleware(req, {}, done))
    Then(function () { expect(req.user.name).to.equal('andrew') })
  })

  describe('called with userObject option', () => {
    Given(() => req = {username: 'andrew'})
    Given(() => options = {userObject: 'userObject'})
    When(() => middleware = ldapuserobject(config, options))
    When(done => middleware(req, {}, done))
    Then(function () { expect(req.userObject.name).to.equal('andrew') })
  })

  describe('called with userObject option', () => {
    Given(() => req = {username: 'andrew'})
    Given(() => options = {userObjectName: 'username'})
    When(() => middleware = ldapuserobject(config, options))
    When(done => middleware(req, {}, done))
    Then(function () { expect(req.user.username).to.equal('andrew') })
  })

  describe('called with 1 properties key and no matching groups', () => {
    Given(() => req = {username: 'andrew'})
    Given(() => options = {properties: {groups: {values: []}}})
    When(() => middleware = ldapuserobject(config, options))
    When(done => middleware(req, {}, done))
    Then(function () { expect(req.user.groups).to.be.null })
  })

  describe('called with 1 properties key and 2 matching groups', () => {
    Given(() => req = {username: 'andrew'})
    Given(() => options = {properties: {groups: {values: ['group 1', 'group 2']}}})
    When(() => middleware = ldapuserobject(config, options))
    When(done => middleware(req, {}, done))
    Then(function () { expect(req.user.groups.length).to.equal(2) })
    Then(function () { expect(req.user.groups[0]).to.equal('group 1') })
  })

  describe('called with 1 properties key and 1 matching group', () => {
    Given(() => req = {username: 'sam'})
    Given(() => options = {properties: {groups: {values: ['group 1', 'group 2']}}})
    When(() => middleware = ldapuserobject(config, options))
    When(done => middleware(req, {}, done))
    Then(function () { expect(req.user.groups.length).to.equal(1) })
    Then(function () { expect(req.user.groups[0]).to.equal('group 1') })
  })

  describe('expecting group to be a single value', () => {
    Given(() => req = {username: 'sam'})
    Given(() => options = {properties: {group: {values: ['group 1', 'group 2'], array: false}}})
    When(() => middleware = ldapuserobject(config, options))
    When(done => middleware(req, {}, done))
    Then(function () { expect(req.user.group).to.equal('group 1') })
  })
})
