const { I } = inject();
const Joi = require("joi");
import allurePlugin from "allure-codeceptjs";
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const allure = allurePlugin({
  resultsDir: "./allure-results",
  reportDir: "./allure-report",
});

const { epic, feature, story, step, displayName, tag } = allure;

Feature("Pond and Fish Management");

let authToken = "";
let pondId = 0;
let koiFishId = 0;
let fishName = "";
Before(async ({ I }) => {
  await epic("API Testing");
  await feature("Pond and Fish Management");
  await story("User Authentication");

  const loginResponse = await I.sendPostRequest("/api/users/auth/login", {
    email: "trungksdoa@gmail.com",
    password: "WXx4M50I#E8O",
  });

  I.seeResponseCodeIsSuccessful();

  authToken = loginResponse.data.data.accessToken;
  I.amBearerAuthenticated(authToken);

  await step("Login successful and token acquired", async () => {
    displayName("Login successful and token acquired");
  });
});

Scenario(
  "Create Pond, Add Koi Fish, and Update Water Parameters",
  async ({ I }) => {
    await story("Pond and Fish Management Flow");
    await tag("Pond");
    await tag("KoiFish");
    await tag("WaterParameter");

    // Create a new pond
    await step("Create a new pond", async () => {
      const pond = {
        name: "Test Pond" + new Date().getTime(),
        length: 100,
        width: 50,
        depth: 30,
        date: "2023-05-15",
        userId: 34,
      };

      const form = new FormData();
      const imagePath = path.join(__dirname, "image.jpg");

      form.append("pond", JSON.stringify(pond));
      form.append("image", fs.createReadStream(imagePath), "image.jpg");

      const response = await I.sendPostRequest("/api/ponds", form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${authToken}`,
        },
      });

      console.log("Pond:" , response);
      I.seeResponseCodeIsSuccessful();

      pondId = response.data.data.id;
      displayName(`Pond created successfully with ID: ${pondId}`);
    });

    // Add a koi fish to the pond
    await step("Add a koi fish to the pond", async () => {
      const koiFishData = {
        name: "Test Koi" + new Date().getTime(),
        variety: "Kohaku",
        sex: true,
        purchasePrice: 1000,
        userId: 34,
        dateOfBirth: "2023-01-01",
        date: "2023-05-15",
        ageMonth: 4.5,
        pondId: pondId,
        weight: 500,
        length: 30,
      };

      fishName = koiFishData.name;

      const form = new FormData();
      const imagePath = path.join(__dirname, "image.jpg");

      form.append("fish", JSON.stringify(koiFishData));
      form.append("image", fs.createReadStream(imagePath), "image.jpg");

      const response = await I.sendPostRequest("/api/koifishs", form,{
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${authToken}`,
        },
      });
      I.seeResponseCodeIsSuccessful();

      console.log("Fish:" , response)
      koiFishId = response.data.data.id;
      displayName(`Koi fish added successfully with ID: ${koiFishId}`);
    });

    // Update water parameters for the pond
    await step("add water parameters for the pond", async () => {
      const waterParameterData = {
        nitriteNO2: 0.5,
        nitrateNO3: 20,
        ammoniumNH4: 0.1,
        hardnessGH: 8,
        salt: 0.1,
        temperature: 25,
        carbonateHardnessKH: 6,
        co2: 10,
        totalChlorines: 0.05,
        amountFed: 100,
        ph: 7.2,
      };

      const response = await I.sendPostRequest(
        `/api/ponds/parameters/${pondId}`,
        waterParameterData
      );

      console.log(response.data)
      I.seeResponseCodeIsSuccessful();

      displayName("Water parameters updated successfully");
    });
  }
);

After(async ({ I }) => {
  // Clean up: Delete the created koi fish and pond
  await step("Clean up: Delete koi fish and pond", async () => {
    if (koiFishId) {
      await I.sendDeleteRequest(`/api/koifishs/${koiFishId}`);
      I.seeResponseCodeIsSuccessful();
    }

    if (pondId) {
      await I.sendDeleteRequest(`/api/ponds/${pondId}`);
      I.seeResponseCodeIsSuccessful();
    }

    displayName("Clean up completed successfully");
  });

  authToken = "";
});
