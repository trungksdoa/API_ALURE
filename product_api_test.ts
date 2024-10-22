const { I } = inject();
const Joi = require("joi");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

import allurePlugin from "allure-codeceptjs";
//Add this line
const allure = allurePlugin({
  resultsDir: "./allure-results",
  reportDir: "./allure-report",
});

const { epic, feature, story, step, attachment } = allure;
Feature("Product API Tests");

let authToken = "";

Before(async ({ I }) => {
  await epic("API Testing");
  await feature("Product Management");

  const loginResponse = await I.sendPostRequest("/api/users/auth/login", {
    email: "trungksdoa@gmail.com",
    password: "BI-1CMAWCU=y",
  });

  I.seeResponseCodeIsSuccessful();
  authToken = loginResponse.data.data.accessToken;
  I.amBearerAuthenticated(authToken);
});
function loadImage() {
  const image = fs.readFileSync("./image.jpg");
  return image;
}
let productId = "";
Scenario("Create a new product", async ({ I }) => {
  await epic("Product Management");


  const productData = {
    name: "Test Product" + new Date().getTime(),
    price: 1000,
    description: "This is a test product",
    stock: 100,
    categoryId: 1,
  };

  const imagePath = path.join(__dirname, "image.jpg");

  await step("Send POST request to create product", async () => {
    const form = new FormData();
    form.append("product", JSON.stringify(productData));
    form.append("image", fs.createReadStream(imagePath), "image.jpg");

    const res = await I.sendPostRequest("/manage/api/products", form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${authToken}`,
      },
    });

    I.seeResponseCodeIsSuccessful();
    I.seeResponseContainsJson({
      message: "Access granted, created successfully",
    });
    productId = res.data.data.id;
    attachment(
      "Response",
      JSON.stringify(res.data, null, 2),
      "application/json"
    );
  });
});

Scenario("Update an existing product", async ({ I }) => {
  await epic("Product Management");
  const updatedProductData = {
    name: "Updated Test Product" + new Date().getTime(),
    price: 1500,
    description: "This is an updated test product",
    stock: 150,
  };

  await step("Send PUT request to update product", async () => {
    const form = new FormData();
    // Send product data directly as an object
    form.append("product", JSON.stringify(updatedProductData));
    // If you don't want to update the image, you can omit this line
    // form.append('image', null);

    const res = await I.sendPutRequest(
      `/manage/api/products/${productId}`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    console.log(res.data);
    I.seeResponseCodeIsSuccessful();

    //   attachment("Response", JSON.stringify(res.data, null, 2), "application/json");
  });
});

Scenario("Delete an existing product", async ({ I }) => {
  await epic("Product Management");

  await step("Send DELETE request to delete product", async () => {
    const res = await I.sendDeleteRequest(`/manage/api/products/${productId}`);
    I.seeResponseCodeIsSuccessful();
  });
});

After(async ({ I }) => {
  authToken = "";
});
