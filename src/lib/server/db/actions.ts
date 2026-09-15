import type { Actions } from "@sveltejs/kit";
import { actionFailure } from "$lib/server/effect/sveltekit";
import { isBoundarySuccess, runServerEffect } from "$lib/server/effect/runtime";
import {
  createAdminEntity,
  deleteAdminEntity,
  updateAdminEntity,
} from "$lib/server/workflows/admin";
import type { AppDatabase } from "./client";
import type { PermissionConfig } from "$lib/server/services/authorization";

export type DeleteActionOptions = {
  readonly entityName: string;
  readonly idType?: "number" | "string";
  readonly field?: string;
  readonly permission?: PermissionConfig;
  readonly delete: (database: AppDatabase, id: number | string) => PromiseLike<unknown>;
};

export function createDeleteAction(options: DeleteActionOptions) {
  return async ({ request, locals }: { request: Request; locals: App.Locals }) => {
    const result = await runServerEffect(
      deleteAdminEntity({
        formData: await request.formData(),
        user: locals.user,
        field: options.field ?? "id",
        idType: options.idType ?? "number",
        entityName: options.entityName,
        permission: options.permission,
        delete: options.delete,
      }),
    );

    if (isBoundarySuccess(result)) return result.value;
    return actionFailure(result, "message", `Erreur lors de la suppression`);
  };
}

export type CrudActionsOptions = {
  readonly entityName: string;
  readonly idType?: "number" | "string";
  readonly formFieldName?: string;
  readonly create: (database: AppDatabase, name: string) => PromiseLike<unknown>;
  readonly update: (
    database: AppDatabase,
    id: number | string,
    name: string,
  ) => PromiseLike<unknown>;
  readonly delete: (database: AppDatabase, id: number | string) => PromiseLike<unknown>;
};

export function createCrudActions(options: CrudActionsOptions): Actions {
  const formFieldName = options.formFieldName ?? "name";
  const idType = options.idType ?? "number";

  return {
    create: async ({ request }) => {
      const result = await runServerEffect(
        createAdminEntity({
          formData: await request.formData(),
          field: formFieldName,
          entityName: options.entityName,
          create: options.create,
        }),
      );

      if (isBoundarySuccess(result)) return result.value;
      return actionFailure(
        result,
        "message",
        `Erreur lors de la création de ${options.entityName}`,
      );
    },
    update: async ({ request }) => {
      const result = await runServerEffect(
        updateAdminEntity({
          formData: await request.formData(),
          field: formFieldName,
          idType,
          entityName: options.entityName,
          update: options.update,
        }),
      );

      if (isBoundarySuccess(result)) return result.value;
      return actionFailure(
        result,
        "message",
        `Erreur lors de la mise à jour de ${options.entityName}`,
      );
    },
    delete: createDeleteAction({
      entityName: options.entityName,
      idType,
      delete: options.delete,
    }),
  };
}
