const { GraphQLScalarType } = require('graphql')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const nodeMailer = require('nodemailer')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const { User, Folder, Team, Group, Record, Task } = require('./models')
const { getUserId } = require('./utils')
const { welcomeEmail, invitationEmail, notificationNewUser } = require('./emails')

const JWT_SECRET = process.env.JWT_SECRET

const transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.FROM_EMAIL,
      pass: process.env.GMAIL_PASSWORD
    }
})

async function folderCommon(context, parent, name, shareWith) {
  const userId = getUserId(context)
  return {
    name,
    parent: parent || undefined,
    shareWith: shareWith.concat(parent ? [] : [{
      kind: 'Team',
      item: (await User.findById(userId)).team
    }])
  }
}

async function deleteSubTasks(id) {
  const tasks = await Task.find({parent: id})
  for (const task of tasks) {
    await deleteSubTasks(task.id)
    await Task.deleteOne({_id: task.id})
  }
}

function populateTask(promise) {
  return promise
    .populate('folders', 'name')
    .populate('parent', 'name')
    .populate('assignees', 'name email firstname lastname avatarColor')
    .populate('creator', 'name email firstname lastname')
}

function randomChoice(arr) {
  return arr[Math.floor(arr.length * Math.random())]
}

const avatarColors = [
  "D81B60","F06292","F48FB1","FFB74D","FF9800","F57C00","00897B","4DB6AC","80CBC4",
  "80DEEA","4DD0E1","00ACC1","9FA8DA","7986CB","3949AB","8E24AA","BA68C8","CE93D8"
]

