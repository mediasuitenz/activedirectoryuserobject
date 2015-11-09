'use strict'

const ldapGroups = {
  andrew: ['group 1', 'group 2'],
  sam: ['group 1', 'group 3', 'dept 1']
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
