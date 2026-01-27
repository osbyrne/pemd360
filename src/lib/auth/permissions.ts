import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export const statement = {
    ...defaultStatements,
    project: ["create", "share", "update", "delete", "read"],
    tags: ["create", "update", "delete", "read"],
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
    project: ["read"],
    tags: ["read"],
});

export const collaborator = ac.newRole({
    project: ["read"],
    tags: ["create", "update", "delete", "read"],
});

export const admin = ac.newRole({
    project: ["create", "share", "update", "delete", "read"],
    tags: ["create", "update", "delete", "read"],
    ...adminAc.statements,
});
