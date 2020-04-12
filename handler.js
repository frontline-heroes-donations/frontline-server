'use strict';

const request = require('request-promise');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const CLASSY_API_HOST = 'https://api.classy.org';
const FRONTLINE_HEROES_CAMPAIGN_ID = 278629;

module.exports.donations = async event => {

  const page = event.queryStringParameters.page || 1;
  // console.log('page', page);
  const donations = await getDonations(page);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(
      // {
      //   message: 'Go Serverless v1.0! Your function executed successfully!',
      //   input: event,
      //   donations: donations
      // },
      donations,
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

const getDonations = async (page=1) => {
  const token = await getBearerToken();
  // curl --request GET 'https://api.classy.org/2.0/campaigns/278629/activity' -H "Accept: application/json" -H "Authorization: Bearer jDjGdeTticQBO7C3fAXg6aocIzI1o11b"
  const options = {
    uri: `${CLASSY_API_HOST}/2.0/campaigns/${FRONTLINE_HEROES_CAMPAIGN_ID}/activity?sort=created_at:desc&page=${page}`,
    headers: {
      Authorization: `Bearer ${token}`
    },
    json: true
  };
  // console.log(options);
  const response = await request(options);
  // console.log('response', response);
  const donations = response.data.map(donation => {
    const { id, created_at, member, link_text, transaction } = donation;
    const anonymous = transaction.is_anonymous;
    const name = anonymous ? null : `${member.first_name} ${member.last_name}`;
    return {
      id: id,
      name: name,
      createdAt: created_at,
      amount: link_text,
      comment: transaction.comment.trim()
    }
  });
  // console.log('donations', donations);

  return donations;
};

const getBearerToken = async () => {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  // 1/activity
  const options = {
    method: 'POST',
    uri: `${CLASSY_API_HOST}/oauth2/auth`,
    // qs: {
    //   grant_type: 'client_credentials',
    //   client_id: process.env.CLIENT_ID,
    //   client_secret: process.env.CLIENT_SECRET
    // },
    body: {
      grant_type: 'client_credentials',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET
    },
    headers: {
        // 'User-Agent': 'Request-Promise'
    },
    json: true // Automatically parses the JSON string in the response
  };
  // console.log(options);

  const response = await request(options);
  // console.log('response', response);
  return response.access_token;
};
