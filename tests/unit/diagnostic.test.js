const path = require("path");
const dotenv = require("dotenv");
const fs = require("fs");

describe("Environment Diagnostic", () => {
  test("Load .env.test file", () => {
    const envPath = path.resolve(__dirname, "../.env.test");
    console.log("Env file path:", envPath);

    // 👇 CARGA REAL EN process.env
    dotenv.config({ path: envPath });

    expect(process.env.DB_NAME).toBe("neondb");
    expect(process.env.NODE_ENV).toBe("test");
  });

  test("Check current process.env", () => {
    console.log("Current process.env values:");
    console.log("- NODE_ENV:", process.env.NODE_ENV);
    console.log("- DB_NAME:", process.env.DB_NAME);
    console.log(
      "- JWT_ACCESS_SECRET:",
      process.env.JWT_ACCESS_SECRET ? "DEFINED" : "UNDEFINED"
    );

    expect(process.env.NODE_ENV).toBe("test");
  });
});
