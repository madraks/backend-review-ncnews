# Backend Review README
This NC News API uses express.js, PSQL and Node.js. It allows you to retrieve and manipulate data related to articles, comments, topics, and users. You can use this API to:
- View a list of all articles, with the option to filter by topic
- View all comments associated with a particular article by its ID
- Post new comments aswell as upvote/downvote existing comments
- Delete existing comments
- A file called endpoints.json will discuss each endpoint in full

## Prerequisites
- Node.js v20.5.0
- PostgreSQL v14.9

## How to get started
1. git clone [this repo](https://github.com/madraks/backend-review-ncnews)
2. cd backend-review-ncnews
3. npm install
4. npm run setup-dbs
5. npm run seed

## Setting up your files
1. create a `.env.development` file and `.env.test` file in the highest directory level
2. In the development file insert the line `PGDATABASE=nc_news`
3. In the test file insert the line `PGDATABASE=nc_news_test`

## Run!
If you would like to run some tests to ensure your environment is set up run the command `npm run test`

## Link to Live version
https://nc-news-madraks.onrender.com/api 