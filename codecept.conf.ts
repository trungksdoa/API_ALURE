import { setHeadlessWhen, setCommonPlugins } from '@codeceptjs/configure';

// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

// enable all common plugins https://github.com/codeceptjs/configure#setcommonplugins
setCommonPlugins();

export const config: CodeceptJS.MainConfig = {
  tests: './*_test.ts',
  output: './output',
  helpers: {
    REST: {
      // endpoint: "https://koi-controls-e5hxekcpd0cmgjg2.eastasia-01.azurewebsites.net/",
      endpoint: "http://localhost:8080",
    },
    JSONResponse: {}
  },
  include: {
    I: './steps_file'
  },
  name: 'Plat',
  plugins: {
    allure: {
      enabled: true,
      require: 'allure-codeceptjs',
      outputDir: './allure-results',
    },
  }
}
