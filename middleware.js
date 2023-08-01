import { ipAddress, rewrite } from '@vercel/edge';

let allowList = [
    "::1",
    "162.158.189.",
    "162.158.190.",
    "162.158.179.",
    "1.53.255.",
    // Huy
    "113.173.34."
]

export default function middleware(req) {
    let url = new URL(req.url);
    let ip = ipAddress(req) || 'unknown';
    
    if (!allowList || !isAllow(ip)) {
        console.error(`Client ${ip} is not allowed in this service`);
        return new Response(`<h1>You do not have access to this page</h1> <h2>Your IP is ${ip}</h2>`, {
            headers: { 'content-type': 'text/html' },
        })
    }
    else {
        return rewrite(url, req.url);
    }
}

function isAllow(ip) {
    for (let allowedIp of allowList) {
        let regex = new RegExp(allowedIp);

        if (regex.test(ip)) {
            return true;
        }
    }

    return false;
}
