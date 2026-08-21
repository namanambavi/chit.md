export function GET(){return Response.json({ok:true,service:"chit.md",time:new Date().toISOString()},{headers:{"cache-control":"no-store"}})}
