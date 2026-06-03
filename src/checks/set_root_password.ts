import { it, page } from "../lib/helpers";

// defines a test for configuring the root password from the main Agama screen
export function setRootPassword(password: string) {
  it("allows setting the root password", async function () {
    // go to the authentication page
    await page.locator("a[href='#/users']").click();

    // click the root login menu (currently there is only a single menu on the page)
    await page.locator(".pf-v6-c-menu-toggle__text").click();
    // select the "Password" option
    await page.locator("button.pf-v6-c-menu__item ::-p-text('Password')").click();

    // wait until the input fields appear
    await page.locator("input#rootPassword").wait();
    // fill the password
    await page.locator("input#rootPassword").fill(password);
    await page.locator("input#rootPasswordConfirmation").fill(password);

    // submit the form
    await page.locator("button[type='submit']").click();

    // wait until either the success alert (changed) or info alert (not changed) appears
    await Promise.any([
      page.waitForSelector(".pf-v6-c-alert.pf-m-success"),
      page.waitForSelector(".pf-v6-c-alert.pf-m-info"),
    ]);

    // navigate back to the main page
    await page.locator("a[href='#/overview']").click();
    await page.locator("main ::-p-text('System Information')").wait();
  });
}
