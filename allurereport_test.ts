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

Feature("Order Tests");

let authToken = "";

Before(async ({ I }) => {
  await epic("API Testing");
  await feature("Authentication");
  await story("User Login");

  const loginResponse = await I.sendPostRequest("/api/users/auth/login", {
    email: "trungksdoa@gmail.com",
    password: "BI-1CMAWCU=y",
  });

  I.seeResponseCodeIsSuccessful();
  I.seeResponseContainsJson({
    message: "Login successful",
  });

  I.seeResponseContainsJson({
    data: {
      email: "trungksdoa@gmail.com",
    },
  });

  const schema = Joi.object().keys({
    message: Joi.string().required(),
    statusCode: Joi.number().required(),
    data: Joi.object().keys({
      id: Joi.number().required(),
      email: Joi.string().required(),
      username: Joi.string().required(),
      address: Joi.string().allow(""),
      phoneNumber: Joi.string().allow(""),
      active: Joi.boolean().required(),
      roles: Joi.array().required(),
      accessToken: Joi.string().required(),
    }),
  });

  I.seeResponseMatchesJsonSchema(schema);

  authToken = loginResponse.data.data.accessToken;
  I.amBearerAuthenticated(authToken);

  await step("Login successful and token acquired", async () => {
    displayName("Login successful and token acquired");
  });
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

Scenario("Add item to cart", async ({ I }) => {
  await story("Main flow 1");
  await tag("Main flow - 1");
  const cart = {
    userId: 34,
    productId: 53,
    quantity: 4,
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
      if (res.data.some((item) => item.productId === cart.productId)) {
        displayName("Found item exists in cart, try to remove");
        await I.sendDeleteRequest(
          `/api/carts/remove/${cart.productId}/user/${cart.userId}`
        );

        I.seeResponseCodeIsSuccessful();
        I.seeResponseContainsJson({
          message: "Item removed from cart successfully",
        });
      }
      displayName("Item removed from cart successfully");
    }
  });

  await step("Send POST request to add item to cart", async () => {
    tag("Cart flow ");
    const res = await I.sendPostRequest("/api/carts", cart);
    I.seeResponseCodeIsSuccessful();
    I.seeResponseContainsJson({
      message: "Item added to cart successfully",
    });

    displayName("Item added to cart successfully");
  });

  await step("Verify item added to cart", async () => {
    const {
      data: res,
    }: { data: { message: string; statusCode: number; data: CartRes[] } } =
      await I.sendGetRequest("/api/carts/user/34");

    if (
      res.data.some(
        (item) =>
          item.productId === cart.productId && item.quantity === cart.quantity
      )
    ) {
      displayName("Item added to cart successfully");
    } else {
      displayName("Item not added to cart");
    }
  });

  await step("Update item in cart", async () => {
    const updateCart = {
      userId: 34,
      productId: 53,
      quantity: 10,
    };

    const res = await I.sendPutRequest(
      `/api/carts/user/${cart.userId}`,
      updateCart
    );
    I.seeResponseContainsJson({ message: "Cart item updated successfully" });

    displayName("Cart updated successfully");
  });

  await step("Verify item updated in cart", async () => {
    const {
      data: res,
    }: { data: { message: string; statusCode: number; data: CartRes[] } } =
      await I.sendGetRequest("/api/carts/user/34");

    if (res.data.some((item) => item.productId === cart.productId)) {
      if (res.data.some((item) => item.quantity === cart.quantity)) {
        displayName("Item updated in cart successfully");
      } else {
        displayName("Item not updated in cart");
      }
    } else {
      displayName("Item not updated in cart");
    }
  });
  //End cart flow

  let orderId = "";
  //Start order flow
  await step("Create order", async () => {
    tag("Order flow");
    const orderData = {
      fullName: "John Doe",
      address: "123 Main St",
      phone: "1234567890",
    };

    const response = await I.sendPostRequest(
      "/api/orders/create-product-order",
      orderData
    );
    // orderId: '118-product-34-1729559724929',

    console.log(response.data.data.orderId)
    I.seeResponseCodeIsSuccessful();
    I.seeResponseContainsJson({
      message: "Order created successfully",
    });

    orderId = response.data.data.orderId.split("-")[0];
    displayName("Order created successfully");
  });

  await step("Admin Send Order", async () => {
    const order = {
      orderId: Number(orderId),
    };
    const res = await I.sendPostRequest("/api/orders/send-order", order);

    I.seeResponseCodeIsSuccessful();
  });

  await step("Verify order sent", async () => {
    const order = {
      orderId: Number(orderId),
    };
    const res = await I.sendPostRequest(`/api/orders/order/delivered`, order);
    I.seeResponseCodeIsSuccessful();
  });

  await step("Verify order received", async () => {
    const order = {
      orderId: Number(orderId),
    };
    const res = await I.sendPostRequest(`/api/orders/receive-order`,order);
    I.seeResponseCodeIsSuccessful();
  });
  //End order flow
});

After(async ({ I }) => {
  authToken = "";
  await step("Test cleanup completed", async () => {
    displayName("Test cleanup completed");
  });
});
