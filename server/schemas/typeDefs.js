// import the gql tagged template function
const { gql } = require('apollo-server-express');

// create our typeDefs
const typeDefs = gql`
type Thought {
    _id: ID
    thoughtText: String
    createdAt: String
    username: String 
    reactionCount: Int
    reactions: [Reaction]
    user: [User]
}
type Reaction {
    _id: ID
    reactionBody: String
    createdAt: String 
    username: String 
}
type User {
    _id: ID
    username: String 
    email: String 
    friendCount: Int 
    thoughts: [Thought]
    friends: [User]
}
type Auth {
    # must return token id
    token: ID!
    # can return any data from user object
    user: User
}
type Bag{
    copper: Int 
    silver: Int 
    gold: Int 
    platinum: Int
}
    type Query {
        # me query is scoped to credentials in jwt token
        me: User
        users: [User]
        user(username: String!): User
        thought(_id: ID!): Thought
        thoughts(username: String): [Thought]
        bag: Bag
    }
    type Mutation {
        # : type returns the type object login returns auth object
        login(email: String!, password: String!): Auth
        addUser(username: String!, email: String!, password: String!): Auth
        addThought(thoughtText: String!): Thought
        # Note that addReaction() will return the parent Thought instead of the newly created Reaction. 
        # This is because the front end will ultimately track changes on the thought level, not the reaction level. 
        addReaction(thoughtId: ID!, reactionBody: String!): Thought
        addFriend(friendId: ID!): User
        deleteThought(thoughtId: ID!): User
        createBag(copper: Int, silver: Int, gold: Int, platinum: Int): Bag
        addToBag(bagId: ID! amount: Int!): Bag
    }
`;

// export the typeDefs
module.exports = typeDefs;