import { createClient } from "@supabase/supabase-js";
import { assertDemoResetTarget } from "./lib/demo-target.mjs";

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DEMO_ADMIN_EMAIL",
  "DEMO_ADMIN_PASSWORD",
  "DEMO_STAFF_EMAIL",
  "DEMO_STAFF_PASSWORD",
];

const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function findOrCreateUser(email, password) {
  const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) throw listError;

  const existing = listed.users.find(
    (user) => user.email?.toLocaleLowerCase() === email.toLocaleLowerCase(),
  );
  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    if (error) throw error;
    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user;
}

const identities = [
  {
    email: process.env.DEMO_ADMIN_EMAIL,
    password: process.env.DEMO_ADMIN_PASSWORD,
    role: "ADMIN",
  },
  {
    email: process.env.DEMO_STAFF_EMAIL,
    password: process.env.DEMO_STAFF_PASSWORD,
    role: "STAFF",
  },
];

const provisioned = [];
for (const identity of identities) {
  const user = await findOrCreateUser(identity.email, identity.password);
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    email: identity.email,
    role: identity.role,
  });
  if (error) throw error;
  provisioned.push({ ...identity, id: user.id });
}

if (process.env.DEMO_RESET_DATA === "true") {
  assertDemoResetTarget(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.DEMO_EXPECTED_PROJECT_REF,
  );

  const { error: resetError } = await supabase
    .from("customers")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (resetError) throw resetError;
}

if (process.env.DEMO_LOAD_SAMPLE_DATA === "true") {
  const statuses = ["NEW", "CONTACTED", "BOOKED", "COMPLETED", "CANCELLED"];
  const surnames = ["김", "이", "박", "최", "정", "강", "조", "윤", "장"];
  const givenNames = ["민서", "서윤", "도현"];
  const customers = Array.from({ length: 27 }, (_, index) => {
    const ordinal = String(index + 1).padStart(12, "0");
    const name =
      index === 7
        ? "주식회사 아주 긴 이름의 고객지원 운영서비스 서울중앙지점 담당자 박서윤"
        : `${surnames[index % surnames.length]}${givenNames[index % givenNames.length]}`;
    return {
      id: `20000000-0000-4000-8000-${ordinal}`,
      name,
      phone: `010-${String(4100 + index).padStart(4, "0")}-${String(7700 + index).padStart(4, "0")}`,
      email: index % 6 === 0 ? null : `customer${index + 1}@example.com`,
      address: `서울시 운영구 고객로 ${index + 1}`,
      status: statuses[index % statuses.length],
      created_at: new Date(Date.UTC(2026, 6, 10 + index)).toISOString(),
      updated_at: new Date(Date.UTC(2026, 7, 9, 0, index)).toISOString(),
    };
  });

  const { error: customerError } = await supabase
    .from("customers")
    .upsert(customers, { onConflict: "id" });
  if (customerError) throw customerError;

  const interactions = customers.slice(0, 8).map((customer, index) => ({
    id: `30000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    customer_id: customer.id,
    type: ["PHONE", "SMS", "EMAIL", "VISIT"][index % 4],
    memo:
      index === 3
        ? "예약 시간을 확인하고 방문 전 다시 연락하기로 함. 요청 사항이 길어질 경우에도 상담 타임라인의 기본 정렬과 다음 행동이 밀리지 않아야 합니다."
        : "고객 상태를 확인하고 다음 연락 일정을 안내함.",
    created_by: provisioned[index % provisioned.length].id,
    created_at: new Date(Date.UTC(2026, 7, 1 + index, 0, 10)).toISOString(),
  }));

  const { error: interactionError } = await supabase
    .from("interactions")
    .upsert(interactions, { onConflict: "id" });
  if (interactionError) throw interactionError;
}

console.log(
  `Provisioned ${provisioned.length} demo users${
    process.env.DEMO_LOAD_SAMPLE_DATA === "true" ? " and sample CRM records" : ""
  } without printing credentials.`,
);
