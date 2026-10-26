import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { Effect } from "effect";
import { ForbiddenError, UnauthenticatedError } from "$lib/effect/errors";
import * as schema from "$lib/server/db/schema";
import { Database, makeDatabaseService } from "$lib/server/services/database";
import { loadCerfaPem, loadCerfaProjects } from "$lib/server/workflows/cerfa";

vi.mock("$env/dynamic/private", () => ({ env: {} }));

describe("CERFA PEM inventory", () => {
  let client: Client;
  let database: ReturnType<typeof makeDatabaseService>;

  beforeEach(async () => {
    client = createClient({ url: ":memory:" });
    const db = drizzle(client, { schema });
    database = makeDatabaseService(() => db);
    await client.executeMultiple(`
      CREATE TABLE projet (id TEXT PRIMARY KEY, libelle TEXT, reference TEXT);
      CREATE TABLE user_projet (user_id TEXT, projet_id TEXT);
      CREATE TABLE groupe (id INTEGER PRIMARY KEY, groupe TEXT);
      CREATE TABLE categorie_v2 (id INTEGER PRIMARY KEY, groupe_id INTEGER, categoriev2 TEXT);
      CREATE TABLE objets (
        id INTEGER PRIMARY KEY, categorie_id INTEGER, objet TEXT, unite TEXT,
        masse_unitaire TEXT, depose_reemlpoi TEXT
      );
      CREATE TABLE pemd (
        id TEXT PRIMARY KEY, sid_id TEXT, objet_id INTEGER, quantite REAL,
        reemploi INTEGER, potentiel_reemploi TEXT
      );
      INSERT INTO projet VALUES
        ('project-a', 'Projet A', 'REF-A'), ('project-b', 'Projet B', 'REF-B'),
        ('empty-project', 'Projet vide', 'REF-EMPTY');
      INSERT INTO user_projet VALUES ('member', 'project-a'), ('member', 'empty-project');
      INSERT INTO groupe VALUES (1, 'Second œuvre');
      INSERT INTO categorie_v2 VALUES (10, 1, 'Menuiseries');
      INSERT INTO objets VALUES (100, 10, 'Porte', 'u', '999', NULL);
      INSERT INTO objets VALUES (101, 10, 'Catalogue seulement', 'u', '123', 'Réemploi');
      INSERT INTO pemd VALUES
        ('reuse-a', 'project-a', 100, 7.5, 1, NULL),
        ('reuse-zero', 'project-a', 100, 0, 1, NULL),
        ('reuse-unknown-quantity', 'project-a', 100, NULL, 1, NULL),
        ('reuse-potential', 'project-a', 100, 3, NULL, 'Fort'),
        ('waste-a', 'project-a', 100, 20, 0, 'Nul'),
        ('reuse-b', 'project-b', 100, 99, 1, NULL);
    `);
  });

  afterEach(() => client.close());

  function load(projectId: string | null, user = { id: "member", role: "user" }) {
    return Effect.runPromise(
      loadCerfaPem({ projectId, user }).pipe(Effect.provideService(Database, database)),
    );
  }

  it("loads authorized project inventory with taxonomy and actual quantities despite empty catalogue reuse metadata", async () => {
    const result = await load("project-a");

    expect(result.projetInfo).toEqual({ id: "project-a", libelle: "Projet A", reference: "REF-A" });
    expect(result.items.map((item) => item.id).sort()).toEqual([
      "reuse-a",
      "reuse-potential",
      "reuse-unknown-quantity",
      "reuse-zero",
    ]);
    expect(result.items.find((item) => item.id === "reuse-a")).toMatchObject({
      objet: "Porte",
      categorie: "Menuiseries",
      groupe: "Second œuvre",
      unite: "u",
      quantite: 7.5,
    });
    expect(result.items.find((item) => item.id === "reuse-zero")?.quantite).toBe(0);
    expect(result.items.find((item) => item.id === "reuse-unknown-quantity")?.quantite).toBeNull();
  });

  it("rejects an unassigned project from accessing its inventory", async () => {
    const result = await Effect.runPromise(
      loadCerfaPem({ projectId: "project-b", user: { id: "member", role: "user" } }).pipe(
        Effect.provideService(Database, database),
        Effect.result,
      ),
    );

    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") expect(result.failure).toBeInstanceOf(ForbiddenError);
  });

  it("rejects unauthenticated project requests ", async () => {
    const result = await Effect.runPromise(
      loadCerfaPem({ projectId: "project-a", user: null }).pipe(
        Effect.provideService(Database, database),
        Effect.result,
      ),
    );

    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") expect(result.failure).toBeInstanceOf(UnauthenticatedError);
  });

  it("returns an empty selection without returning global inventory", async () => {
    expect(await load(null)).toEqual({ items: [], projetInfo: null });
  });
  it("resolves a stable default project and preserves an explicitly selected accessible project", async () => {
    const resolve = (projectId: string | null) =>
      Effect.runPromise(
        loadCerfaProjects({ projectId, user: { id: "member", role: "user" } }).pipe(
          Effect.provideService(Database, database),
        ),
      );
    expect((await resolve(null)).cerfaProject?.id).toBe("project-a");
    expect((await resolve("empty-project")).cerfaProject?.id).toBe("empty-project");
    await expect(resolve("project-b")).rejects.toMatchObject({ _tag: "NotFoundError" });
  });
});
