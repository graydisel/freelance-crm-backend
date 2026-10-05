import { SetMetadata } from "@nestjs/common";
import { Permission } from "../../roles/enums/permission.enum";

export const RequirePermissions = (...permissions: Permission[]) =>
    SetMetadata(process.env.PERMISSIONS_KEY, permissions);