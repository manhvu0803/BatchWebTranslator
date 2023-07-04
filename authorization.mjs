export default function(req, res) {
    let ip = req.getHeader("x-forwarded-for");
    let allowList = process.env.ALLOW_LIST;
    
    if (!allowList || !allowList.includes(ip)) {
        console.error(`Client ${ip} is not allowed in this service`);
        res.status(403);
        res.send("You do not have access to this service");
        return false;
    }

    return true;
}