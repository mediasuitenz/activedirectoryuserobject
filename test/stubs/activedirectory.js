'use strict'

const ldapGroups = {
  andrew: [
    {
      dn: 'CN=Group 1,CN=Users,DC=mediasuite,DC=local',
      cn: 'group 1',
      description: ''
    },
    {
      dn: 'CN=Group 2,CN=Users,DC=mediasuite,DC=local',
      cn: 'group 2'
    },
    {
      dn: 'CN=Group 3,CN=Users,DC=mediasuite,DC=local',
      cn: 'group 3'
    }
  ],
  sam: [
    {
      dn: 'CN=Group 1,CN=Users,DC=mediasuite,DC=local',
      cn: 'group 1',
      description: ''
    },
    {
      dn: 'CN=Group 3,CN=Users,DC=mediasuite,DC=local',
      cn: 'group 3'
    },
    {
      dn: 'CN=Dept 1,CN=Users,DC=mediasuite,DC=local',
      cn: 'dept 1'
    }
  ]
}

class ActiveDirectory {
  constructor () {
    ActiveDirectory.calledCount = 0
  }
  getGroupMembershipForUser (username, cb) {
    ActiveDirectory.calledCount++
    cb(null, ldapGroups[username])
  }
}
ActiveDirectory.calledCount = 0

module.exports = ActiveDirectory
