'use strict'

const ldapGroups = {andrew: ['group 1', 'group 2']}

class ActiveDirectory {
  getGroupMembershipForUser (username, cb) {
    cb(null, ldapGroups[username])
  }
}

module.exports = ActiveDirectory
