import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-wrap">
      <div className="mx-auto max-w-xl border-y border-[#d5dbd7] bg-white px-5 py-8">
        <h1 className="page-title text-[1.5rem]">대상을 찾을 수 없습니다</h1>
        <p className="mt-3 text-sm text-[#64706b]">주소가 잘못되었거나 이미 삭제된 고객일 수 있습니다.</p>
        <Link className="button button-primary mt-6" href="/customers">
          고객 목록으로
        </Link>
      </div>
    </main>
  );
}
