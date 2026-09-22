import "dotenv/config";

import { Layer } from "effect";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

import { makeCliRuntime, runCliEffect } from "../src/lib/cli/effect/runtime.ts";
import {
  AdminDatabase,
  createCliDatabase,
  makeAdminDatabaseService,
} from "../src/lib/cli/services/database.ts";
import {
  AdminAuthentication,
  makeAdminAuthenticationService,
} from "../src/lib/cli/services/authentication.ts";
import { createAdmin } from "../src/lib/cli/workflows/admin.ts";

type Arguments = {
  email?: string;
  name?: string;
  help: boolean;
};

function parseArguments(args: string[]): Arguments {
  const parsed: Arguments = { help: false };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === "--help" || argument === "-h") {
      parsed.help = true;
      continue;
    }

    const [flag, inlineValue] = argument.split("=", 2);
    if (flag !== "--email" && flag !== "--name") {
      throw new Error(`Unknown argument: ${argument}`);
    }

    const value = inlineValue ?? args[++index];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${flag}`);
    }

    if (flag === "--email") parsed.email = value;
    if (flag === "--name") parsed.name = value;
  }

  return parsed;
}

function printUsage() {
  console.log(`Usage:
  deno task admin:create --email admin@example.com --name "Admin Name"

Options:
  --email  Email address for the new administrator
  --name   Display name for the new administrator
  -h, --help  Show this help`);
}

function requireEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required in .env or the process environment`);
  return value;
}

function displayDatabaseUrl(value: string): string {
  try {
    const url = new URL(value);
    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "[invalid database URL]";
  }
}

async function readHidden(label: string): Promise<string> {
  if (!stdin.isTTY || !stdout.isTTY || typeof stdin.setRawMode !== "function") {
    throw new Error("An interactive terminal is required to enter the password securely");
  }

  stdout.write(label);
  stdin.setEncoding("utf8");
  stdin.setRawMode(true);
  stdin.resume();

  return await new Promise<string>((resolve, reject) => {
    let value = "";

    const finish = (error?: Error) => {
      stdin.removeListener("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\n");

      if (error) reject(error);
      else resolve(value);
    };

    const onData = (chunk: string) => {
      for (const character of chunk) {
        if (character === "\u0003") {
          finish(new Error("Cancelled"));
          return;
        }

        if (character === "\r" || character === "\n") {
          finish();
          return;
        }

        if (character === "\u007f" || character === "\b") {
          value = value.slice(0, -1);
          continue;
        }

        if (character >= " ") value += character;
      }
    };

    stdin.on("data", onData);
  });
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  if (args.help) {
    printUsage();
    return;
  }

  const email = args.email?.trim().toLowerCase();
  const name = args.name?.trim();
  if (!email || !name) {
    printUsage();
    throw new Error("Both --email and --name are required");
  }

  const databaseUrl = requireEnvironment("TURSO_CONNECTION_URL");
  const authToken = requireEnvironment("TURSO_AUTH_TOKEN");
  const authSecret = requireEnvironment("BETTER_AUTH_SECRET");

  console.log(`Target database: ${displayDatabaseUrl(databaseUrl)}`);
  console.log(`Administrator: ${name} <${email}>`);

  const prompt = createInterface({ input: stdin, output: stdout });
  let confirmation: string;
  try {
    confirmation = await prompt.question('Type "create admin" to continue: ');
  } finally {
    prompt.close();
  }
  if (confirmation !== "create admin") throw new Error("Cancelled");

  const password = await readHidden("Password: ");
  const passwordConfirmation = await readHidden("Confirm password: ");
  if (password.length < 8) throw new Error("Password must contain at least 8 characters");
  if (password !== passwordConfirmation) throw new Error("Passwords do not match");

  const resources = createCliDatabase({ url: databaseUrl, authToken });
  const runtime = makeCliRuntime(
    Layer.merge(
      Layer.succeed(AdminDatabase, makeAdminDatabaseService(resources.database)),
      Layer.succeed(
        AdminAuthentication,
        makeAdminAuthenticationService({
          secret: authSecret,
          baseURL: process.env.BETTER_AUTH_URL,
        }),
      ),
    ),
  );

  try {
    const result = await runCliEffect(runtime, createAdmin({ email, name, password }));
    if (result._tag === "failure") throw result.error;
    if (result._tag === "defect") throw result.cause;
    console.log(`Created administrator ${result.value.email}`);
  } finally {
    await runtime.dispose();
    resources.close();
  }
}

if (import.meta.main) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Admin creation failed: ${message}`);
    process.exitCode = 1;
  });
}
