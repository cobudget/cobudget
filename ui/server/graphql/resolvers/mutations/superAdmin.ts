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

        const token = sign(session.id);
        response.setHeader("set-cookie", `ss=${token}; path=/; samesite=lax; httponly;`);
        return session;
    }
    else {
        throw new Error("You are not a super admin");
    }
}

export const closeSuperAdminSession = (parent, args, { superSession }) => {

}