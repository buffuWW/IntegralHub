import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

async function main() {
  const rl = createInterface({ input, output });
  const password = await rl.question("Введите пароль администратора: ");
  rl.close();
  if (!password) throw new Error("Пароль не может быть пустым");
  const hash = await bcrypt.hash(password, 12);
  console.log(hash);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
