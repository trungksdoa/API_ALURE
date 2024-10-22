// const { I } = inject();
// const Joi = require("joi");
// import allurePlugin from "allure-codeceptjs";
// //Add this line
// const allure = allurePlugin({
//   resultsDir: "./allure-results",
//   reportDir: "./allure-report",
// });

// const {
//   epic,
//   feature,
//   story,
//   step,
//   displayName,
//   label,
//   parameter,
//   issue,
//   tms,
//   owner,
//   severity,
//   layer,
//   tag,
//   description,
//   descriptionHtml,
//   testCaseId,
//   historyId,
//   allureId,
//   parentSuite,
//   subSuite,
//   attachment,
// } = allure;
// Feature('Order API Tests');

// let authToken = '';

// Before(async ({ I }) => {
//   allure.epic('API Testing');
//   allure.feature('Order Management');

//   const loginResponse = await I.sendPostRequest("/api/users/auth/login", {
//     email: "user@example.com",
//     password: "userpassword",
//   });

//   I.seeResponseCodeIsSuccessful();
//   authToken = loginResponse.data.data.accessToken;
//   I.amBearerAuthenticated(authToken);
// });

// Scenario('Create a New Order', async ({ I }) => {
//   allure.story('Create Order');
  
//   const orderData = {
//     fullName: "John Doe",
//     phone: "1234567890",
//     address: "123 Test St, Test City"
//   };

//   const response = await I.sendPostRequest('/api/orders/create-product-order', orderData);
  
//   I.seeResponseCodeIsSuccessful();
//   I.seeResponseContainsJson({
//     message: "Order created successfully"
//   });
// });

// Scenario('Cancel a Pending Order', async ({ I }) => {
//   allure.story('Cancel Order');
  
//   const userId = 1; // Replace with a valid user ID
//   const orderId = 1; // Replace with a valid order ID

//   const response = await I.sendDeleteRequest(`/api/orders/user/${userId}/order/${orderId}`);
  
//   I.seeResponseCodeIsSuccessful();
//   I.seeResponseContainsJson({
//     message: "Order cancelled successfully"
//   });
// });

// After(async ({ I }) => {
//   authToken = '';
// });