const { faker } = require("@faker-js/faker");
const fs = require("fs");
const path = require("path");

const MODULES_COUNT = 20000;
const MODULES_DIR = path.resolve(__dirname, "./src/modules");
const MODULES_EXT = ".js";
console.log("1");
// 创建模块目录
if (!fs.existsSync(MODULES_DIR)) {
  fs.mkdirSync(MODULES_DIR);
}

// 生成模块文件
for (let i = 1; i <= MODULES_COUNT; i++) {
  const moduleName = `module-${i}`;
  const moduleContent = `export default {
  id: ${i},
  name: "${faker.internet.userName()}",
  price: ${faker.commerce.price()},
  description: "${faker.commerce.productDescription()}"
};`;
  const modulePath = `${MODULES_DIR}/${moduleName}${MODULES_EXT}`;
  fs.writeFileSync(modulePath, moduleContent);
}
