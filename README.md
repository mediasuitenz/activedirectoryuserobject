# activedirectoryuserobject

Middleware to create a user object on req via data fetched from active directory.

[![NPM](https://nodei.co/npm/activedirectoryuserobject.png?downloads=true&stars=true)](https://nodei.co/npm/activedirectoryuserobject/)

[![Media Suite](http://mediasuite.co.nz/ms-badge.png)](http://mediasuite.co.nz)

[![Build Status](https://travis-ci.org/mediasuitenz/activedirectoryuserobject.svg)](https://travis-ci.org/mediasuitenz/activedirectoryuserobject)

## Installation

```
npm install activedirectoryuserobject --save
```

## Explanation

This middleware allows you to dynamically build a user object based on details fetched from active directory.

You need to ensure that a username is set on the request before this middleware in the middleware chain. If you are running on iis server via iisnode, you can add [iisuser](https://www.npmjs.com/package/iisuser) to your middleware chain before activedirectoryuserobject to have this done for you.

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
app.use(activedirectoryuserobject(config, options))
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

The first parameter to activedirectoryuserobject object is an activedirectory connection configuration object. It accepts 4 properties, all of which are compulsory.

```js
const config = {
  url: 'ldap://mediasuite.local',
  baseDN: 'dc=mediasuite, dc=local',
  username: 'manager@mediasuite.local',
  password: 'password'
}
```

## Options

The second parameter to activedirectoryuserobject is an options object. This allows you to configure what groups get looked up in activedirectory for a user, where to find the username on the request, what to call the key for the object that will be set on the request by activedirectoryuserobject and so on.

### userName

You can specify which property on the request activedirectoryuserobject should use to look for the username as follows:

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

### customParseFunction

By default, the common name (`cn`) will be parsed out of active directory results and used.

Eg. For each result in an array of activedirectory results, we grab the `cn` and throw away the rest.
```js
[{
  dn: 'CN=Group 2,CN=Users,DC=mediasuite,DC=local',
  cn: 'group 2'
},
...
]
```

For other requirements, you can use `customParseFunction` to set a parsing function that will be called for each result returned from activedirectory. This function will be passed the whole result record and you should simply return a value as desired.

Eg.
```js
const options = {
  userObjectName: obj => obj.dn
}
```

### Properties

The `properties` key allows you to set up any number of keyed groups for the user along with values to match on.

A good example use case is roles. Perhaps you have a set of roles your application cares about such as `manager`, `admin` and `editor`. You could create a properties key called `roles` with `values` `['manager', 'admin', 'editor']` then if the user being checked belongs to the activedirectory group `editor` and `writer` only the group `editor` will be used in the final user object as one of the user's roles.

In the following example, the key `groups` will be created, an activedirectory group query will be performed for the user and any groups found that match the values in the array `values` will be included.

```js
const options = {
  properties: {
    groups: {values: ['group 1', 'group 2', 'group 3']}
  }
}
```

So if in active directory the user belonged to groups `group 1` and `group 5` then the final object would look like:

```js
{
  name: 'jsmith',
  groups: ['group 1']
}
```

#### Single values instead of array

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

#### Getting all activedirectory groups

If you need all activedirectory groups to be returned, you can specify
`values: 'all'` instead of an array of possible values as follows.

```js
const options = {
  properties: {
    groups: {
      values: 'all'
    }
  }
}
```

And the resulting object will look something like:

```js
{
  name: 'jsmith',
  groups: ['group 1'. 'group 2', 'group 3']
}
```

### Caching

activedirectoryuserobject supports caching of user objects so that activedirectory is not hit on every request via a simple memory cache that will be wiped if you restart the server. Caching is disabled by default but can be enabled with the following options:

```js
const options = {
  useCache: true, // default false
  ttl: 1000 // in milliseconds
}
```

### Debugging

activedirectoryuserobject can output debugging information if desired.
To turn debugging on use the environment variable `DEBUG=activedirectoryuserobject`
On windows this can be set from the console like so:
```
set DEBUG=activedirectoryuserobject
```
