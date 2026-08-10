import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

const adminEmail = process.env.DEMO_ADMIN_EMAIL;
const adminPassword = process.env.DEMO_ADMIN_PASSWORD;
const staffEmail = process.env.DEMO_STAFF_EMAIL;
const staffPassword = process.env.DEMO_STAFF_PASSWORD;
const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
    adminEmail &&
    adminPassword &&
    staffEmail &&
    staffPassword,
);

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("이메일").fill(email);
  await page.getByLabel("비밀번호").fill(password);
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("ClientOps CRM", () => {
  test.skip(!configured, "Supabase와 ADMIN 데모 계정 환경변수가 필요합니다.");

  test("비로그인 사용자를 로그인으로 보내고 ADMIN 핵심 흐름을 수행한다", async ({ page }) => {
    await page.goto("/customers");
    await expect(page).toHaveURL(/\/login/);

    await login(page, adminEmail!, adminPassword!);

    await page.getByRole("link", { name: "고객", exact: true }).click();
    await expect(page.getByText("27명 · 1 / 2 페이지", { exact: true })).toBeVisible();
    await page.getByRole("link", { name: "다음" }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByRole("link", { name: "열기" })).toHaveCount(7);

    await page.goto("/customers?q=010%204107%207707");
    await expect(page.getByText(/주식회사 아주 긴 이름/).filter({ visible: true })).toBeVisible();

    await page.goto("/customers?q=%EC%A1%B4%EC%9E%AC%ED%95%98%EC%A7%80%EC%95%8A%EB%8A%94%EA%B3%A0%EA%B0%9D");
    await expect(page.getByRole("heading", { name: "조건에 맞는 고객이 없습니다" })).toBeVisible();
    await expect(page.getByRole("link", { name: "필터 초기화" })).toBeVisible();

    await page.goto("/customers");
    const fullDownloadPromise = page.waitForEvent("download");
    await page.getByRole("link", { name: /CSV/ }).click();
    const fullDownload = await fullDownloadPromise;
    const fullCsv = await readFile(await fullDownload.path(), "utf8");
    expect(fullCsv.startsWith("\uFEFF\"ID\",\"고객명\"")).toBe(true);
    expect(fullCsv.split("\r\n").filter(Boolean)).toHaveLength(28);

    await page.goto("/customers?q=%EB%AF%BC%EC%84%9C");
    const filteredDownloadPromise = page.waitForEvent("download");
    await page.getByRole("link", { name: /CSV/ }).click();
    const filteredDownload = await filteredDownloadPromise;
    const filteredCsv = await readFile(await filteredDownload.path(), "utf8");
    expect(filteredCsv.split("\r\n").filter(Boolean)).toHaveLength(10);
    expect(filteredCsv).not.toContain("주식회사 아주 긴 이름");

    await page.getByRole("link", { name: "새 고객" }).click();
    const uniqueName = `__E2E__ 고객 ${Date.now()}`;
    await page.getByLabel("고객명").fill(uniqueName);
    await page.getByLabel("전화번호").fill("010-5555-7793");
    await page.getByRole("button", { name: "고객 등록" }).click();
    await expect(page.getByRole("heading", { name: uniqueName })).toBeVisible();

    await page.getByLabel("상담 메모").fill("E2E 상담 기록");
    await page.getByRole("button", { name: "상담 추가" }).click();
    await expect(page.getByText("E2E 상담 기록")).toBeVisible();

    const deleteButton = page.getByRole("button", { name: "고객 영구 삭제" });
    await deleteButton.focus();
    await deleteButton.press("Enter");
    await expect(page.getByRole("alertdialog", { name: "고객을 영구 삭제할까요?" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(deleteButton).toBeFocused();
    await deleteButton.click();
    await expect(page.getByText(/연결된 상담 기록 1건/)).toBeVisible();
    await page.getByRole("button", { name: "영구 삭제" }).click();
    await expect(page).toHaveURL(/\/customers/);
  });

  test("STAFF는 고객을 수정하고 상담을 추가할 수 있지만 삭제할 수 없다", async ({ page }, testInfo) => {
    await login(page, staffEmail!, staffPassword!);
    await page.goto("/customers/20000000-0000-4000-8000-000000000008");
    await expect(page.getByRole("heading", { name: /주식회사 아주 긴 이름/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "고객 영구 삭제" })).toHaveCount(0);
    const memo = `STAFF E2E 상담 ${testInfo.project.name} ${Date.now()}`;
    await page.getByLabel("상담 메모").fill(memo);
    await page.getByRole("button", { name: "상담 추가" }).click();
    await expect(page.getByText(memo, { exact: true })).toBeVisible();
  });
});
