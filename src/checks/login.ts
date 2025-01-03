import { it, page } from "../lib/helpers";

// test that we can log into Agama
export function loginCheck(password: string) {
  it("allows logging in", async function () {
    await page.type("input#password", password);
    await page.click("button[type='submit']");
  });
}
