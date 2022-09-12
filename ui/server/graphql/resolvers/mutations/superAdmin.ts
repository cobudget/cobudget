import { sign } from "server/utils/jwt";
import prisma from "../../../prisma";
import { isSuperAdmin } from "../auth";

export const startSuperAdminSession = async (parent, args, { user, response }) => {
    if (isSuperAdmin(user)) {

        const validDurations = [15, 30, 45, 60];
        if (validDurations.indexOf(args.duration) === -1) {
            throw new Error("Invalid duration");
        }

        const session = await prisma.superAdminSession.create({
            data: {
                duration: args.duration,
                adminId: user.id,
            }
        });

        const token = sign({ id: session.id }, { expiresIn: args.duration * 60 });
        response.setHeader("set-cookie", `ss=${token}; path=/; samesite=lax; httponly;`);
        return session;
    }
    else {
        throw new Error("You are not a super admin");
    }
}

export const endSuperAdminSession = async (parent, args, { ss, response }) => {
    console.log(ss);
    if (ss) {
        const session = await prisma.superAdminSession.update({
            where: {
                id: ss.id
            },
            data: {
                end: new Date()
            }
        });
        
        response.setHeader("set-cookie", `ss=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`);
        return session;
    }
}