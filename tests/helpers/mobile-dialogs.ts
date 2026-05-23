import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export function acceptNextConfirm(page: Page) {
  page.once("dialog", async (dialog) => {
    expect(dialog.type()).toBe("confirm");
    await dialog.accept();
  });
}
