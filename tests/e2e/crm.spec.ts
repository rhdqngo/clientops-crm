import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

const adminEmail = process.env.DEMO_ADMIN_EMAIL;
const adminPassword = process.env.DEMO_ADMIN_PASSWORD;
const staffEmail = process.env.DEMO_STAFF_EMAIL;
const staffPassword = process.env.DEMO_STAFF_PASSWORD;
const configured = Boolean(adminEmail && adminPassword && staffEmail && staffPassword);

async function login(page: Page, email: string, password: string, locale: "ko" | "en") {
  const labels = locale === "ko"
    ? { email: "이메일", password: "비밀번호", submit: "로그인" }
    : { email: "Email", password: "Password", submit: "Sign in" };
  await page.goto(`/${locale}/login`);
  const role = email.startsWith("admin") ? "ADMIN" : "STAFF";
  const demoFill = page.getByRole("button", {
    name: locale === "ko" ? `${role} 채우기` : `Fill ${role}`,
  });
  if (await demoFill.count()) {
    await demoFill.click();
  } else {
    await page.getByLabel(labels.email).fill(email);
    await page.getByLabel(labels.password).fill(password);
  }
  await page.getByRole("button", { name: labels.submit }).click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/dashboard`));
}

test.describe("ClientOps CRM", () => {
  test.skip(!configured, "Supabase와 데모 계정 환경변수가 필요합니다.");

  test("언어를 감지하고 명시적 locale과 전환 선택을 보존한다", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/");
    await expect(page).toHaveURL(/\/en\/login/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.goto("/ko/login?next=%2Fko%2Fcustomers%3Fstatus%3DBOOKED");
    await expect(page.locator("html")).toHaveAttribute("lang", "ko");
    await page.getByRole("link", { name: "Switch to English" }).click();
    await expect(page).toHaveURL(/\/en\/login\?next=%2Fen%2Fcustomers/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page.goto("/login");
    await expect(page).toHaveURL(/\/en\/login/);
  });

  test("English ADMIN flow covers search, CSV, creation, interaction and deletion", async ({ page }) => {
    await page.goto("/customers");
    await expect(page).toHaveURL(/\/(?:en|ko)\/login/);

    await login(page, adminEmail!, adminPassword!, "en");
    await page.getByRole("link", { name: /^(Customers|Clients)$/ }).click();
    await expect(page.getByText("27 customers · page 1 of 2", { exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Next" }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByRole("link", { name: "Open" })).toHaveCount(7);

    await page.goto("/en/customers?q=010%204107%207707");
    await expect(page.getByText(/주식회사 아주 긴 이름/).filter({ visible: true })).toBeVisible();
    await page.getByRole("link", { name: "한국어로 전환" }).click();
    await expect(page).toHaveURL(/\/ko\/customers\?q=010/);
    await page.getByRole("link", { name: "Switch to English" }).click();
    await expect(page).toHaveURL(/\/en\/customers\?q=010/);

    await page.goto("/en/customers?q=%EC%A1%B4%EC%9E%AC%ED%95%98%EC%A7%80%EC%95%8A%EB%8A%94%EA%B3%A0%EA%B0%9D");
    await expect(page.getByRole("heading", { name: "No customers match these filters" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Reset filters" })).toBeVisible();

    await page.goto("/en/customers");
    const fullDownloadPromise = page.waitForEvent("download");
    await page.getByRole("link", { name: /Export CSV|CSV/ }).click();
    const fullDownload = await fullDownloadPromise;
    const fullCsv = await readFile(await fullDownload.path(), "utf8");
    expect(fullCsv.startsWith('\uFEFF"ID","Customer name"')).toBe(true);
    expect(fullCsv.split("\r\n").filter(Boolean)).toHaveLength(28);

    await page.goto("/en/customers?q=%EB%AF%BC%EC%84%9C");
    const filteredDownloadPromise = page.waitForEvent("download");
    await page.getByRole("link", { name: /Export CSV|CSV/ }).click();
    const filteredDownload = await filteredDownloadPromise;
    const filteredCsv = await readFile(await filteredDownload.path(), "utf8");
    expect(filteredCsv.split("\r\n").filter(Boolean)).toHaveLength(10);
    expect(filteredCsv).not.toContain("주식회사 아주 긴 이름");

    await page.getByRole("link", { name: "New customer" }).click();
    const uniqueName = `__E2E__ Customer ${Date.now()}`;
    await page.getByLabel("Customer name").fill(uniqueName);
    await page.getByLabel("Phone number").fill("010-5555-7793");
    await page.getByRole("button", { name: "Create customer" }).click();
    await expect(page.getByRole("heading", { name: uniqueName })).toBeVisible();

    await page.getByLabel("Interaction note").fill("E2E interaction record");
    await page.getByRole("button", { name: "Add interaction" }).click();
    await expect(page.getByText("E2E interaction record")).toBeVisible();

    const deleteButton = page.getByRole("button", { name: "Permanently delete customer" });
    await deleteButton.focus();
    await deleteButton.press("Enter");
    await expect(page.getByRole("alertdialog", { name: "Permanently delete this customer?" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(deleteButton).toBeFocused();
    await deleteButton.click();
    await expect(page.getByText(/1 linked interactions/)).toBeVisible();
    await page.getByRole("button", { name: "Delete permanently" }).click();
    await expect(page).toHaveURL(/\/en\/customers/);
  });

  test("한국어 STAFF는 고객을 수정하고 상담을 추가할 수 있지만 삭제할 수 없다", async ({ page }, testInfo) => {
    await login(page, staffEmail!, staffPassword!, "ko");
    await page.goto("/ko/customers/20000000-0000-4000-8000-000000000008");
    await expect(page.getByRole("heading", { name: /주식회사 아주 긴 이름/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "고객 영구 삭제" })).toHaveCount(0);
    const memo = `STAFF E2E 상담 ${testInfo.project.name} ${Date.now()}`;
    await page.getByLabel("상담 메모").fill(memo);
    await page.getByRole("button", { name: "상담 추가" }).click();
    await expect(page.getByText(memo, { exact: true })).toBeVisible();
  });
});
