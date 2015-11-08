# ldapuserobject

Middleware to create a user object on req via data fetched from active directory.

[![NPM](https://nodei.co/npm/ldapuserobject.png?downloads=true&stars=true)](https://nodei.co/npm/ldapuserobject/)

[![Media Suite](http://mediasuite.co.nz/ms-badge.png)](http://mediasuite.co.nz)

[![Build Status](https://travis-ci.org/mediasuitenz/ldapuserobject.svg)](https://travis-ci.org/mediasuitenz/ldapuserobject)

## Installation

```
npm install ldapuserobject --save
```

## Explanation

This middleware allows you to dynamically build a user object based on details fetched from active directory.

You need to ensure that a username is set on the request before this middleware in the middleware chain. If you are running on iis server via iisnode, you can add [iisuser](https://www.npmjs.com/package/iisuser) to your middleware chain before ldapuserobject to have this done for you.

You can then configure the name of the username property on the request. (See below for more details)

## Basic example usage

```js
const config = {
  url: 'ldap://mediasuite.local',
  baseDN: 'dc=mediasuite, dc=local',
  username: 'manager@mediasuite.local',
  password: 'password'
}
const options = {
  properties: {
    groups: {values: ['group 1', 'group 2', 'group 3']}
  }
}

app.use((req, res, next) => {
  //get username from somewhere and set on the request
  req.username = 'jsmith'
  next()
})
app.use(ldapuserobject(config, options))
```

Assuming that the active directory lookup found that user `jsmith` belonged to several groups one of which was `group 1`, after this middleware has run, a user object will be set on the request that looks something like:

```js
//req.user
{
  name: 'jsmith',
  groups: ['group 1']
}
```

## Configuration

The first parameter to ldapuserobject object is an activedirectory connection configuration object. It accepts 4 properties, all of which are compulsory.

```js
const config = {
  url: 'ldap://mediasuite.local',
  baseDN: 'dc=mediasuite, dc=local',
  username: 'manager@mediasuite.local',
  password: 'password'
}
```

## Options

The second parameter to ldapuserobject is an options object. This allows you to configure what groups get looked up in activedirectory for a user, where to find the username on the request, what to call the key for the object that will be set on the request by ldapuserobject and so on.

### userName

You can specify which property on the request ldapuserobject should use to look for the username as follows:

```js
const options = {
  userName: 'user'
}
```
This value defaults to `username`

### userObject

You can specify which property should be created on the request to hold the created user object as follows:

```js
const options = {
  userObject: 'userObject'
}
```
This value defaults to `user`

### userObjectName

You can specify what the user `name` property will be called on the user object as follows:

```js
const options = {
  userObjectName: 'username'
}
```
This value defaults to `name`

### Properties

The `properties` key allows you to set up any number of groups for the user allow with values to match on.

In the following example, the key `groups` will be created, an activedirectory group query will be performed for the user and any groups found that match the values in the array `values` will be included.

```js
const options = {
  properties: {
    groups: {values: ['group 1', 'group 2', 'group 3']}
  }
}
```

So if in active directoy the user belonged to groups `group 1` and `group 5` then the final object would look like:

```js
{
  name: 'jsmith',
  groups: ['group 1']
}
```

If are only looking to get back a single value, we can specify `array: false` in our configuration as follows.

```js
const options = {
  properties: {
    groups: {
      values: ['group 1', 'group 2', 'group 3'],
      array: false
    }
  }
}
```

And the resulting object will look like:

```js
{
  name: 'jsmith',
  groups: 'group 1'
}
```

Note, the groups value in the above example will be the first matching group.
