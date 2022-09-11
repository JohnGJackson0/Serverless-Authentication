const AWS = require("aws-sdk");
const TABLE_NAME = process.env.SESSION_TABLE_NAME;
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

/*
  curl --location --request PUT 'https://i17sjmwgtg.execute-api.us-east-1.amazonaws.com/dev/auth' \
  --header 'Content-Type: application/json' \
  --data-raw '{
      "sessionId": "896a3d3271a003ada91e48773deb9041ba29fdb65f1791d25894c9c63d33a693"
  }'
*/
module.exports.authenticateSession = async (event, context, callback) => {
  const currentTime = Date.now();
  const body = JSON.parse(event.body);
  const key = body.sessionId;

  const table = await dynamoDbClient
    .get({
      TableName: TABLE_NAME,
      Key: { sessionId: key },
    })
    .promise();

  let session = table.Item;

  if (typeof session.expires !== "number") {
    callback(new Error("Error finding session"));
    console.error("Error finding session");
    return;
  }

  if (currentTime >= session.expires) {
    if (session.isActive) {
      try {
        dynamoDbClient
          .update({
            TableName: TABLE_NAME,
            Key: { sessionId: key },
            ExpressionAttributeNames: {
              "#isActive": "isActive",
            },
            ExpressionAttributeValues: {
              ":isActive": false,
            },
            UpdateExpression: "SET #isActive = :isActive",
            ReturnValues: "ALL_NEW",
          })
          .promise();
      } catch (e) {
        callback(new Error("error setting inactive session", e));
        console.error("error setting inactive session", e);
        return;
      }

      const response = {
        statusCode: 200,
        body: JSON.stringify({ ...session, isActive: false }),
      };

      callback(null, response);
    }

    callback(null, session);
  }

  const newExpires = currentTime + 1000 * 60 * 60 * 24 * 14;

  try {
    dynamoDbClient
      .update({
        TableName: TABLE_NAME,
        Key: { sessionId: key },
        ExpressionAttributeNames: {
          "#expires": "expires",
        },
        ExpressionAttributeValues: {
          ":expires": newExpires,
        },
        UpdateExpression: "SET #expires = :expires",
        ReturnValues: "ALL_NEW",
      })
      .promise();
  } catch (e) {
    callback(new Error("error renewing", e));
    console.error("error renewing", e);
    return;
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({ ...session, expires: newExpires }),
  };

  callback(null, response);
};
