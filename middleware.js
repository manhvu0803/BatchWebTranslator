import { ipAddress, rewrite } from '@vercel/edge';

let allowList = [
    "::1",
    "162.158.189.",
    "162.158.190.",
    "162.158.179.",
    "162.158.170.",
    "162.158.106",
    "1.53.255.",
    "104.28.237.",
    // Huy P
    "113.173.34.",
    // Nha Trang
    // This is temporary, should have cookie later
    "113.160.248."
]

export default function middleware(req) {
    let url = new URL(req.url);
    let ip = ipAddress(req) || 'unknown';
    let cookie = req.cookies?.get("cookie") ?? "";
    let secret = process.env?.SECRET ?? "a8698a6982bc1";

    if (cookie !== secret && !isAllow(ip)) {
        console.error(`Client ${ip} is not allowed in this service`);
        return new Response(`<h1>You do not have access to this page</h1> <h2>Your IP is ${ip}</h2>`, {
            headers: { 'content-type': 'text/html' },
        })
    }
    else {
        let res = rewrite(url, req.url);
        let expireDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
        res.headers.set("Set-Cookie", `cookie=${secret}; Expires=${expireDate.toUTCString()}`)
        return res;
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