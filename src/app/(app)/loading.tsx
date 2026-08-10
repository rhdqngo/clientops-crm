export default function AppLoading() {
  return (
    <div className="page-wrap" aria-busy="true" aria-label="페이지 불러오는 중">
      <div className="skeleton h-10 w-44 rounded" />
      <div className="mt-8 grid gap-3">
        <div className="skeleton h-11 rounded" />
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="skeleton h-[58px]" key={index} />
        ))}
      </div>
    </div>
  );
}
