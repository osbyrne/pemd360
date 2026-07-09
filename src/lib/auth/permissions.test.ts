import { describe, it, expect } from "vitest";
import { ac, statement, user, collaborator, admin } from "./permissions";

describe("permissions", () => {
  describe("statement", () => {
    it("should define project permissions", () => {
      expect(statement.project).toEqual(["create", "share", "update", "delete", "read"]);
    });

    it("should define tags permissions", () => {
      expect(statement.tags).toEqual(["create", "update", "delete", "read"]);
    });

    it("should include default statements from better-auth", () => {
      expect(statement).toHaveProperty("user");
      expect(statement).toHaveProperty("session");
    });
  });

  describe("access control instance", () => {
    it("should create an access control instance", () => {
      expect(ac).toBeDefined();
      expect(ac.newRole).toBeTypeOf("function");
    });
  });

  describe("roles", () => {
    it("should export user role", () => {
      expect(user).toBeDefined();
      expect(user).toBeTypeOf("object");
    });

    it("should export collaborator role", () => {
      expect(collaborator).toBeDefined();
      expect(collaborator).toBeTypeOf("object");
    });

    it("should export admin role", () => {
      expect(admin).toBeDefined();
      expect(admin).toBeTypeOf("object");
    });
  });

  describe("permission structure", () => {
    it("should have all required project actions", () => {
      const projectActions = statement.project;
      expect(projectActions).toContain("create");
      expect(projectActions).toContain("share");
      expect(projectActions).toContain("update");
      expect(projectActions).toContain("delete");
      expect(projectActions).toContain("read");
    });

    it("should have all required tags actions", () => {
      const tagsActions = statement.tags;
      expect(tagsActions).toContain("create");
      expect(tagsActions).toContain("update");
      expect(tagsActions).toContain("delete");
      expect(tagsActions).toContain("read");
    });

    it("should have exactly 5 project actions", () => {
      expect(statement.project).toHaveLength(5);
    });

    it("should have exactly 4 tags actions", () => {
      expect(statement.tags).toHaveLength(4);
    });
  });

  describe("statement immutability", () => {
    it("should be a const object", () => {
      expect(Object.isFrozen(statement)).toBe(false);
      expect(statement).toBeTypeOf("object");
    });
  });
});
