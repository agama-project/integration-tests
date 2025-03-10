import { skip } from "node:test";
import { it, page } from "../lib/helpers";

// select the product to install if the product selection dialog is displayed,
// otherwise it expects the initial root password dialog
export function optionalProductSelection(productName: string) {
  it("should optionally display the product selection dialog", async function () {
    // Either the overview is displayed or there is the product selection page.
    const productSelectionDisplayed: boolean = await Promise.any([
      // left navigation item present
      page.waitForSelector("a[href='#/overview']").then((s) => {
        s!.dispose();
        return false;
      }),
      // or product selection displayed
      page.waitForSelector("button[form='productSelectionForm']").then((s) => {
        s!.dispose();
        return true;
      }),
    ]);

    if (productSelectionDisplayed) {
      const product = await page.locator(`::-p-text('${productName}')`).waitHandle();
      // scroll the page so the product is visible
      await product.scrollIntoView();
      await product.click();

      await page
        .locator("button[form='productSelectionForm']")
        // wait until the button is enabled
        .setWaitForEnabled(true)
        .click();
    } else {
      // no product selection displayed, mark the test as skipped
      skip();
    }
  });
}