const resolvers = {
  Query: {
    async getTeam (_, args, context) {
      const userId = getUserId(context)
      const user = await User.findById(userId)
      return await Team.findById(user.team)
    },
    async getGroups (_, args, context) {
      const userId = getUserId(context)
      const team = (await User.findById(userId)).team
      return await Group.find({team}).sort({ createdAt: -1 })
      return group
    },
    async getGroup (_, {id}, context) {
      const userId = getUserId(context)
      const group = await Group.findById(id).populate('users')
      return group
    },
    async getFolders (_, {parent}, context) {
      const userId = getUserId(context)
      let folders
      if (parent) {
        folders = await Folder.find({parent})
      } else {
        const user = await User.findById(userId)
        const groups = await Group.find({users: ObjectId(userId)}, '_id')
        const ids = groups.map(o => o._id).concat(
          ['External User', 'Collaborator'].includes(user.role)
          ? [ObjectId(userId)]
          : [ObjectId(userId), user.team]
        )
        folders = await Folder.find({ 'shareWith.item': ids }).populate('shareWith')
      }
      return folders
    },
    async getFolder (_, args, context) {
      const userId = getUserId(context)
      return await Folder.findById(args.id).populate('shareWith')
    },
    async getTasks (_, {parent, folder}, context) {
      if (parent) {
        return await populateTask(Task.find({ parent })).sort({ createdAt: 1 })
      } else {
        return await populateTask(Task.find({ folders: folder })).sort({ createdAt: -1 })
      }
    },
    async getTask (_, {id}, context) {
      const userId = getUserId(context)
      const task = await populateTask(Task.findById(id))
      if (!task) {
        throw new Error('Task with that id does not exist')
      }
      return task
    },
    async getUsers (_, args, context) {
      const userId = getUserId(context)
      const team = (await User.findById(userId)).team
      return await User.find({team})
    },
    async getUser (_, {id}, context) {
      const userId = getUserId(context)
      return await User.findById(id || userId)
    },
    async getRecord (_, {id, task, date}, context) {
      const user = getUserId(context)
      if (id) {
        return await Record.findById(id)       
      } else {
        return await Record.findOne({
          user,
          task,
          date: {
            $gte: moment(date).startOf('day'),
            $lte: moment(date).endOf('day')
          }
        })
      }
    }
  },
  Mutation: {
    async createTask(_, {folder, parent, name}, context) {
      const userId = getUserId(context)
      const task = await Task.create({
        name,
        parent,
        folders: folder ? [folder] : [],
        creator: userId
      })
      return await populateTask(Task.findById(task.id))
    },
    async updateTask(_, {id, input}, context) {
      const userId = getUserId(context)
      return await populateTask(Task.findOneAndUpdate(
        { _id: id },
        { $set: input },
        { new: true }
      ))
    },
    async deleteTask(_, {id}, context) {
      const userId = getUserId(context)
      await Task.deleteOne({_id: id})
      deleteSubTasks(id)
      return true
    },
    async createFolder(_, {parent, name, shareWith}, context) {
      const folder = await Folder.create(await folderCommon(context, parent, name, shareWith))
      return await Folder.findById(folder.id).populate('shareWith.item')
    },
    async updateFolder(_, {id, input}, context) {
      const userId = getUserId(context)
      return await Folder.findOneAndUpdate(
        { _id: id },
        { $set: input },
        { new: true }
      ).populate('shareWith')
    },
    async deleteFolder(_, {id}, context) {
      const userId = getUserId(context)
      await Folder.deleteOne({_id: id})
      return true
    },
    async captureEmail (_, {email}) {
      const isEmailTaken = await User.findOne({email})
      if (isEmailTaken) {
        throw new Error('This email is already taken')
      }
      const user = await User.create({
        email,
        role: 'Owner',
        status: 'Pending'
      })
      transporter.sendMail(welcomeEmail(email, user))
      transporter.sendMail(notificationNewUser(email, user))

      return user
    },
    async invite (_, {emails, groups, role}, context) {
      const userId = getUserId(context)
      const thisUser = await User.findById(userId)
      const team = thisUser.team
      const teamMembers = (await User.find({team}, 'email')).map(o => o.email)
      const users = []
      for (const email of emails) {
        if (teamMembers.includes(email)) {
        } else {
          const user = await User.create({
            email,
            team,
            role,
            status: 'Pending'
          })
          users.push(user)
          transporter.sendMail(invitationEmail(email, user, thisUser))
        }
      }
      const userIds = users.map(o => o.id)
      for (const id of groups) {
        const group = await Group.findById(id)
        group.users = userIds
        await group.save()
      }
      return users
    },
    async decline (_, {id}) {
      await User.findOneAndUpdate(
        { _id: id },
        { $set: { status: 'Declined' } },
      )
      return true
    },
    async signup (_, {id, firstname, lastname, password}) {
      const user = await User.findById(id)
      const common = {
        firstname,
        lastname,
        name: `${firstname} ${lastname}`,
        avatarColor: randomChoice(avatarColors),
        password: await bcrypt.hash(password, 10),
        status: 'Active'
      }
      if (user.role === 'Owner') {
        const team = await Team.create({
          name: `${common.name}'s Team`
        })
        user.set(Object.assign(common, {
          team: team.id,
          jobTitle: 'CEO/Owner/Founder'
        }))
      } else {
        user.set(common)
      }
      await user.save()
      const token = jwt.sign({id: user.id, email: user.email}, JWT_SECRET)
      return {token, user}
    },
    async login (_, {email, password}) {
      const user = await User.findOne({email})
      if (!user) {
        throw new Error('No user with that email')
      }
      const valid = await bcrypt.compare(password, user.password)
      if (!valid) {
        throw new Error('Incorrect password')
      }
      const token = jwt.sign({id: user.id, email}, JWT_SECRET)
      return {token, user}
    },
    async createGroup (_, {name, initials, avatarColor, users}, context) {
      const userId = getUserId(context)
      const team = (await User.findById(userId)).team
      return await Group.create({
        name,
        team,
        initials,
        avatarColor,
        users
      })
    },
    async addUsersToGroup (_, {id, users}, context) {
      const userId = getUserId(context)
      return await Group.findOneAndUpdate(
        { _id: id },
        { $push: { users: { $each: users } } },
        { new: true }
      )
    },
    async removeUsersFromGroup (_, {id, users}, context) {
      const userId = getUserId(context)
      return await Group.findOneAndUpdate(
        { _id: id },
        { $pullAll: { users } },
        { new: true }
      )
    },
    async updateGroup (_, {id, name, initials, avatarColor}, context) {
      const userId = getUserId(context)
      return await Group.findOneAndUpdate(
        { _id: id },
        { $set: { name, initials, avatarColor } },
        { new: true }
      )
    },
    async deleteGroup (_, {id}, context) {
      const userId = getUserId(context)
      await Group.deleteOne({_id: id})
      return true
    },
    async updateUser(_, {id, input}, context) {
      const userId = getUserId(context)
      return await User.findOneAndUpdate(
        { _id: id },
        { $set: input },
        { new: true }
      )
    },
    async createRecord (_, {input}, context) {
      const user = getUserId(context)
      return await Record.create({
        ...input,
        user
      })
    },
    async updateRecord (_, {id, input}, context) {
      const userId = getUserId(context)
      return await Record.findOneAndUpdate(
        { _id: id },
        { $set: input },
        { new: true }
      )
    },
    async deleteRecord (_, {id}, context) {
      const userId = getUserId(context)
      await Record.deleteOne({_id: id})
      return true      
    }
  },
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue: (value) => moment(value).toDate(), // value from the client
    serialize: (value) => value.getTime(), // value sent to the client
    parseLiteral: (ast) => ast
  })
}

module.exports = resolvers
