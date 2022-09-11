const AWS = require("aws-sdk");
const TABLE_NAME = process.env.SESSION_TABLE_NAME;
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();
const { SHA256 } = require("crypto-js");
/*
  curl --location --request POST 'https://i17sjmwgtg.execute-api.us-east-1.amazonaws.com/dev/create' \
  --header 'Content-Type: application/json' \
  --data-raw '{
      "id": "2",
      "name": "John Jackson",
      "email": "JohnGJackson0@gmail.com"
  }'
*/

const generateId = (userId) => {
  const hashInput = `${Date.now()}${userId}${Math.floor(
    Math.random() * 100000
  )}`;
  const generatedId = SHA256(hashInput, { outputLength: 32 }).toString();
  return generatedId;
};

module.exports.createSession = async (event, context, callback) => {
  const user = JSON.parse(event.body);
  const sessionId = generateId(user.id);
  const currentTime = Date.now();

  const sessionInfo = {
    sessionId: sessionId,
    userId: user.id,
    sessionStartTimestamp: currentTime,
    isActive: true,
    expires: currentTime + 1000 * 60 * 60 * 24 * 14,
    userInfo: user,
  };

  try {
    await dynamoDbClient
      .put({
        TableName: TABLE_NAME,
        Item: sessionInfo,
      })
      .promise();
  } catch (e) {
    console.error(e);
    callback(new Error("error", e));
    return;
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify(user),
  };

  callback(null, response);
};
