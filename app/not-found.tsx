import Link from "next/link";
export default function NotFound(){return <main className="expired"><div className="chit-stack"><span className="route-label">Not found</span><h1>No chit here.</h1><p>Check the link, or start a new one.</p><Link className="button-primary" href="/new">New chit</Link></div></main>}
