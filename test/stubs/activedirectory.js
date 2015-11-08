'use strict'

const ldapGroups = {
  andrew: ['group 1', 'group 2'],
  sam: ['group 1', 'group 3']
}

class ActiveDirectory {
  getGroupMembershipForUser (username, cb) {
    cb(null, ldapGroups[username])
  }
}

module.exports = ActiveDirectory
