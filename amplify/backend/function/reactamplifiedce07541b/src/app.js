/* Amplify Params - DO NOT EDIT
	API_REACTAMPLIFIED_GRAPHQLAPIENDPOINTOUTPUT
	API_REACTAMPLIFIED_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

const axios = require('axios');
const { aws4Interceptor } = require('aws4-axios');

const gql = require('graphql-tag');
const graphql = require('graphql');
const { print } = graphql;

const interceptor = aws4Interceptor({
  region: process.env.REGION,
  service: 'appsync',
});
axios.interceptors.request.use(interceptor);

var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

app.use(function(_req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

const fetch = async (query, params) => {
  const request = {
    url: process.env.API_REACTAMPLIFIED_GRAPHQLAPIENDPOINTOUTPUT,
    method: 'post',
    data: {
      query: print(query),
    }
  };

  if (params) {
    request.data.variables = {
      input: params,
    };
  }

  console.debug('Running GraphQL query', request);
  const response = await axios(request);

  console.debug('GraphQL response', response.data);

  return response.data.data;
};

app.get('/users', async (_req, res) => {
  console.debug('get /users');
  const listUsers = gql`
    query ListUsers(
      $filter: ModelUserFilterInput
      $limit: Int
      $nextToken: String
    ) {
      listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
        items {
          id
          name
          mobile
          email
          pushToken
          createdAt
          updatedAt
        }
        nextToken
      }
    }
  `;

  const response = await fetch(listUsers);

  console.debug('got /users');
  res.json(response.listUsers);
});

app.post('/users', async (req, res) => {
  console.debug(req.apiGateway);
  const { apiGateway: { event: { requestContext: { identity: { cognitoAuthenticationProvider } } } } } = req;

  const userId = cognitoAuthenticationProvider.match(/CognitoSignIn:([a-z0-9-]+)/)[1];

  console.debug('post /users', userId);
  const createUser = gql`
    mutation CreateUser(
      $input: CreateUserInput!
      $condition: ModelUserConditionInput
   ) {
     createUser(input: $input, condition: $condition) {
       id
       name
       mobile
       email
       pushToken
       createdAt
       updatedAt
    }
  }
`;
  const params = {
    name: 'John Ferlito',
    mobile: '+639171234567',
    email: 'johnf@inodes.org',
    pushToken: 'jksahgjashfkjadhg',
    ownerId: userId,
  };

  const response = await fetch(createUser, params);

  console.debug('GOT', response);

  res.json(response.createUser);
});

app.listen(3000, function() {
    console.log("App started")
});

module.exports = app
