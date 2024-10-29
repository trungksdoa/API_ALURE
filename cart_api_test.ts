const { I } = inject();
const Joi = require("joi");
import allurePlugin from "allure-codeceptjs";
//Add this line
const allure = allurePlugin({
  resultsDir: "./allure-results",
  reportDir: "./allure-report",
});

const {
  epic,
  feature,
  story,
  step,
  displayName,
  label,
  parameter,
  issue,
  tms,
  owner,
  severity,
  layer,
  tag,
  description,
  descriptionHtml,
  testCaseId,
  historyId,
  allureId,
  parentSuite,
  subSuite,
  attachment,
} = allure;
Feature('Cart API Tests');

let authToken = '';

Before(async ({ I }) => {
  await epic('API Testing');
  await feature('Cart Management');

  const loginResponse = await I.sendPostRequest("/api/users/auth/login", {
    email: "trungksdoa@gmail.com",
    password: "WXx4M50I#E8O",
  });

  I.seeResponseCodeIsSuccessful();
  authToken = loginResponse.data.data.accessToken;
  I.amBearerAuthenticated(authToken);
});

interface CartRes {
    id: number;
    productId: number;
    imageUrl: string;
    name: string;
    price: number;
    stock: number;
    quantity: number;
    disabled: boolean;
    quantityChanged: boolean;
  }
  

Scenario('Add Item to Cart', async ({ I }) => {
  await story('Add to Cart');
  
  const cartData = {
    productId: 53, // Replace with a valid product ID
    quantity: 2,
    userId: 34,
  };

   //Start cart flow
   await step("Check if item exists , remove to next step", async () => {
    const {
      data: res,
    }: { data: { message: string; statusCode: number; data: CartRes[] } } =
      await I.sendGetRequest("/api/carts/user/34");
    // "/ remove/{productId}/ user/{userId}"
    if (res.data == null || res.data.length == 0) {
      //Do not thing
    } else {
      if (res.data.some((item) => item.productId === cartData.productId)) {
        displayName("Found item exists in cart, try to remove");
        await I.sendDeleteRequest(
          `/api/carts/remove/${cartData.productId}/user/${cartData.userId}`
        );

        I.seeResponseCodeIsSuccessful();
        I.seeResponseContainsJson({
          message: "Item removed from cart successfully",
        });
      }
      displayName("Item removed from cart successfully");
    }
  });

  await step('Send POST request to add item to cart', async () => {

      const response = await I.sendPostRequest('/api/carts', cartData);
      I.seeResponseCodeIsSuccessful();
      I.seeResponseContainsJson({
      message: "Item added to cart successfully",
    });
  });
});

Scenario("Test add to cart while item already exists in cart", async ({ I }) => {
    await step('Send POST request to add item to cart', async () => {
        const cartData = {
            productId: 53, // Replace with a valid product ID
            quantity: 2,
            userId: 34,
          };
        
        const response = await I.sendPostRequest('/api/carts', cartData);
        I.seeResponseCodeIs(400);
        I.seeResponseContainsJson({
        message: "This item already exist in your cart",
      });
    });
})
After(async ({ I }) => {
  authToken = "";
});
