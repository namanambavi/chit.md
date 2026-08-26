const ink = "#0D0D0D";
const paper = "#FFFFFF";
const canvas = "#F1F1F1";
const edge = "#D1D1D1";
const quiet = "#6B6B6B";

export function BrandIcon({ size = 32 }: { size?: number }) {
  const inset = Math.round(size * 0.2);
  const sheetWidth = Math.round(size * 0.48);
  const sheetHeight = Math.round(size * 0.58);
  const offset = Math.max(1, Math.round(size * 0.06));

  return <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:ink }}>
    <div style={{ width:sheetWidth + offset * 2, height:sheetHeight + offset * 2, display:"flex", position:"relative", marginTop:Math.round(inset * 0.1) }}>
      <div style={{ position:"absolute", width:sheetWidth, height:sheetHeight, left:offset * 2, top:0, borderRadius:Math.max(1, Math.round(size * 0.055)), background:"#5F5F5F" }}/>
      <div style={{ position:"absolute", width:sheetWidth, height:sheetHeight, left:offset, top:offset, borderRadius:Math.max(1, Math.round(size * 0.055)), background:"#A3A3A3" }}/>
      <div style={{ position:"absolute", width:sheetWidth, height:sheetHeight, left:0, top:offset * 2, display:"flex", flexDirection:"column", padding:Math.max(2, Math.round(size * 0.085)), borderRadius:Math.max(1, Math.round(size * 0.055)), background:paper }}>
        <div style={{ width:"66%", height:Math.max(1, Math.round(size * 0.045)), borderRadius:size, background:ink }}/>
        <div style={{ width:"42%", height:Math.max(1, Math.round(size * 0.035)), marginTop:Math.max(2, Math.round(size * 0.1)), borderRadius:size, background:"#9A9A9A" }}/>
      </div>
    </div>
  </div>;
}

export function SocialCard({ title, label = "Markdown, on a link" }: { title: string; label?: string }) {
  const displayTitle = title.length > 68 ? `${title.slice(0, 65).trimEnd()}…` : title;

  return <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:canvas, color:ink, fontFamily:"Inter, Arial, sans-serif" }}>
    <div style={{ width:960, height:450, display:"flex", position:"relative" }}>
      <div style={{ position:"absolute", width:900, height:410, left:60, top:0, border:"2px solid #B9B9B9", background:"#D8D8D8" }}/>
      <div style={{ position:"absolute", width:900, height:410, left:30, top:20, border:`2px solid ${edge}`, background:"#ECECEC" }}/>
      <div style={{ position:"absolute", width:900, height:410, left:0, top:40, display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"48px 56px 42px", border:`2px solid ${edge}`, background:paper }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", fontSize:28, fontWeight:700, letterSpacing:"-0.04em" }}>
            <div style={{ width:30, height:34, display:"flex", position:"relative", marginRight:15 }}>
              <div style={{ position:"absolute", width:22, height:28, left:8, top:0, border:"1px solid #8D8D8D", background:"#D1D1D1" }}/>
              <div style={{ position:"absolute", width:22, height:28, left:4, top:3, border:"1px solid #AAAAAA", background:"#ECECEC" }}/>
              <div style={{ position:"absolute", width:22, height:28, left:0, top:6, border:`1px solid ${ink}`, background:paper }}/>
            </div>
            chit.md
          </div>
          <div style={{ fontSize:20, color:quiet }}>{label}</div>
        </div>

        <div style={{ maxWidth:780, display:"flex", flexDirection:"column" }}>
          <div style={{ fontSize:displayTitle.length > 42 ? 58 : 70, lineHeight:1.06, fontWeight:700, letterSpacing:"-0.045em" }}>{displayTitle}</div>
          <div style={{ width:72, height:4, marginTop:28, background:ink }}/>
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:20, color:quiet }}>
          <span>Clean public Markdown</span>
          <span style={{ color:ink, fontWeight:600 }}>chit.md</span>
        </div>
      </div>
    </div>
  </div>;
}
