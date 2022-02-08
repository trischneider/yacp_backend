import { NextFunction, Request, Response } from "express";

export default function applyCORS(req: Request, res: Response, next: NextFunction) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, PUT, GET, OPTIONS, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, content-type, x-from-platform, x-info-lang, x-info-utc");
    if (req.method == "OPTIONS") {
        res.json({})
    } else
        next();
}