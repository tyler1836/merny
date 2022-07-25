const { User, Thought, Bag } = require('../models')
const { AuthenticationError } = require('apollo-server-express')
//import token signing from utils
const { signToken } = require('../utils/auth')

const resolvers = {
    Query: {
        thoughts: async (parent, { username }) => {
            const params = username ? { username } : {}
            return Thought.find(params).sort({ createdAt: -1 }).populate('users')
        },
        thought: async (parent, { _id }) => {
            return Thought.findOne({ _id })
        },
        // get all users
        users: async () => {
            return User.find()
                .select('-__v -password')
                .populate('friends')
                .populate('thoughts');
        },
        // get a user by username
        user: async (parent, { username }) => {
            return User.findOne({ username })
                .select('-__v -password')
                .populate('friends')
                .populate('thoughts');
        },
        /*
        context gives access to multitude of things for me query we use context for access to headers for jwt token
        me is a query for seeing your own data
        must be logged in with valid jwt token
        */
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')
                    .populate('thoughts')
                    .populate('friends');

                return userData;
            }

            throw new AuthenticationError('Not logged in!')
        },
        bag: async () => {
            const bagData = await Bag.findOne({})

            return bagData
        }
    },
    // mutations use mongoose schema methods for this project since we are using mongoose with mongodb
    Mutation: {
        addUser: async (parent, args) => {
            // args are the variables from graphql
            const user = await User.create(args)
            //set up jwt token
            const token = signToken(user)

            return { token, user }
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email })

            if (!user) {
                throw new AuthenticationError('Incorrect credentials')
            }

            const correctPw = await user.isCorrectPassword(password)

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials')
            }

            const token = signToken(user)
            return { token, user }
        },
        addThought: async (parent, args, context) => {
            //check for user to be logged in to add a thought add args and username when created
            if (context.user) {
                const thought = await Thought.create({ ...args, username: context.user.username });

                await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { thoughts: thought._id } },
                    //without new true mongo sends back original document not updated one
                    { new: true }
                );

                return thought;
            }

            throw new AuthenticationError('You need to be logged in!');
        },
        addReaction: async (parent, { thoughtId, reactionBody }, context) => {
            if (context.user) {
                const updatedThought = await Thought.findOneAndUpdate(
                    { _id: thoughtId },
                    { $push: { reactionBody, username: context.user.username } },
                    { new: true, runValidators: true }
                )
                return updatedThought
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        addFriend: async (parent, { friendId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { friends: friendId } },
                    { new: true }
                ).populate('friends');

                return updatedUser;
            }

            throw new AuthenticationError('You need to be logged in!');
        },
        createBag: async (parent, args) => {
            const createdBag = await Bag.create(args)
            return createdBag
        },
        addToBag: async (parent, args, context) => {
            //grab model first to have access to properties if needing to add or subtract certain amounts
            const bag = await Bag.findById({_id: args.bagId})
            
            const updatedBag = await Bag.findByIdAndUpdate(
                {_id: args.bagId},
                {silver: (bag.silver - args.amount)},
                {new: true}
            )
            return updatedBag
        },
        deleteThought: async (parent, args, context) => {
            
            const thought = await Thought.deleteOne({_id: args.thoughtId})

            return thought
        }
    }
}

module.exports = resolvers