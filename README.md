# BE-NC-News

This repository contains a RESTful API  built using Node.js (v8.10.0), for a Reddit-style website called Northcoders News which features topics, articles, comments and users. For more information on the functionality of the API, see the routes available below. 

The deployed version can be viewed [here](https://be-nc-news-anat.herokuapp.com/api).
____________

## SetUp Guide
____________

### Prerequisites:
* node
* npm
* mongoDB

Check you have the prerequisites installed with the following terminal commands:

```js
node -v     // should return a number
npm --v     // should return a number
mongo --version  // should return a number
```

Check you have git installed:
```js
git --version   // should return a number
```

If all of these commands run successfully,  then go ahead and clone this repository with the command:
```js
git clone https://github.com/AnatDean/BE-NC-News.git
```
Navigate into the cloned repository, then install all dependencies with

```js
 npm i
```
______

## Running Locally
______

Before you start, in the root directory of this project you should create a 'config' folder with the following files inside which will allow you to seed the databases, run, and test the api:
* index.js
* dev.js
* test.js

Now copy the code snippets below into their relevant files:


index.js:
____
```js
module.exports = require(`./${process.env.NODE_ENV}.js`)
 ```

test.js / dev.js
___
```js
//dev:
module.exports = {
  PORT: 9090,
  DB: 'mongodb://localhost:27017/nc-news'
}
//test:
module.exports = {
  PORT: 9000,
  DB: 'mongodb://localhost:27017/nc-news-test'
}
```

### Start MongoDB:

In your terminal start the mongo server using the command:
```js
mongod
```

______
## Testing
______
To test the endpoints on your local machine and ensure everything has been configured correctly use the command:
```js
npm t
```
____

If all tests have passed you can now proceed to run the API locally:


In a new terminal window, seed the development database:
```js
npm run seed:dev
```



You can then run the server on your local machine using:
```js
npm run dev
```
This will allow the API to be accessed through port 9090.


## Routes
___
### **GET /api**
Serves an HTML page with documentation for all the available endpoints

### **GET /api/topics**
Get all the topics

### **GET /api/topics/:topic_id/articles**
Return all the articles for a certain topic

### **POST /api/topics/:topic_id/articles**
Add a new article to a topic. This route requires a JSON body with a title and body key and value pair
e.g: 
```js
{
  "title": "This is my article title",
  "body": "This is my article body"
}
```

### **GET /api/articles**
Returns all the articles

### **GET /api/articles/:article_id**
Returns all an individual article with its comments

### **POST /api/articles/:article_id**
Add a new comment to an article. This route requires a JSON body with a message key and value pair
e.g: 
```js
{"message": "This is my new comment"}
```

### **PUT /api/articles/:article_id**
Increment or Decrement the votes of an article by one. This route requires a vote query of 'up' or 'down' e.g: 

    /api/articles/:article_id?vote=up

### **PUT /api/comments/:comment_id**
Increment or Decrement the votes of a comment by one. This route requires a vote query of 'up' or 'down' e.g: 

    /api/comments/:comment_id?vote=down

### **DELETE /api/comments/:comment_id**
Deletes a comment

### **GET /api/users/:username**
Returns a JSON object with the profile data for the specified user.