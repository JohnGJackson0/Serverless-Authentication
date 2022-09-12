const AWS = require("aws-sdk");
const TABLE_NAME = process.env.SESSION_TABLE_NAME;
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

/*
  curl --location --request PUT 'https://i17sjmwgtg.execute-api.us-east-1.amazonaws.com/dev/session/deactivate' \
  --header 'Content-Type: application/json' \
  --data-raw '{
      "sessionId":"896a3d3271a003ada91e48773deb9041ba29fdb65f1791d25894c9c63d33a693"
  }'
*/

// deactivate so session ids aren't reused
module.exports.deactivateSession = async (event, context, callback) => {
  const body = JSON.parse(event.body);
  const key = body.sessionId;

  const session = await dynamoDbClient
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

  console.log("the session", session);

  if (typeof session.Attributes.isActive !== "boolean") {
    callback(new Error("error setting inactive session"));
    console.error("error setting inactive session");
    return;
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({ ...session.Attributes, isActive: false }),
  };

  callback(null, response);
};
