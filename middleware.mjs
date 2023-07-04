export default function middleware(req) {
    let url = new URL(req.url);
    let ip = req.getHeader("x-forwarded-for");
    let allowList = process.env.ALLOW_LIST;
    
    if (!allowList || !allowList.includes(ip)) {
        console.error(`Client ${ip} is not allowed in this service`);
        url.pathname = "/blocked.html"
    }
    else {
        url.pathname = "/index.html";
    }

    return Response.redirect(url)
}