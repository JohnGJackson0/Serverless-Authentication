# Authentication

This will use serverless to create and keep track of user authentication. 

The method for authentication is sessions. We pass a session ID to each endpoint requiring authentication and it will check dynamoDB for if the session is activated. 

We must keep track of users, emails, ect. so that we can check, create sessions and authorize them to use the endpoints. 

We will use this boilerplate in a social media application. 

## Why Serverless?

Serverless provides automatic Horizontal scaling, removes the need for developers to work with and manage their own servers, is generally easier to optimize to save money in the future, and is more reusable. Enhanced security, complexity, contracts, ect. would be reasons to NOT use serverless. 

## Why MicroServices?

Say we where to work in a MERN application for a large production application. We have multiple teams working together in a single codebase. Instead if we split each domain and teams apart into seperated services each would need to communicate less which increases productivity, developer satisfaction and allows teams more intune with specific problems in a given domain. Microservices need to not bleed implimentations and define strict contracts between each so that one team doesn't potentially break another teams service. The con would be that it is more complex for smaller applications. 