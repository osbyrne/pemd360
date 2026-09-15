import { Context, Effect, Layer } from "effect";
import ExcelJS from "exceljs";
import { ReportGenerationError } from "$lib/effect/errors";
import { renderCerfaPdf, type CerfaPdfData } from "$lib/server/cerfa";
import {
  generateDechetsExcel,
  generatePemExcel,
  generateReemploiExcel,
  generateRiskExcel,
  generateTableauSyntheseExcel,
  generateTableauSyntheseReemploiExcel,
  type PemExcelRow,
  type ReemploiExcelRow,
  type RiskExcelRow,
  type SynthesisExcelRow,
  type WasteExcelRow,
} from "$lib/server/excel";

export interface ReportService {
  readonly generateRiskExcel: (
    data: readonly RiskExcelRow[],
    type: string,
  ) => Effect.Effect<ExcelJS.Buffer, ReportGenerationError>;
  readonly generateDechetsExcel: (
    data: readonly WasteExcelRow[],
  ) => Effect.Effect<ExcelJS.Buffer, ReportGenerationError>;
  readonly generatePemExcel: (
    data: readonly PemExcelRow[],
  ) => Effect.Effect<ExcelJS.Buffer, ReportGenerationError>;
  readonly generateReemploiExcel: (
    data: readonly ReemploiExcelRow[],
  ) => Effect.Effect<ExcelJS.Buffer, ReportGenerationError>;
  readonly generateTableauSyntheseExcel: (
    data: readonly SynthesisExcelRow[],
  ) => Effect.Effect<ExcelJS.Buffer, ReportGenerationError>;
  readonly generateTableauSyntheseReemploiExcel: (
    data: readonly SynthesisExcelRow[],
  ) => Effect.Effect<ExcelJS.Buffer, ReportGenerationError>;
  readonly renderCerfaPdf: (
    data: CerfaPdfData,
    templateBuffer: ArrayBuffer | Uint8Array,
  ) => Effect.Effect<Uint8Array, ReportGenerationError>;
}

export class Report extends Context.Tag("pemd360/Report")<Report, ReportService>() {}

export function makeReportService(
  adapters: {
    readonly generateRiskExcel?: typeof generateRiskExcel;
    readonly generateDechetsExcel?: typeof generateDechetsExcel;
    readonly generatePemExcel?: typeof generatePemExcel;
    readonly generateReemploiExcel?: typeof generateReemploiExcel;
    readonly generateTableauSyntheseExcel?: typeof generateTableauSyntheseExcel;
    readonly generateTableauSyntheseReemploiExcel?: typeof generateTableauSyntheseReemploiExcel;
    readonly renderCerfaPdf?: typeof renderCerfaPdf;
  } = {},
): ReportService {
  const risk = adapters.generateRiskExcel ?? generateRiskExcel;
  const waste = adapters.generateDechetsExcel ?? generateDechetsExcel;
  const pem = adapters.generatePemExcel ?? generatePemExcel;
  const reuse = adapters.generateReemploiExcel ?? generateReemploiExcel;
  const synthesis = adapters.generateTableauSyntheseExcel ?? generateTableauSyntheseExcel;
  const synthesisReuse =
    adapters.generateTableauSyntheseReemploiExcel ?? generateTableauSyntheseReemploiExcel;
  const cerfa = adapters.renderCerfaPdf ?? renderCerfaPdf;

  return {
    generateRiskExcel: (data, type) => reportEffect("report.risk-excel", () => risk(data, type)),
    generateDechetsExcel: (data) => reportEffect("report.waste-excel", () => waste(data)),
    generatePemExcel: (data) => reportEffect("report.pem-excel", () => pem(data)),
    generateReemploiExcel: (data) => reportEffect("report.reuse-excel", () => reuse(data)),
    generateTableauSyntheseExcel: (data) =>
      reportEffect("report.synthesis-excel", () => synthesis(data)),
    generateTableauSyntheseReemploiExcel: (data) =>
      reportEffect("report.synthesis-reuse-excel", () => synthesisReuse(data)),
    renderCerfaPdf: (data, templateBuffer) =>
      reportEffect("report.cerfa-pdf", () => cerfa(data, templateBuffer)),
  };
}

function reportEffect<A>(operation: string, execute: () => PromiseLike<A>) {
  return Effect.tryPromise({
    try: execute,
    catch: (cause) =>
      new ReportGenerationError({
        message: "La génération du rapport a échoué",
        operation,
        cause,
      }),
  });
}

export const ReportLive = Layer.succeed(Report, makeReportService());
