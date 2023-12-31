const { User } = require('../models');
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
    Query: {
        me: async () => {
            return User.find({});
        },
    },
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('No user found with this email address');
            } 
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const token = signToken(user);
            return { token, user };
        },
        addUser: async (parent, {username, email, password}) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, {bookId}, context) => {
            if (context.user) {
                const bookList = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$addToSet: {savedBooks: bookId}},
                    {new: true}
                );
                return bookList;
            }
            throw new AuthenticationError('Need to login first.');
        },
        removeBook: async (parent, {bookId}, context) => {
            if (context.user) {
                const bookList = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$addToSet: {savedBooks: bookId}},
                    {new: true}
                )
                return bookList;
            }
            throw new AuthenticationError('Need to login first.');
        }
    }
}

module.exports = resolvers;