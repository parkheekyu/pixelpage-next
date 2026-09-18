export default function Loading() {
  return (
    <div className="skel" aria-busy="true" aria-label="불러오는 중">
      <div className="skel-line w40" />
      <div className="skel-tiles"><div className="skel-tile" /><div className="skel-tile" /><div className="skel-tile" /><div className="skel-tile" /></div>
      <div className="skel-block" />
    </div>
  );
}
