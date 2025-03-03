import { it, page } from "../lib/helpers";

// defines a test for configuring the root password from the main Agama screen
export function setRootPassword(password: string) {
  it("allows setting the root password", async function () {
    await page.locator("a[href='#/users']").click();
    await page.locator("a[href='#/users/root/edit']").click();

    await page.locator("::-p-text(Use password)").wait();
    await page.click("::-p-text(Use password)");

    await page.locator("input#password").wait();
    await page.type("input#password", password);
    await page.type("input#passwordConfirmation", password);

    await page.locator("button[type='submit']").setWaitForEnabled(true).click();

    // wait until the password setup disappears
    await page.locator("input#passwordConfirmation").setVisibility("hidden").wait();

    await page.locator("a[href='#/overview']").click();
    await page.locator("main ::-p-text('Overview')").wait();
  });
}
