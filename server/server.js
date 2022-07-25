const express = require('express');
const path = require('path')
const {ApolloServer} = require('apollo-server-express')
const {authMiddleware} = require('./utils/auth')

const{typeDefs, resolvers} = require('./schemas')

const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
const app = express();

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    /* When you instantiate a new instance of ApolloServer, 
    you can pass in a context method that's set to return 
    whatever you want available in the resolvers. 
    here that is set to http headers
    context: ({req}) => req.headers
    set up middleware to handle this so every request performs authentication check
    */
    context: authMiddleware
  })
  
  await server.start()
  
  server.applyMiddleware({app})

  console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
}

startServer()

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

/* We just added two important pieces of code that will only come into effect when we go into production. First, we check to see if the Node environment is in production. If it is, we instruct the Express.js server to serve any files in the React application's build directory in the client folder. We don't have a build folder yet—because remember, that's for production only!
 The next set of functionality we created was a wildcard GET route for the server. In other words, if we make a GET request to any location on the server that doesn't have an explicit route defined, respond with the production-ready React front-end code
*/
//serve up static assets
if(process.env.NODE_ENV === 'production'){
  app.use(express.static(path.join(__dirname, '../client/build')))
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'))
})
 /*
 This would mean any route that hasn't been defined would be treated as a 404 and respond with your custom 404.html file.
 */
app.get('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, './public/404.html'));
});

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  });
});
